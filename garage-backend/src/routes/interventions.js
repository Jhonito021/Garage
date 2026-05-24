const express = require('express');
const { 
    getInterventions, 
    startIntervention, 
    endIntervention, 
    scanPlaque,
    createInterventionFromRdv,
    checkDisponibilite,
    getAllInterventions,
    updateIntervention,
    deleteIntervention,
    getClientInterventions  // IMPORTER LA NOUVELLE FONCTION
} = require('../controllers/interventionController');
const router = express.Router();

// Routes pour technicien
router.get('/technicien', getInterventions);
router.put('/:id/debut', startIntervention);
router.put('/:id/fin', endIntervention);
router.get('/scan/:plaque', scanPlaque);

// Routes pour admin
router.post('/', createInterventionFromRdv);
router.get('/all', getAllInterventions);
router.put('/:id', updateIntervention);
router.delete('/:id', deleteIntervention);

// Route pour vérifier la disponibilité
router.get('/check-disponibilite', checkDisponibilite);

// Route pour les interventions du client
router.get('/client', getClientInterventions);

module.exports = router;