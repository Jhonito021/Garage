const express = require('express');
const { 
    getClientInterventions, 
    getInterventionById,
    getInterventionStats
} = require('../controllers/suiviController');
const router = express.Router();

// Routes pour le suivi des interventions (client)
router.get('/interventions', getClientInterventions);
router.get('/interventions/stats', getInterventionStats);
router.get('/interventions/:id', getInterventionById);

module.exports = router;