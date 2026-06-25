const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, getProjects);
router.get('/:id', authenticate, getProjectById);
router.post('/', authenticate, requireRole(['ADMIN', 'MANAGER']), createProject);
router.put('/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), updateProject);
router.delete('/:id', authenticate, requireRole(['ADMIN']), deleteProject);

module.exports = router;
