// backend/src/routes/vidange.js
const express = require('express');
const { 
    createVidange, 
    getVidangesByVehicule, 
    checkVidangeDue,
    getClientInterventions,
    getClientVidangesHistory,
    deleteVidange
} = require('../controllers/vidangeController');

const router = express.Router();

// Route de test
router.get('/', (req, res) => {
    res.json({ message: 'API vidange opérationnelle' });
});

// Routes principales
router.post('/', createVidange);
router.get('/vehicule/:vehiculeId', getVidangesByVehicule);
router.get('/verifier/:vehiculeId', checkVidangeDue);
router.get('/client/interventions', getClientInterventions);
router.get('/client/historique', getClientVidangesHistory);
router.delete('/:id', deleteVidange);

module.exports = router;