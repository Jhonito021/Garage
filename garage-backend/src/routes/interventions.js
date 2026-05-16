const express = require('express');
const { getInterventions, startIntervention, endIntervention, scanPlaque } = require('../controllers/interventionController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/technicien', getInterventions);
router.put('/:id/debut', startIntervention);
router.put('/:id/fin', endIntervention);
router.get('/scan/:plaque', scanPlaque);

module.exports = router;