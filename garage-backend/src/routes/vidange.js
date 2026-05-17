const express = require('express');
const { createVidange, getVidangesByVehicule, checkVidangeDue } = require('../controllers/vidangeController');
const router = express.Router();

router.post('/', createVidange);
router.get('/vehicule/:vehiculeId', getVidangesByVehicule);
router.get('/verifier/:vehiculeId', checkVidangeDue);

module.exports = router;