const express = require('express');
const { getPlanning, getCreneauxDisponibles, bloquerCreneau } = require('../controllers/planningController');
const auth = require('../middleware/auth');
const router = express.Router();

// Route publique pour les créneaux disponibles
router.get('/disponibles', getCreneauxDisponibles);

// Routes protégées
router.use(auth);
router.get('/', getPlanning);
router.post('/bloquer', bloquerCreneau);

module.exports = router;