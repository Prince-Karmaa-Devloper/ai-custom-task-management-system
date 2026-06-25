const express = require('express');
const router = express.Router();
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  addComment
} = require('../controllers/ticketController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, getTickets);
router.get('/:id', authenticate, getTicketById);
router.post('/', authenticate, createTicket);
router.put('/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), updateTicket);
router.delete('/:id', authenticate, requireRole(['ADMIN']), deleteTicket);
router.post('/:id/comments', authenticate, addComment);

module.exports = router;
