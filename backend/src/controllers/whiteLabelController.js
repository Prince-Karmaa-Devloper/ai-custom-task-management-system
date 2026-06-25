
const getWhiteLabelSettings = async (req, res) => {
  try {
    const prisma = req.tenantDb;
    console.log('Getting white label settings...');
    let settings = await prisma.whiteLabelSetting.findFirst();
    console.log('Found settings:', settings);

    if (!settings) {
      console.log('Creating default white label settings...');
      settings = await prisma.whiteLabelSetting.create({
        data: {
          companyName: 'AI Task Manager',
          dashboardTitle: 'Dashboard',
          primaryColor: '#667eea',
          secondaryColor: '#764ba2'
        }
      });
      console.log('Created default settings:', settings);
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching white label settings:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch white label settings', details: error.message });
  }
};

const updateWhiteLabelSettings = async (req, res) => {
  try {
    const prisma = req.tenantDb;
    console.log('Updating white label settings with body:', req.body);
    const { companyName, dashboardTitle, logoUrl, primaryColor, secondaryColor } = req.body;

    // Check if settings exist
    let settings = await prisma.whiteLabelSetting.findFirst();
    console.log('Existing settings:', settings);

    if (settings) {
      console.log('Updating existing settings...');
      settings = await prisma.whiteLabelSetting.update({
        where: { id: settings.id },
        data: {
          companyName,
          dashboardTitle,
          logoUrl,
          primaryColor,
          secondaryColor
        }
      });
    } else {
      console.log('Creating new settings...');
      settings = await prisma.whiteLabelSetting.create({
        data: {
          companyName,
          dashboardTitle,
          logoUrl,
          primaryColor,
          secondaryColor
        }
      });
    }

    console.log('Updated/created settings:', settings);
    res.json({ message: 'White label settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating white label settings:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to update white label settings', details: error.message });
  }
};

module.exports = {
  getWhiteLabelSettings,
  updateWhiteLabelSettings
};
