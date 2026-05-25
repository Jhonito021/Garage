const express = require('express');
const { getNotifications, markAsRead, verifierVidanges } = require('../controllers/notificationController');
const router = express.Router();

router.get('/', getNotifications);
router.put('/:id/lu', markAsRead);
router.post('/verifier-vidanges', verifierVidanges);

module.exports = router;