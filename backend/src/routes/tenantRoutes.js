const express = require('express');
const { createTenant, getAllTenants, getTenantPublic, toggleTenantStatus } = require('../controllers/tenantController');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/public/:domain', getTenantPublic);

router.post(
  '/create',
  authenticate,
  requireSuperAdmin,
  createTenant
);

router.get(
  '/',
  authenticate,
  requireSuperAdmin,
  getAllTenants
);

router.put(
  '/:companyId/status',
  authenticate,
  requireSuperAdmin,
  toggleTenantStatus
);

module.exports = router;
