const express = require('express');
const { getVehicules, addVehicule, updateVehicule, deleteVehicule } = require('../controllers/vehiculeController');
const auth = require('../middleware/auth');
const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(auth);

router.get('/', getVehicules);
router.post('/', addVehicule);
router.put('/:id', updateVehicule);
router.delete('/:id', deleteVehicule);

module.exports = router;