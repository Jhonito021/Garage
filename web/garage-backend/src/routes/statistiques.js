const express = require('express');
const { getDashboard, getVidangesStats, getClientsEcheanceVidange } = require('../controllers/statistiqueController');
const router = express.Router();

router.get('/dashboard', getDashboard);
router.get('/vidanges', getVidangesStats);
router.get('/echeances-vidange', getClientsEcheanceVidange);

module.exports = router;