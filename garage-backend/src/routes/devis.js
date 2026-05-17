const express = require('express');
const { getDevis, createDevis, acceptDevis, refuseDevis, downloadDevisPDF } = require('../controllers/devisController');
const router = express.Router();

router.get('/', getDevis);
router.post('/', createDevis);
router.put('/:id/accepter', acceptDevis);
router.put('/:id/refuser', refuseDevis);
router.get('/:id/pdf', downloadDevisPDF);

module.exports = router;