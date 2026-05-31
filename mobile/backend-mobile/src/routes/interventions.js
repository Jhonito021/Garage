// backend/src/routes/interventions.js
const express = require('express');
const {
    getTechnicienInterventions,
    getTechnicienInterventionDetail,
    accepterIntervention,
    demarrerIntervention,
    terminerIntervention,
    getTechnicienProfile,
    updateTechnicienProfile,
    ajouterNote,
    getTechnicienStats
} = require('../controllers/interventionController');

const router = express.Router();

// ==================== ROUTES SANS AUTHENTIFICATION (avec paramètre user_id) ====================

// GET /api/interventions?user_id=1 - Liste toutes mes interventions
router.get('/', getTechnicienInterventions);

// GET /api/interventions/:id?user_id=1 - Détail d'une intervention
router.get('/:interventionId', getTechnicienInterventionDetail);

// PUT /api/interventions/:id/accepter?user_id=1 - Accepter une intervention
router.put('/:interventionId/accepter', accepterIntervention);

// PUT /api/interventions/:id/demarrer?user_id=1 - Démarrer une intervention
router.put('/:interventionId/demarrer', demarrerIntervention);

// PUT /api/interventions/:id/terminer?user_id=1 - Terminer une intervention
router.put('/:interventionId/terminer', terminerIntervention);

// PUT /api/interventions/:id/note?user_id=1 - Ajouter une note
router.put('/:interventionId/note', ajouterNote);

// GET /api/interventions/stats?user_id=1 - Mes statistiques
router.get('/stats', getTechnicienStats);

// GET /api/interventions/profil?user_id=1 - Mon profil
router.get('/profil', getTechnicienProfile);

// PUT /api/interventions/profil?user_id=1 - Modifier mon profil
router.put('/profil', updateTechnicienProfile);

module.exports = router;