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

// Route pour enregistrer une vidange (technicien)
router.post('/', createVidange);

// Route pour récupérer les vidanges d'un véhicule
router.get('/vehicule/:vehiculeId', getVidangesByVehicule);

// Route pour vérifier si une vidange est due
router.get('/verifier/:vehiculeId', checkVidangeDue);

// Route pour récupérer les interventions du client (suivi)
router.get('/client/interventions', getClientInterventions);

// Route pour récupérer l'historique des vidanges du client
router.get('/client/historique', getClientVidangesHistory);

// Route pour supprimer une vidange (admin)
router.delete('/:id', deleteVidange);

module.exports = router;