const express = require('express');
const { getDashboard, getVidangesStats, getClientsEcheanceVidange } = require('../controllers/statistiqueController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/dashboard', getDashboard);
router.get('/vidanges', getVidangesStats);
router.get('/echeances-vidange', getClientsEcheanceVidange);

module.exports = router;