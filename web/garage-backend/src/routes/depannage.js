// backend/src/routes/depannage.js
const express = require('express');
const {
    demanderDepannage,
    getDemandesDepannage,
    accepterDemande,
    refuserDemande,
    suivreDemande
} = require('../controllers/depannageController');

const router = express.Router();

// Routes client
router.post('/demande', demanderDepannage);
router.get('/suivi/:id', suivreDemande);

// Routes admin
router.get('/demandes', getDemandesDepannage);
router.put('/demande/:id/accepter', accepterDemande);
router.put('/demande/:id/refuser', refuserDemande);

module.exports = router;