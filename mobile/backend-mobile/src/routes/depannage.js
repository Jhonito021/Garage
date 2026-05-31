// backend/src/routes/depannage.js
const express = require('express');
const {
    getDepanneurMissions,
    getDepanneurMissionDetail,
    accepterMission,
    mettreEnCoursMission,
    terminerMission,
    mettreAJourPosition,
    getSuiviMissions,
    getDepanneurProfile,
    updateDepanneurProfile
} = require('../controllers/depannageController');

const router = express.Router();

// ==================== ROUTES PRINCIPALES ====================

// GET /api/depannage - Récupérer toutes les missions du dépanneur
router.get('/', getDepanneurMissions);

// GET /api/depannage/missions - Liste des missions (alias)
router.get('/missions', getDepanneurMissions);

// GET /api/depannage/missions/:missionId - Détail d'une mission
router.get('/missions/:missionId', getDepanneurMissionDetail);

// PUT /api/depannage/missions/:missionId/accepter - Accepter une mission
router.put('/missions/:missionId/accepter', accepterMission);

// PUT /api/depannage/missions/:missionId/en-cours - Mettre en cours
router.put('/missions/:missionId/en-cours', mettreEnCoursMission);

// PUT /api/depannage/missions/:missionId/terminer - Terminer une mission
router.put('/missions/:missionId/terminer', terminerMission);

// ==================== SUIVI ====================

// GET /api/depannage/suivi - Suivi des missions
router.get('/suivi', getSuiviMissions);

// ==================== POSITION GPS ====================

// POST /api/depannage/position - Mettre à jour la position GPS
router.post('/position', mettreAJourPosition);

// ==================== PROFIL ====================

// GET /api/depannage/profil - Profil du dépanneur
router.get('/profil', getDepanneurProfile);

// PUT /api/depannage/profil - Modifier le profil
router.put('/profil', updateDepanneurProfile);

module.exports = router;