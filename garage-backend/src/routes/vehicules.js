const express = require('express');
const { getVehicules, addVehicule, updateVehicule, deleteVehicule } = require('../controllers/vehiculeController');
const router = express.Router();

router.get('/', getVehicules);
router.post('/', addVehicule);
router.put('/:id', updateVehicule);
router.delete('/:id', deleteVehicule);

module.exports = router;