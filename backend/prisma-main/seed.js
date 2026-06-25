const { PrismaClient } = require('@prisma-main/client');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { PrismaClient: PrismaTenant } = require('@prisma-tenant/client');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Database admin configuration
const ADMIN_DB_CONFIG = {
  host: process.env.DB_ADMIN_HOST || 'localhost',
  port: parseInt(process.env.DB_ADMIN_PORT) || 5432,
  user: process.env.DB_ADMIN_USER || 'postgres',
  password: process.env.DB_ADMIN_PASSWORD || 'root',
  database: process.env.DB_ADMIN_DATABASE || 'postgres'
};

async function createTenantDatabase(dbName) {
  const adminPool = new Pool(ADMIN_DB_CONFIG);
  
  try {
    // Check if database already exists
    const checkResult = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`Database ${dbName} already exists, skipping creation`);
      return;
    }

    await adminPool.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created database: ${dbName}`);
  } finally {
    await adminPool.end();
  }
}

async function runTenantMigrations(dbName) {
  console.log(`⚙️ Running migrations on: ${dbName}`);
  const tenantDbUrl = `postgresql://${ADMIN_DB_CONFIG.user}:${ADMIN_DB_CONFIG.password}@${ADMIN_DB_CONFIG.host}:${ADMIN_DB_CONFIG.port}/${dbName}?schema=public`;

  try {
    const schemaPath = path.join(__dirname, '../prisma-tenant/schema.prisma');
    
    execSync(`npx prisma migrate deploy --schema="${schemaPath}"`, {
      env: { ...process.env, TENANT_DATABASE_URL: tenantDbUrl },
      stdio: 'inherit'
    });

    console.log(`✅ Migrations completed for: ${dbName}`);
  } catch (error) {
    console.error('Error running migrations:', error);
    throw new Error('Failed to run migrations');
  }
}

async function seedTenantDatabase(dbName, companyData) {
  const tenantDbUrl = `postgresql://${ADMIN_DB_CONFIG.user}:${ADMIN_DB_CONFIG.password}@${ADMIN_DB_CONFIG.host}:${ADMIN_DB_CONFIG.port}/${dbName}?schema=public`;
  
  const tenantPrisma = new PrismaTenant({
    datasources: {
      db: { url: tenantDbUrl }
    }
  });

  try {
    await tenantPrisma.$connect();
    console.log(`Seeding tenant database: ${dbName}`);

    // Create permissions
    const permissions = await Promise.all([
      tenantPrisma.permission.create({ data: { name: 'users.create', description: 'Create users', resource: 'users', action: 'create' } }),
      tenantPrisma.permission.create({ data: { name: 'users.read', description: 'Read users', resource: 'users', action: 'read' } }),
      tenantPrisma.permission.create({ data: { name: 'users.update', description: 'Update users', resource: 'users', action: 'update' } }),
      tenantPrisma.permission.create({ data: { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' } }),
      tenantPrisma.permission.create({ data: { name: 'projects.create', description: 'Create projects', resource: 'projects', action: 'create' } }),
      tenantPrisma.permission.create({ data: { name: 'projects.read', description: 'Read projects', resource: 'projects', action: 'read' } }),
      tenantPrisma.permission.create({ data: { name: 'projects.update', description: 'Update projects', resource: 'projects', action: 'update' } }),
      tenantPrisma.permission.create({ data: { name: 'projects.delete', description: 'Delete projects', resource: 'projects', action: 'delete' } }),
      tenantPrisma.permission.create({ data: { name: 'tickets.create', description: 'Create tickets', resource: 'tickets', action: 'create' } }),
      tenantPrisma.permission.create({ data: { name: 'tickets.read', description: 'Read tickets', resource: 'tickets', action: 'read' } }),
      tenantPrisma.permission.create({ data: { name: 'tickets.update', description: 'Update tickets', resource: 'tickets', action: 'update' } }),
      tenantPrisma.permission.create({ data: { name: 'tickets.delete', description: 'Delete tickets', resource: 'tickets', action: 'delete' } }),
      tenantPrisma.permission.create({ data: { name: 'reports.read', description: 'Read reports', resource: 'reports', action: 'read' } }),
      tenantPrisma.permission.create({ data: { name: 'settings.update', description: 'Update settings', resource: 'settings', action: 'update' } })
    ]);

    // Create roles
    const adminRole = await tenantPrisma.role.create({ data: { name: 'ADMIN', description: 'Company Administrator' } });
    const managerRole = await tenantPrisma.role.create({ data: { name: 'MANAGER', description: 'Manager' } });
    const employeeRole = await tenantPrisma.role.create({ data: { name: 'EMPLOYEE', description: 'Employee' } });

    // Assign all permissions to ADMIN
    await Promise.all(
      permissions.map(p => 
        tenantPrisma.rolePermission.create({
          data: { roleId: adminRole.id, permissionId: p.id }
        })
      )
    );

    // Assign relevant permissions to MANAGER
    const managerPermissions = permissions.filter(p => 
      ['users.read', 'projects.create', 'projects.read', 'projects.update', 'tickets.create', 'tickets.read', 'tickets.update', 'reports.read'].includes(p.name)
    );
    await Promise.all(
      managerPermissions.map(p => 
        tenantPrisma.rolePermission.create({
          data: { roleId: managerRole.id, permissionId: p.id }
        })
      )
    );

    // Assign basic permissions to EMPLOYEE
    const employeePermissions = permissions.filter(p => 
      ['tickets.create', 'tickets.read'].includes(p.name)
    );
    await Promise.all(
      employeePermissions.map(p => 
        tenantPrisma.rolePermission.create({
          data: { roleId: employeeRole.id, permissionId: p.id }
        })
      )
    );

    // Create admin user
    const hashedPassword = await bcrypt.hash(companyData.adminPassword, 10);
    const adminUser = await tenantPrisma.user.create({
      data: {
        email: companyData.adminEmail,
        password: hashedPassword,
        name: companyData.adminName,
        avatar: companyData.adminName.charAt(0).toUpperCase(),
        roleId: adminRole.id,
        skills: ['Management', 'Leadership'],
        knowledge: ['Company Operations']
      }
    });

    // Create additional users for testing
    const manager = await tenantPrisma.user.create({
      data: {
        email: companyData.managerEmail,
        password: hashedPassword, // '123456'
        name: companyData.managerName,
        avatar: companyData.managerName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 3),
        roleId: managerRole.id,
        parentId: adminUser.id,
        skills: ['Project Management', 'Team Leadership'],
        knowledge: ['Agile', 'Scrum']
      }
    });

    await tenantPrisma.user.create({
      data: {
        email: companyData.employeeEmail,
        password: hashedPassword, // '123456'
        name: companyData.employeeName,
        avatar: companyData.employeeName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 3),
        roleId: employeeRole.id,
        parentId: manager.id,
        skills: ['React', 'JavaScript'],
        knowledge: ['Frontend Development']
      }
    });

    // Create sample project
    const project = await tenantPrisma.project.create({
      data: {
        name: `${companyData.name} Main Project`,
        siteName: 'Main Site',
        websiteUrl: `https://${companyData.domain}.com`,
        status: 'active',
        createdBy: adminUser.id
      }
    });

    // Create sample tickets
    await tenantPrisma.ticket.create({
      data: {
        ticketId: 'TCKT-1001',
        title: 'Implement login feature',
        description: 'Create a secure login system with email and password',
        status: 'In Progress',
        priority: 'High',
        source: 'Manual',
        projectId: project.id,
        assignedTo: manager.id,
        managedBy: adminUser.id,
        createdBy: adminUser.id,
        estimatedHours: 8
      }
    });

    await tenantPrisma.ticket.create({
      data: {
        ticketId: 'TCKT-1002',
        title: 'Design dashboard UI',
        description: 'Create a beautiful dashboard interface',
        status: 'Pending',
        priority: 'Medium',
        source: 'Manual',
        projectId: project.id,
        createdBy: adminUser.id
      }
    });

    // Create white label settings
    await tenantPrisma.whiteLabelSetting.create({
      data: {
        companyName: companyData.name,
        dashboardTitle: `${companyData.name} Dashboard`,
        primaryColor: '#667eea',
        secondaryColor: '#764ba2'
      }
    });

    console.log(`✅ Successfully seeded tenant database: ${dbName}`);
  } catch (error) {
    console.error(`Error seeding tenant database ${dbName}:`, error);
  } finally {
    await tenantPrisma.$disconnect();
  }
}

async function main() {
  console.log('🌱 Starting main database seeding...');

  // Create Super Admin if not exists - aligned with login credentials (superadmin@test.com / 123456)
  const superAdminEmail = 'superadmin@test.com';
  const existingSuperAdmin = await prisma.superAdmin.findUnique({
    where: { email: superAdminEmail }
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await prisma.superAdmin.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        avatar: 'SA'
      }
    });

    console.log(`✅ Super Admin created: ${superAdminEmail} / 123456`);
  } else {
    console.log('ℹ️ Super Admin already exists');
  }

  // Seeding 6 companies with complete hierarchy as per new structure
  const companies = [
    {
      name: 'Admin 1 Company',
      domain: 'admin1',
      adminEmail: 'admin1@test.com',
      adminPassword: '123456',
      adminName: 'Admin 1',
      managerEmail: 'admin1-manager1@test.com',
      managerName: 'Admin1 Manager1',
      employeeEmail: 'a1m1-emp1@test.com',
      employeeName: 'Admin1 Manager1 Employ1'
    },
    {
      name: 'Admin 2 Company',
      domain: 'admin2',
      adminEmail: 'admin2@test.com',
      adminPassword: '123456',
      adminName: 'Admin 2',
      managerEmail: 'admin2-manager1@test.com',
      managerName: 'Admin2 Manager1',
      employeeEmail: 'a2m1-emp1@test.com',
      employeeName: 'Admin2 Manager1 Employ1'
    },
    {
      name: 'Admin 3 Company',
      domain: 'admin3',
      adminEmail: 'admin3@test.com',
      adminPassword: '123456',
      adminName: 'Admin 3',
      managerEmail: 'admin3-manager1@test.com',
      managerName: 'Admin3 Manager1',
      employeeEmail: 'a3m1-emp1@test.com',
      employeeName: 'Admin3 Manager1 Employ1'
    },
    {
      name: 'Karma Corp',
      domain: 'karma',
      adminEmail: 'admin@karma.com',
      adminPassword: '123456',
      adminName: 'Karma Admin',
      managerEmail: 'manager@karma.com',
      managerName: 'Karma Manager',
      employeeEmail: 'employee@karma.com',
      employeeName: 'Karma Employee'
    },
    {
      name: 'WebBiz Solutions',
      domain: 'webbiz',
      adminEmail: 'admin@webbiz.com',
      adminPassword: '123456',
      adminName: 'WebBiz Admin',
      managerEmail: 'manager@webbiz.com',
      managerName: 'WebBiz Manager',
      employeeEmail: 'employee@webbiz.com',
      employeeName: 'WebBiz Employee'
    },
    {
      name: 'Globus Inc',
      domain: 'globus',
      adminEmail: 'admin@globus.com',
      adminPassword: '123456',
      adminName: 'Globus Admin',
      managerEmail: 'manager@globus.com',
      managerName: 'Globus Manager',
      employeeEmail: 'employee@globus.com',
      employeeName: 'Globus Employee'
    }
  ];

  for (const companyData of companies) {
    const dbName = `todolist_${companyData.domain}`;
    
    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { domain: companyData.domain }
    });

    if (!existingCompany) {
      // Create company in main DB
      const company = await prisma.company.create({
        data: {
          name: companyData.name,
          domain: companyData.domain,
          databaseName: dbName,
          subscriptionType: 'basic'
        }
      });

      await prisma.companyAuditLog.create({
        data: {
          companyId: company.id,
          action: 'COMPANY_CREATED',
          details: { companyName: companyData.name, domain: companyData.domain }
        }
      });

      console.log(`✅ Created company: ${companyData.name} (${companyData.domain})`);

      // Create tenant database
      await createTenantDatabase(dbName);

      // Run tenant database migrations
      await runTenantMigrations(dbName);

      // Seed tenant database
      await seedTenantDatabase(dbName, companyData);
    } else {
      console.log(`ℹ️ Company ${companyData.name} already exists, skipping`);
    }
  }

  console.log('\n✅ All seeding complete!');
  console.log('\n📝 Login Credentials:');
  console.log('   Super Admin: http://127.0.0.1:3000/login');
  console.log('   Email: superadmin@test.com');
  console.log('   Password: 123456');
  console.log('\n   Company Admin URLs (all passwords are 123456):');
  companies.forEach(company => {
    console.log(`   ${company.name}: http://127.0.0.1:3000/${company.domain}/login`);
    console.log(`   Admin Email: ${company.adminEmail}`);
    console.log(`   Manager Email: ${company.managerEmail}`);
    console.log(`   Employee Email: ${company.employeeEmail}`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
