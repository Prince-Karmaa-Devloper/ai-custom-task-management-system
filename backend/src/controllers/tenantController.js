const { getMainDb, createCompany, updateCompanyStatus } = require('../config/dbManager');

/**
 * Create a new company (tenant)
 */
async function createTenant(req, res) {
  try {
    const { 
      companyName, 
      domain, 
      adminEmail, 
      adminPassword, 
      adminName,
      subscriptionType
    } = req.body;
    
    // Validate input
    if (!companyName || !domain || !adminEmail || !adminPassword || !adminName) {
      return res.status(400).json({ 
        error: 'Missing required fields (companyName, domain, adminEmail, adminPassword, adminName)' 
      });
    }

    const company = await createCompany({
      name: companyName,
      domain: domain.toLowerCase(),
      adminEmail,
      adminPassword,
      adminName,
      createdBy: req.user?.id || null,
      subscriptionType
    });
    
    res.status(201).json({
      message: 'Company created successfully',
      company
    });
    
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: error.message || 'Failed to create company' });
  }
}

/**
 * Get all companies (for super admins)
 */
async function getAllTenants(req, res) {
  try {
    const prisma = getMainDb();
    const companies = await prisma.company.findMany({
      include: {
        auditLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
}

/**
 * Toggle company active status
 */
async function toggleTenantStatus(req, res) {
  try {
    const { companyId } = req.params;
    const { isActive } = req.body;

    const company = await updateCompanyStatus(
      parseInt(companyId), 
      isActive, 
      req.user?.id || null
    );

    res.json({ message: 'Company status updated', company });
  } catch (error) {
    console.error('Error updating company status:', error);
    res.status(500).json({ error: 'Failed to update company status' });
  }
}

/**
 * Get public company info
 */
async function getTenantPublic(req, res) {
  try {
    const { getTenantDbByDomain } = require('../config/dbManager');
    const prisma = await getTenantDbByDomain(req.params.domain);
    let branding = await prisma.whiteLabelSetting.findFirst();

    if (!branding) {
      // Create default branding if none exists
      const company = await prisma.user.findFirst({ where: { roleId: 1 } }); // Find admin user to get company name
      branding = await prisma.whiteLabelSetting.create({
        data: {
          companyName: company?.name || 'AI Task Manager',
          dashboardTitle: `${company?.name || 'AI Task Manager'} Dashboard`,
          primaryColor: '#667eea',
          secondaryColor: '#764ba2'
        }
      });
    }

    res.json({
      domain: req.params.domain,
      companyName: branding.companyName,
      dashboardTitle: branding.dashboardTitle,
      branding
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    if (error.message === 'Company not found' || error.message === 'Company is inactive') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch company' });
  }
}

module.exports = {
  createTenant,
  getAllTenants,
  getTenantPublic,
  toggleTenantStatus
};
