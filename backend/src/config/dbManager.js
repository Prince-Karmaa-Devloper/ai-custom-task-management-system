const { PrismaClient: PrismaMain } = require('@prisma-main/client');
const { PrismaClient: PrismaTenant } = require('@prisma-tenant/client');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');
const path = require('path');

// Main Database Connection (Global)
const mainPrisma = new PrismaMain();

// Cache for tenant database connections
const tenantConnections = new Map();

/**
 * Get main database client
 */
function getMainDb() {
  return mainPrisma;
}

/**
 * Validate domain format
 */
function validateDomain(domain) {
  const regex = /^[a-z0-9-]+$/;
  return regex.test(domain);
}

/**
 * Get or create tenant database connection by domain
 */
async function getTenantDbByDomain(domain) {
  // Check cache by domain
  if (tenantConnections.has(domain)) {
    return tenantConnections.get(domain);
  }

  // Get company from main database
  const company = await mainPrisma.company.findUnique({
    where: { domain }
  });

  if (!company) {
    throw new Error('Company not found');
  }

  if (!company.isActive) {
    throw new Error('Company is inactive');
  }

  // Create tenant database URL
  const tenantDbUrl = `postgresql://${company.dbUser}:${company.dbPassword}@${company.dbHost}:${company.dbPort}/${company.databaseName}?schema=public`;

  // Create Prisma client for this tenant
  const tenantPrisma = new PrismaTenant({
    datasources: {
      db: {
        url: tenantDbUrl
      }
    }
  });

  // Connect and cache
  await tenantPrisma.$connect();
  tenantConnections.set(domain, tenantPrisma);

  return tenantPrisma;
}

/**
 * Get or create tenant database connection by company ID
 */
async function getTenantDb(companyId) {
  const company = await mainPrisma.company.findUnique({
    where: { id: companyId }
  });

  if (!company) {
    throw new Error('Company not found');
  }

  return getTenantDbByDomain(company.domain);
}

/**
 * Create a new company/tenant database
 */
async function createCompany(companyData) {
  const { name, domain, adminEmail, adminPassword, adminName, createdBy, subscriptionType = 'basic' } = companyData;

  // Validate domain
  if (!validateDomain(domain)) {
    throw new Error('Invalid domain format. Only lowercase letters, numbers, and hyphens are allowed.');
  }

  // Check if domain already exists
  const existingCompany = await mainPrisma.company.findUnique({
    where: { domain }
  });

  if (existingCompany) {
    throw new Error('Domain already exists');
  }

  // Generate database name
  const dbName = `todolist_${domain}`;

  // Start transaction
  const result = await mainPrisma.$transaction(async (tx) => {
    // Create company in main DB
    const company = await tx.company.create({
      data: {
        name,
        domain,
        databaseName: dbName,
        subscriptionType,
        createdBy
      }
    });

    // Create audit log
    await tx.companyAuditLog.create({
      data: {
        companyId: company.id,
        action: 'COMPANY_CREATED',
        details: { name, domain, adminEmail },
        performedBy: createdBy
      }
    });

    return company;
  });

  try {
    // Create database in PostgreSQL
    await createPostgresDatabase(dbName);

    // Run migrations on new tenant DB
    await runTenantMigrations(dbName);

    // Seed the tenant database
    await seedTenantDatabase(dbName, { 
      email: adminEmail, 
      password: adminPassword, 
      name: adminName, 
      companyName: name 
    });

    // Verify database connection
    await verifyTenantDatabase(dbName);

    // Log success in audit
    await mainPrisma.companyAuditLog.create({
      data: {
        companyId: result.id,
        action: 'DATABASE_CREATED',
        details: { dbName },
        performedBy: createdBy
      }
    });

    return result;
  } catch (error) {
    // Rollback: delete company from main DB
    await mainPrisma.company.delete({
      where: { id: result.id }
    });
    throw error;
  }
}

/**
 * Create database in PostgreSQL
 */
async function createPostgresDatabase(dbName) {
  const adminPool = new Pool({
    host: process.env.DB_ADMIN_HOST || 'localhost',
    port: parseInt(process.env.DB_ADMIN_PORT) || 5432,
    user: process.env.DB_ADMIN_USER || 'postgres',
    password: process.env.DB_ADMIN_PASSWORD || 'root',
    database: process.env.DB_ADMIN_DATABASE || 'postgres'
  });

  try {
    // Check if database already exists
    const checkResult = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`⚠️ Database already exists: ${dbName}`);
      return;
    }

    // Create database
    await adminPool.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ Created database: ${dbName}`);
  } finally {
    await adminPool.end();
  }
}

/**
 * Run migrations on tenant database
 */
async function runTenantMigrations(dbName) {
  console.log(`⚙️ Running migrations on: ${dbName}`);

  const tenantDbUrl = `postgresql://${process.env.DB_ADMIN_USER || 'postgres'}:${process.env.DB_ADMIN_PASSWORD || 'root'}@${process.env.DB_ADMIN_HOST || 'localhost'}:${process.env.DB_ADMIN_PORT || 5432}/${dbName}?schema=public`;

  try {
    // Set environment variable and run migrations
    const schemaPath = path.join(__dirname, '../../prisma-tenant/schema.prisma');
    const migrationsPath = path.join(__dirname, '../../prisma-tenant/migrations');

    // Create migrations directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(migrationsPath)) {
      fs.mkdirSync(migrationsPath, { recursive: true });
    }

    // First, generate the migration if needed
    try {
      execSync(`npx prisma migrate dev --name init --schema="${schemaPath}"`, {
        env: { ...process.env, TENANT_DATABASE_URL: tenantDbUrl },
        stdio: 'inherit'
      });
    } catch (e) {
      // If migration already exists, just apply it
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

/**
 * Seed tenant database with initial data
 */
async function seedTenantDatabase(dbName, seedData) {
  const tenantDbUrl = `postgresql://${process.env.DB_ADMIN_USER || 'postgres'}:${process.env.DB_ADMIN_PASSWORD || 'root'}@${process.env.DB_ADMIN_HOST || 'localhost'}:${process.env.DB_ADMIN_PORT || 5432}/${dbName}?schema=public`;

  const tenantPrisma = new PrismaTenant({
    datasources: {
      db: { url: tenantDbUrl }
    }
  });

  try {
    await tenantPrisma.$connect();

    // Create permissions first
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

    // Create roles
    const [adminRole, managerRole, employeeRole] = await Promise.all([
      tenantPrisma.role.create({ data: { name: 'ADMIN', description: 'Company Administrator' } }),
      tenantPrisma.role.create({ data: { name: 'MANAGER', description: 'Manager' } }),
      tenantPrisma.role.create({ data: { name: 'EMPLOYEE', description: 'Employee' } })
    ]);

    // Assign all permissions to ADMIN
    await Promise.all(
      createdPermissions.map(p => 
        tenantPrisma.rolePermission.create({
          data: { roleId: adminRole.id, permissionId: p.id }
        })
      )
    );

    // Assign relevant permissions to MANAGER
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

    // Assign basic permissions to EMPLOYEE
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

    // Hash password
    const hashedPassword = await bcrypt.hash(seedData.password, 10);

    // Create admin user
    const admin = await tenantPrisma.user.create({
      data: {
        email: seedData.email,
        password: hashedPassword,
        name: seedData.name,
        avatar: seedData.name.charAt(0).toUpperCase(),
        roleId: adminRole.id,
        skills: [],
        knowledge: []
      }
    });

    // Create default white label settings
    await tenantPrisma.whiteLabelSetting.create({
      data: {
        companyName: seedData.companyName,
        dashboardTitle: `${seedData.companyName} Dashboard`,
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e'
      }
    });

    console.log(`✅ Seeded tenant DB: ${dbName}`);

  } finally {
    await tenantPrisma.$disconnect();
  }
}

/**
 * Verify tenant database connection
 */
async function verifyTenantDatabase(dbName) {
  const tenantDbUrl = `postgresql://${process.env.DB_ADMIN_USER || 'postgres'}:${process.env.DB_ADMIN_PASSWORD || 'root'}@${process.env.DB_ADMIN_HOST || 'localhost'}:${process.env.DB_ADMIN_PORT || 5432}/${dbName}?schema=public`;

  const tenantPrisma = new PrismaTenant({
    datasources: {
      db: { url: tenantDbUrl }
    }
  });

  try {
    await tenantPrisma.$connect();
    await tenantPrisma.role.findMany();
    console.log(`✅ Verified database connection: ${dbName}`);
  } finally {
    await tenantPrisma.$disconnect();
  }
}

/**
 * Update company status
 */
async function updateCompanyStatus(companyId, isActive, performedBy) {
  const company = await mainPrisma.company.update({
    where: { id: companyId },
    data: { isActive }
  });

  await mainPrisma.companyAuditLog.create({
    data: {
      companyId,
      action: isActive ? 'COMPANY_ACTIVATED' : 'COMPANY_DEACTIVATED',
      details: { isActive },
      performedBy
    }
  });

  // Clear cache if deactivated
  if (!isActive) {
    tenantConnections.delete(company.domain);
  }

  return company;
}

/**
 * Clear tenant connection cache
 */
function clearTenantCache(domain) {
  if (tenantConnections.has(domain)) {
    tenantConnections.get(domain).$disconnect();
    tenantConnections.delete(domain);
  }
}

module.exports = {
  getMainDb,
  getTenantDb,
  getTenantDbByDomain,
  createCompany,
  updateCompanyStatus,
  validateDomain,
  clearTenantCache
};
