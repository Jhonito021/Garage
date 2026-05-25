const express = require('express');
const { getInterventions } = require('../controllers/suiviController');
const router = express.Router();

router.get('/interventions', getInterventions);

module.exports = router;