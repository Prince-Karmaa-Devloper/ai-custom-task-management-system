const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getMainDb, getTenantDbByDomain } = require('../config/dbManager');

const login = async (req, res) => {
  try {
    const { email, password, tenantDomain } = req.body;
    const isSuperAdminLogin = !tenantDomain || tenantDomain === 'global';

    if (isSuperAdminLogin) {
      // Super admin login
      const mainPrisma = getMainDb();
      const superAdmin = await mainPrisma.superAdmin.findUnique({
        where: { email }
      });

      if (!superAdmin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!superAdmin.isActive) {
        return res.status(403).json({ error: 'Account is inactive' });
      }

      const passwordMatch = await bcrypt.compare(password, superAdmin.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const accessToken = jwt.sign(
        {
          userId: superAdmin.id,
          role: 'SUPER_ADMIN',
          tenantDomain: null,
          isSuperAdmin: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { userId: superAdmin.id, isSuperAdmin: true },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...userData } = superAdmin;

      return res.json({
        user: { ...userData, role: 'SUPER_ADMIN', tenantDomain: 'global' },
        accessToken,
        refreshToken
      });
    }

    // Tenant user login
    const tenantPrisma = await getTenantDbByDomain(tenantDomain);
    
    const user = await tenantPrisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role.name,
        tenantDomain,
        isSuperAdmin: false
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, tenantDomain, isSuperAdmin: false },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user;

    res.json({
      user: { ...userData, tenantDomain },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.message === 'Company not found' || error.message === 'Company is inactive') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    
    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    let userData, role, userTenantDomain;

    if (decoded.isSuperAdmin) {
      const mainPrisma = getMainDb();
      const superAdmin = await mainPrisma.superAdmin.findUnique({
        where: { id: decoded.userId }
      });

      if (!superAdmin) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const { password: _, ...rest } = superAdmin;
      userData = rest;
      role = 'SUPER_ADMIN';
      userTenantDomain = 'global';
    } else {
      const tenantPrisma = await getTenantDbByDomain(decoded.tenantDomain);
      const user = await tenantPrisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const { password: _, ...rest } = user;
      userData = rest;
      role = user.role.name;
      userTenantDomain = decoded.tenantDomain;
    }

    const accessToken = jwt.sign(
      { 
        userId: userData.id, 
        role,
        tenantDomain: decoded.tenantDomain,
        isSuperAdmin: decoded.isSuperAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ user: { ...userData, tenantDomain: userTenantDomain, role }, accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = { login, refreshToken, logout };
