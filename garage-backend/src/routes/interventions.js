const express = require('express');
const { getInterventions, startIntervention, endIntervention, scanPlaque } = require('../controllers/interventionController');
const router = express.Router();

router.get('/technicien', getInterventions);
router.put('/:id/debut', startIntervention);
router.put('/:id/fin', endIntervention);
router.get('/scan/:plaque', scanPlaque);

module.exports = router;