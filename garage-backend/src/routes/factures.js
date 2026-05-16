const express = require('express');
const { getFactures, createFacture, downloadFacturePDF, payerFacture } = require('../controllers/factureController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', getFactures);
router.post('/', createFacture);
router.get('/:id/pdf', downloadFacturePDF);
router.put('/:id/payer', payerFacture);

module.exports = router;