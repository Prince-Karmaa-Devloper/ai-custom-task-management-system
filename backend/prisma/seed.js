const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Roles
  console.log('Creating roles...');
  const roles = await Promise.all([
    prisma.role.create({
      data: { name: 'SUPER_ADMIN', description: 'Super Admin with full access' }
    }),
    prisma.role.create({
      data: { name: 'ADMIN', description: 'Admin with company management' }
    }),
    prisma.role.create({
      data: { name: 'MANAGER', description: 'Manager with team management' }
    }),
    prisma.role.create({
      data: { name: 'EMPLOYEE', description: 'Employee with basic access' }
    })
  ]);

  // 2. Create Global Tenant for Super Admin
  console.log('Creating global tenant...');
  const globalTenant = await prisma.tenant.create({
    data: { name: 'Global', domain: 'global', isActive: true }
  });

  // 3. Create Company Tenants
  console.log('Creating company tenants...');
  const tenants = await Promise.all([
    prisma.tenant.create({ data: { name: 'TechCorp Inc', domain: 'techcorp', isActive: true }}),
    prisma.tenant.create({ data: { name: 'Innovate LLC', domain: 'innovate', isActive: true }})
  ]);

  // 4. Create Super Admin
  console.log('Creating super admin...');
  const hashedPassword = await bcrypt.hash('123456', 10);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@test.com',
      password: hashedPassword,
      name: 'Super Admin',
      avatar: 'SA',
      roleId: roles.find(r => r.name === 'SUPER_ADMIN').id,
      tenantId: globalTenant.id,
      linkedin: 'https://linkedin.com/in/superadmin',
      skills: ['Leadership', 'Strategy', 'Product Management'],
      knowledge: ['WordPress', 'Laravel', 'React', 'Node.js', 'Python']
    }
  });

  // 5. Create Users for TechCorp (Tenant 0)
  console.log('Creating users for TechCorp...');
  const techcorpRoles = roles;
  const techcorpTenant = tenants[0];
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin1@test.com', password: hashedPassword, name: 'Admin 1', avatar: 'A1',
      roleId: techcorpRoles.find(r => r.name === 'ADMIN').id, tenantId: techcorpTenant.id, parentId: superAdmin.id,
      linkedin: 'https://linkedin.com/in/admin1', skills: ['Management', 'Team Building', 'Agile'], knowledge: ['WordPress', 'Laravel']
    }
  });

  const admin1Manager1 = await prisma.user.create({
    data: {
      email: 'admin1-manager1@test.com', password: hashedPassword, name: 'Admin1 Manager1', avatar: 'AM1',
      roleId: techcorpRoles.find(r => r.name === 'MANAGER').id, tenantId: techcorpTenant.id, parentId: admin1.id,
      linkedin: 'https://linkedin.com/in/admin1-manager1', skills: ['Project Management', 'Scrum'], knowledge: ['React', 'Node.js']
    }
  });

  const admin1Manager2 = await prisma.user.create({
    data: {
      email: 'admin1-manager2@test.com', password: hashedPassword, name: 'Admin1 Manager2', avatar: 'AM2',
      roleId: techcorpRoles.find(r => r.name === 'MANAGER').id, tenantId: techcorpTenant.id, parentId: admin1.id,
      linkedin: 'https://linkedin.com/in/admin1-manager2', skills: ['Design', 'UI/UX'], knowledge: ['WordPress', 'React']
    }
  });

  const a1m1Emp1 = await prisma.user.create({
    data: {
      email: 'a1m1-emp1@test.com', password: hashedPassword, name: 'Admin1 Manager1 Employee1', avatar: 'A1M1E1',
      roleId: techcorpRoles.find(r => r.name === 'EMPLOYEE').id, tenantId: techcorpTenant.id, parentId: admin1Manager1.id,
      linkedin: 'https://linkedin.com/in/a1m1-emp1', skills: ['React Development', 'JavaScript', 'CSS'], knowledge: ['React', 'Node.js']
    }
  });

  const a1m1Emp2 = await prisma.user.create({
    data: {
      email: 'a1m1-emp2@test.com', password: hashedPassword, name: 'Admin1 Manager1 Employee2', avatar: 'A1M1E2',
      roleId: techcorpRoles.find(r => r.name === 'EMPLOYEE').id, tenantId: techcorpTenant.id, parentId: admin1Manager1.id,
      linkedin: 'https://linkedin.com/in/a1m1-emp2', skills: ['Backend Development', 'PHP'], knowledge: ['Laravel', 'WordPress']
    }
  });

  // 6. Create Projects for TechCorp
  console.log('Creating projects for TechCorp...');
  const projects = [];
  const projectData = [
    { name: 'E-commerce Platform', siteName: 'ShopNow', basecampUrl: 'https://basecamp.com/project-1', websiteUrl: 'https://project-1.com' },
    { name: 'CRM System', siteName: 'CustomerFirst', basecampUrl: 'https://basecamp.com/project-2', websiteUrl: 'https://project-2.com' },
    { name: 'Mobile App', siteName: 'MobileFirst', basecampUrl: 'https://basecamp.com/project-3', websiteUrl: 'https://project-3.com' }
  ];
  for (const pd of projectData) {
    const project = await prisma.project.create({
      data: { ...pd, tenantId: techcorpTenant.id, createdBy: admin1.id }
    });
    projects.push(project);
  }

  // 7. Create Tickets for TechCorp
  console.log('Creating tickets for TechCorp...');
  const statuses = ['Pending', 'In Progress', 'Completed', 'Posted', 'Reassigned'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const sources = ['Email', 'WhatsApp', 'Basecamp', 'Slack', 'Manual'];
  const ticketTitles = ['Fix login page bug', 'Implement user authentication', 'Update dashboard design', 'Create API docs', 'Optimize database queries'];
  const descriptions = ['This ticket requires immediate attention to fix critical functionality.', 'Please implement the requested feature following the specifications.', 'Update the design according to the latest mockups provided.', 'Optimize the codebase for better performance and maintainability.', 'Fix this issue as it is affecting user experience.'];
  
  const employees = [a1m1Emp1, a1m1Emp2];
  for (let i = 0; i < 50; i++) {
    await prisma.ticket.create({
      data: {
        ticketId: `TCKT-${1000 + i}`,
        title: ticketTitles[i % ticketTitles.length],
        description: descriptions[i % descriptions.length],
        projectId: projects[i % projects.length].id,
        assignedTo: employees[i % employees.length].id,
        managedBy: admin1Manager1.id,
        createdBy: admin1.id,
        tenantId: techcorpTenant.id,
        status: statuses[i % statuses.length],
        priority: priorities[i % priorities.length],
        source: sources[i % sources.length],
        emailSubject: i % 5 === 0 ? 'Urgent: Login Page Not Working' : null,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        estimatedHours: Math.floor(Math.random() * 40) + 5,
        actualHours: Math.floor(Math.random() * 30) + 1,
        aiScore: Math.floor(Math.random() * 100)
      }
    });
  }

  // 8. Create White Label Settings
  console.log('Creating white label settings...');
  await prisma.whiteLabelSettings.create({
    data: {
      tenantId: techcorpTenant.id,
      companyName: 'TechCorp Inc',
      dashboardTitle: 'TechCorp Dashboard',
      primaryColor: '#667eea',
      secondaryColor: '#764ba2'
    }
  });

  // 9. Create Integrations
  console.log('Creating integrations...');
  const integrationTypes = ['Email', 'Slack', 'WhatsApp'];
  for (const type of integrationTypes) {
    await prisma.integration.create({
      data: {
        name: type,
        type,
        status: 'connected',
        tenantId: techcorpTenant.id,
        lastSync: new Date()
      }
    });
  }

  console.log('✅ Database seeding completed!');
  console.log('📝 Login credentials:');
  console.log('   - superadmin@test.com / 123456');
  console.log('   - admin1@test.com / 123456');
  console.log('   - admin1-manager1@test.com / 123456');
  console.log('   - a1m1-emp1@test.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
