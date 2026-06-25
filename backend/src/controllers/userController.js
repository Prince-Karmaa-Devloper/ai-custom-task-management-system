const bcrypt = require('bcryptjs');
const { getMainDb, getTenantDbByDomain } = require('../config/dbManager');

const getUsers = async (req, res) => {
  try {
    if (req.isSuperAdmin) {
      const mainPrisma = getMainDb();
      // Fetch all super admins
      const superAdmins = await mainPrisma.superAdmin.findMany({
        orderBy: { createdAt: 'desc' }
      });

      const sanitizedSuperAdmins = superAdmins.map(({ password, ...user }) => ({
        ...user,
        role: { name: 'SUPER_ADMIN' },
        tenantId: 'global'
      }));

      // Fetch all companies
      const companies = await mainPrisma.company.findMany({
        where: { isActive: true }
      });

      let allTenantUsers = [];
      for (const company of companies) {
        try {
          const tenantPrisma = await getTenantDbByDomain(company.domain);
          const users = await tenantPrisma.user.findMany({
            include: { role: true, parent: true, children: true },
            orderBy: { createdAt: 'desc' }
          });
          const sanitized = users.map(({ password, ...user }) => ({
            ...user,
            tenantId: company.domain
          }));
          allTenantUsers = [...allTenantUsers, ...sanitized];
        } catch (err) {
          console.error(`Error fetching users for tenant ${company.domain}:`, err);
        }
      }

      return res.json([...sanitizedSuperAdmins, ...allTenantUsers]);
    }

    const prisma = req.tenantDb;
    const users = await prisma.user.findMany({
      where: { 
        ...(req.user.role.name !== 'ADMIN' && {
          OR: [
            { id: req.user.id },
            { parentId: req.user.id },
            { parent: { parentId: req.user.id } }
          ]
        })
      },
      include: { role: true, parent: true, children: true },
      orderBy: { createdAt: 'desc' }
    });

    const sanitizedUsers = users.map(({ password, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    let prisma = req.tenantDb;
    if (req.isSuperAdmin) {
      const { tenantId } = req.query;
      if (!tenantId || tenantId === 'global') {
        return res.status(400).json({ error: 'Tenant domain is required' });
      }
      prisma = await getTenantDbByDomain(tenantId);
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { role: true, parent: true, children: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createUser = async (req, res) => {
  try {
    console.log('Create user request body:', req.body);
    let prisma = req.tenantDb;
    const { email, password, name, roleId, parentId, tenantId, skills, knowledge, linkedin, avatar } = req.body;

    if (req.isSuperAdmin) {
      if (!tenantId || tenantId === 'global') {
        return res.status(400).json({ error: 'Tenant domain is required for creating company users' });
      }
      prisma = await getTenantDbByDomain(tenantId);
    }

    let resolvedRoleId = roleId;
    if (!roleId && req.body.role) {
      const roleName = req.body.role.toUpperCase();
      const roleObj = await prisma.role.findUnique({
        where: { name: roleName }
      });
      if (roleObj) {
        resolvedRoleId = roleObj.id;
      }
    }

    if (!resolvedRoleId) {
      return res.status(400).json({ error: 'Valid role is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Clean up skills and knowledge: ensure they are arrays
    let finalSkills = [];
    if (skills) {
      if (Array.isArray(skills)) {
        finalSkills = skills;
      } else if (typeof skills === 'string') {
        finalSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    
    let finalKnowledge = [];
    if (knowledge) {
      if (Array.isArray(knowledge)) {
        finalKnowledge = knowledge;
      } else if (typeof knowledge === 'string') {
        finalKnowledge = knowledge.split(',').map(k => k.trim()).filter(Boolean);
      }
    }

    const userData = {
      email, 
      password: hashedPassword, 
      name, 
      roleId: resolvedRoleId,
      parentId: parentId || null,
      createdBy: req.user.id,
      skills: finalSkills,
      knowledge: finalKnowledge
    };
    
    // Only add optional fields if they are provided
    if (linkedin) {
      userData.linkedin = linkedin;
    }
    if (avatar) {
      userData.avatar = avatar;
    }

    console.log('Creating user with data:', userData);
    const user = await prisma.user.create({
      data: userData,
      include: { role: true }
    });

    const { password: _, ...returnUserData } = user;
    res.status(201).json({ ...returnUserData, tenantId: tenantId || req.tenantDomain });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message, stack: error.stack });
  }
};

const updateUser = async (req, res) => {
  try {
    console.log('Update user request body:', req.body);
    let prisma = req.tenantDb;
    const { password, tenantId, role, skills, knowledge, linkedin, avatar, ...data } = req.body;
    
    if (req.isSuperAdmin) {
      if (!tenantId || tenantId === 'global') {
        return res.status(400).json({ error: 'Tenant domain is required' });
      }
      prisma = await getTenantDbByDomain(tenantId);
    }

    const updateData = { ...data, updatedBy: req.user.id };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Handle skills and knowledge
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        updateData.skills = skills;
      } else if (typeof skills === 'string') {
        updateData.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        updateData.skills = [];
      }
    }
    if (knowledge !== undefined) {
      if (Array.isArray(knowledge)) {
        updateData.knowledge = knowledge;
      } else if (typeof knowledge === 'string') {
        updateData.knowledge = knowledge.split(',').map(k => k.trim()).filter(Boolean);
      } else {
        updateData.knowledge = [];
      }
    }

    let resolvedRoleId = data.roleId;
    if (!data.roleId && role) {
      const roleName = role.toUpperCase();
      const roleObj = await prisma.role.findUnique({
        where: { name: roleName }
      });
      if (roleObj) {
        resolvedRoleId = roleObj.id;
      }
    }

    if (resolvedRoleId) {
      updateData.roleId = resolvedRoleId;
    }

    // Only add optional fields if they are provided
    if (linkedin !== undefined) {
      updateData.linkedin = linkedin;
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    // Clean up fields not present in prisma user schema
    delete updateData.role;
    delete updateData.tenantId;
    delete updateData.companyName;
    delete updateData.domain;

    console.log('Updating user with data:', updateData);

    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: { role: true }
    });

    const { password: _, ...userData } = user;
    res.json({ ...userData, tenantId: tenantId || req.tenantDomain });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Internal server error', details: error.message, stack: error.stack });
  }
};

const deleteUser = async (req, res) => {
  try {
    let prisma = req.tenantDb;
    if (req.isSuperAdmin) {
      const { tenantId } = req.query;
      if (!tenantId || tenantId === 'global') {
        return res.status(400).json({ error: 'Tenant domain query parameter is required' });
      }
      prisma = await getTenantDbByDomain(tenantId);
    }

    await prisma.user.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
