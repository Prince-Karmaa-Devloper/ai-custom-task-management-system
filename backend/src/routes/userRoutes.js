const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, getUsers);
router.get('/:id', authenticate, getUserById);
router.post('/', authenticate, requireRole(['ADMIN', 'MANAGER']), createUser);
router.put('/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), updateUser);
router.delete('/:id', authenticate, requireRole(['ADMIN']), deleteUser);

module.exports = router;
