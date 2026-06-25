
const express = require('express');
const { getWhiteLabelSettings, updateWhiteLabelSettings } = require('../controllers/whiteLabelController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getWhiteLabelSettings);
router.put('/', authenticate, updateWhiteLabelSettings);

module.exports = router;
