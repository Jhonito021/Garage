const express = require('express');
const { getNotifications, markAsRead, verifierVidanges } = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', getNotifications);
router.put('/:id/lu', markAsRead);

// Route pour le cron job (sans auth, avec secret)
router.post('/verifier-vidanges', verifierVidanges);

module.exports = router;