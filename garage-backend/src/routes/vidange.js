const express = require('express');
const { 
    createVidange, 
    getVidangesByVehicule, 
    checkVidangeDue,
    getClientInterventions
} = require('../controllers/vidangeController');
const router = express.Router();

router.post('/', createVidange);
router.get('/vehicule/:vehiculeId', getVidangesByVehicule);
router.get('/verifier/:vehiculeId', checkVidangeDue);
router.get('/client/interventions', getClientInterventions);

module.exports = router;