const express = require('express');
const { getFactures, createFacture, downloadFacturePDF, payerFacture } = require('../controllers/factureController');
const router = express.Router();

router.get('/', getFactures);
router.post('/', createFacture);
router.get('/:id/pdf', downloadFacturePDF);
router.put('/:id/payer', payerFacture);

module.exports = router;