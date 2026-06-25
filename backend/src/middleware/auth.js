const jwt = require('jsonwebtoken');
const { getMainDb, getTenantDbByDomain } = require('../config/dbManager');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.isSuperAdmin) {
      const mainPrisma = getMainDb();
      const superAdmin = await mainPrisma.superAdmin.findUnique({
        where: { id: decoded.userId }
      });

      if (!superAdmin || !superAdmin.isActive) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      req.user = { ...superAdmin, role: 'SUPER_ADMIN' };
      req.isSuperAdmin = true;
    } else {
      const tenantPrisma = await getTenantDbByDomain(decoded.tenantDomain);
      const user = await tenantPrisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      req.user = user;
      req.tenantDomain = decoded.tenantDomain;
      req.tenantDb = tenantPrisma;
      req.isSuperAdmin = false;
    }

    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.message === 'Company not found' || error.message === 'Company is inactive') {
      return res.status(404).json({ error: error.message });
    }
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (!req.isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (req.isSuperAdmin) {
      return next();
    }

    const userRole = req.user?.role?.name;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, requireSuperAdmin, requireRole };
