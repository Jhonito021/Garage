const express = require('express');
const { 
    getInterventions, 
    startIntervention, 
    endIntervention, 
    scanPlaque,
    createInterventionFromRdv,
    getAllInterventions,
    updateIntervention,
    deleteIntervention
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

module.exports = router;