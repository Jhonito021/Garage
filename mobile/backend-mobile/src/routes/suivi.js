// backend/src/routes/suivi.js
const express = require('express');
const { getInterventions } = require('../controllers/suiviController');
const router = express.Router();

// Route pour récupérer les interventions du client
router.get('/', getInterventions);
router.get('/interventions', getInterventions);

module.exports = router;