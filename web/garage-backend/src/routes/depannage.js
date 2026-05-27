// backend/src/routes/depannage.js
const express = require('express');
const {
    demanderDepannage,
    getDemandesDepannage,
    getTechnicienDemandes,        // ← IMPORTANT
    accepterDemande,
    refuserDemande,
    accepterMission,              // ← IMPORTANT
    terminerMission,              // ← IMPORTANT
    suivreDemande,
    mettreAJourPositionTechnicien, // ← IMPORTANT
    terminerDepannage,
    getDepannageStats
} = require('../controllers/depannageController');

const router = express.Router();

// ==================== ROUTES CLIENT ====================
router.post('/demande', demanderDepannage);
router.get('/suivi/:id', suivreDemande);
router.put('/terminer/:id', terminerDepannage);

// ==================== ROUTES ADMIN ====================
router.get('/demandes', getDemandesDepannage);
router.put('/demande/:id/accepter', accepterDemande);
router.put('/demande/:id/refuser', refuserDemande);
router.get('/stats', getDepannageStats);

// ==================== ROUTES TECHNICIEN / DÉPANNEUR ====================
router.get('/technicien/demandes', getTechnicienDemandes);
router.put('/technicien/mission/:id/accepter', accepterMission);
router.put('/technicien/mission/:id/terminer', terminerMission);
router.post('/technicien/position', mettreAJourPositionTechnicien);

module.exports = router;