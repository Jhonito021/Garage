const express = require('express');
const { getPlanning, getCreneauxDisponibles, bloquerCreneau } = require('../controllers/planningController');
const router = express.Router();

router.get('/disponibles', getCreneauxDisponibles);
router.get('/', getPlanning);
router.post('/bloquer', bloquerCreneau);

module.exports = router;