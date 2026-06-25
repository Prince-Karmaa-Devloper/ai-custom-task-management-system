
const { PrismaClient: PrismaMain } = require('@prisma-main/client');
const { PrismaClient: PrismaTenant } = require('@prisma-tenant/client');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const mainPrisma = new PrismaMain();

async function createPostgresDatabase(dbName) {
  const adminPool = new Pool({
    host: process.env.DB_ADMIN_HOST || 'localhost',
    port: parseInt(process.env.DB_ADMIN_PORT) || 5432,
    user: process.env.DB_ADMIN_USER || 'postgres',
    password: process.env.DB_ADMIN_PASSWORD || 'root',
    database: process.env.DB_ADMIN_DATABASE || 'postgres'
  });

  try {
    const checkResult = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`⚠️ Database already exists: ${dbName}`);
      return;
    }

    await adminPool.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ Created database: ${dbName}`);
  } finally {
    await adminPool.end();
  }
}

async function runTenantMigrations(dbName) {
  console.log(`⚙️ Running migrations on: ${dbName}`);

  const tenantDbUrl = `postgresql://${process.env.DB_ADMIN_USER || 'postgres'}:${process.env.DB_ADMIN_PASSWORD || 'root'}@${process.env.DB_ADMIN_HOST || 'localhost'}:${process.env.DB_ADMIN_PORT || 5432}/${dbName}?schema=public`;

  try {
    const schemaPath = path.join(__dirname, 'prisma-tenant/schema.prisma');
    const migrationsPath = path.join(__dirname, 'prisma-tenant/migrations');

    if (!fs.existsSync(migrationsPath)) {
      fs.mkdirSync(migrationsPath, { recursive: true });
    }

    try {
      execSync(`npx prisma migrate dev --name init --schema="${schemaPath}"`, {
        env: { ...process.env, TENANT_DATABASE_URL: tenantDbUrl },
        stdio: 'inherit'
      });
    } catch (e) {
      console.log('Migration may already exist, trying to deploy...');
      execSync(`npx prisma migrate deploy --schema="${schemaPath}"`, {
        env: { ...process.env, TENANT_DATABASE_URL: tenantDbUrl },
        stdio: 'inherit'
      });
    }

    console.log(`✅ Migrations completed for: ${dbName}`);
  } catch (error) {
    console.error('Error running migrations:', error);
    throw new Error('Failed to run migrations');
  }
}

async function seedTenantDatabase(dbName, seedData) {
  const tenantDbUrl = `postgresql://${process.env.DB_ADMIN_USER || 'postgres'}:${process.env.DB_ADMIN_PASSWORD || 'root'}@${process.env.DB_ADMIN_HOST || 'localhost'}:${process.env.DB_ADMIN_PORT || 5432}/${dbName}?schema=public`;

  const tenantPrisma = new PrismaTenant({
    datasources: {
      db: { url: tenantDbUrl }
    }
  });

  try {
    await tenantPrisma.$connect();

    const permissions = [
      { name: 'users.create', description: 'Create users', resource: 'users', action: 'create' },
      { name: 'users.read', description: 'Read users', resource: 'users', action: 'read' },
      { name: 'users.update', description: 'Update users', resource: 'users', action: 'update' },
      { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
      { name: 'projects.create', description: 'Create projects', resource: 'projects', action: 'create' },
      { name: 'projects.read', description: 'Read projects', resource: 'projects', action: 'read' },
      { name: 'projects.update', description: 'Update projects', resource: 'projects', action: 'update' },
      { name: 'projects.delete', description: 'Delete projects', resource: 'projects', action: 'delete' },
      { name: 'tickets.create', description: 'Create tickets', resource: 'tickets', action: 'create' },
      { name: 'tickets.read', description: 'Read tickets', resource: 'tickets', action: 'read' },
      { name: 'tickets.update', description: 'Update tickets', resource: 'tickets', action: 'update' },
      { name: 'tickets.delete', description: 'Delete tickets', resource: 'tickets', action: 'delete' },
      { name: 'reports.read', description: 'Read reports', resource: 'reports', action: 'read' },
      { name: 'settings.update', description: 'Update settings', resource: 'settings', action: 'update' }
    ];

    const createdPermissions = await Promise.all(
      permissions.map(p => tenantPrisma.permission.create({ data: p }))
    );

    const [adminRole, managerRole, employeeRole] = await Promise.all([
      tenantPrisma.role.create({ data: { name: 'ADMIN', description: 'Company Administrator' } }),
      tenantPrisma.role.create({ data: { name: 'MANAGER', description: 'Manager' } }),
      tenantPrisma.role.create({ data: { name: 'EMPLOYEE', description: 'Employee' } })
    ]);

    await Promise.all(
      createdPermissions.map(p => 
        tenantPrisma.rolePermission.create({
          data: { roleId: adminRole.id, permissionId: p.id }
        })
      )
    );

    const managerPermissions = createdPermissions.filter(p => 
      ['users.read', 'projects.create', 'projects.read', 'projects.update', 'tickets.create', 'tickets.read', 'tickets.update', 'reports.read'].includes(p.name)
    );
    await Promise.all(
      managerPermissions.map(p => 
        tenantPrisma.rolePermission.create({
          data: { roleId: managerRole.id, permissionId: p.id }
        })
      )
    );

    const employeePermissions = createdPermissions.filter(p => 
      ['tickets.create', 'tickets.read'].includes(p.name)
    );
    await Promise.all(
      employeePermissions.map(p => 
        tenantPrisma.rolePermission.create({
          data: { roleId: employeeRole.id, permissionId: p.id }
        })
      )
    );

    const users = [];
    let adminUser, managerUser;
    for (const userData of seedData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      let roleId, parentId = null;
      if (userData.role === 'ADMIN') {
        roleId = adminRole.id;
      } else if (userData.role === 'MANAGER') {
        roleId = managerRole.id;
        parentId = adminUser?.id; // manager reports to admin
      } else {
        roleId = employeeRole.id;
        parentId = managerUser?.id; // employee reports to manager
      }

      const user = await tenantPrisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          avatar: userData.name.charAt(0).toUpperCase(),
          roleId,
          parentId,
          skills: [],
          knowledge: []
        }
      });
      const userWithRole = { ...user, roleName: userData.role };
      if (userData.role === 'ADMIN') adminUser = userWithRole;
      if (userData.role === 'MANAGER') managerUser = userWithRole;
      users.push(userWithRole);
    }

    await tenantPrisma.whiteLabelSetting.create({
      data: {
        companyName: seedData.companyName,
        dashboardTitle: `${seedData.companyName} Dashboard`,
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e'
      }
    });

    const project = await tenantPrisma.project.create({
      data: {
        name: 'Main Project',
        siteName: 'Main Website',
        createdBy: users[0].id
      }
    });

    const managerUser = users.find(u => u.roleName === 'MANAGER');
    const employeeUser = users.find(u => u.roleName === 'EMPLOYEE');

    const ticketsData = [
      {
        ticketId: `TKT-${Date.now()}-1`,
        title: 'Complete project documentation',
        description: 'Please review and complete the project documentation',
        status: 'Pending',
        priority: 'High',
        source: 'Email',
        projectId: project.id,
        assignedTo: employeeUser.id,
        managedBy: managerUser.id,
        createdBy: managerUser.id
      },
      {
        ticketId: `TKT-${Date.now()}-2`,
        title: 'Fix login page bug',
        description: 'Users are reporting issues with the login page',
        status: 'In Progress',
        priority: 'High',
        source: 'Slack',
        projectId: project.id,
        assignedTo: employeeUser.id,
        managedBy: managerUser.id,
        createdBy: managerUser.id
      },
      {
        ticketId: `TKT-${Date.now()}-3`,
        title: 'Update API documentation',
        description: 'Update the API documentation with the latest changes',
        status: 'Pending',
        priority: 'Medium',
        source: 'Basecamp',
        projectId: project.id,
        assignedTo: employeeUser.id,
        managedBy: managerUser.id,
        createdBy: managerUser.id
      }
    ];

    for (const ticketData of ticketsData) {
      await tenantPrisma.ticket.create({ data: ticketData });
    }

    console.log(`✅ Seeded tenant DB: ${dbName}`);

    return { users, project };

  } finally {
    await tenantPrisma.$disconnect();
  }
}

async function main() {
  try {
    console.log('🚀 Starting database setup...');

    console.log('\n📋 Step 1: Clean up main database');
    const allCompanies = await mainPrisma.company.findMany();
    const domainsToKeep = ['developer'];

    for (const company of allCompanies) {
      if (!domainsToKeep.includes(company.domain)) {
        console.log(`🗑️ Deleting company: ${company.name} (${company.domain})`);
        await mainPrisma.companyAuditLog.deleteMany({ where: { companyId: company.id } });
        await mainPrisma.company.delete({ where: { id: company.id } });
        
        try {
          const adminPool = new Pool({
            host: process.env.DB_ADMIN_HOST || 'localhost',
            port: parseInt(process.env.DB_ADMIN_PORT) || 5432,
            user: process.env.DB_ADMIN_USER || 'postgres',
            password: process.env.DB_ADMIN_PASSWORD || 'root',
            database: process.env.DB_ADMIN_DATABASE || 'postgres'
          });
          await adminPool.query(`DROP DATABASE IF EXISTS "${company.databaseName}"`);
          await adminPool.end();
          console.log(`🗑️ Dropped database: ${company.databaseName}`);
        } catch (e) {
          console.log(`⚠️ Could not drop database ${company.databaseName}:`, e.message);
        }
      }
    }

    const superAdminExists = await mainPrisma.superAdmin.findUnique({
      where: { email: 'superadmin@test.com' }
    });

    if (!superAdminExists) {
      const hashedPassword = await bcrypt.hash('12345678', 10);
      await mainPrisma.superAdmin.create({
        data: {
          email: 'superadmin@test.com',
          password: hashedPassword,
          name: 'Super Admin'
        }
      });
      console.log('✅ Created super admin: superadmin@test.com');
    }

    console.log('\n📋 Step 2: Add new companies');
    
    const companiesToAdd = [
      {
        name: 'Karmaa Source',
        domain: 'karmaa-source',
        users: [
          { email: 'admin@karmaa.com', password: '12345678', name: 'Karmaa Admin', role: 'ADMIN' },
          { email: 'manager@karmaa.com', password: '1234567', name: 'Karmaa Manager', role: 'MANAGER' },
          { email: 'employee@karmaa.com', password: '123456', name: 'Karmaa Employee', role: 'EMPLOYEE' }
        ]
      },
      {
        name: 'Admoni',
        domain: 'admoni',
        users: [
          { email: 'admin@admoni.com', password: '12345678', name: 'Admoni Admin', role: 'ADMIN' },
          { email: 'manager@admoni.com', password: '1234567', name: 'Admoni Manager', role: 'MANAGER' },
          { email: 'employee@admoni.com', password: '123456', name: 'Admoni Employee', role: 'EMPLOYEE' }
        ]
      }
    ];

    for (const companyData of companiesToAdd) {
      console.log(`\n🏢 Creating company: ${companyData.name}`);
      
      const dbName = `todolist_${companyData.domain}`;
      
      const company = await mainPrisma.company.create({
        data: {
          name: companyData.name,
          domain: companyData.domain,
          databaseName: dbName
        }
      });

      await createPostgresDatabase(dbName);
      await runTenantMigrations(dbName);
      await seedTenantDatabase(dbName, {
        companyName: companyData.name,
        users: companyData.users
      });

      console.log(`✅ Company ${companyData.name} created successfully!`);
    }

    console.log('\n🎉 Database setup complete!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await mainPrisma.$disconnect();
  }
}

main();
