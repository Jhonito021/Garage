const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes protégées
router.get('/me', auth, getMe);

module.exports = router;