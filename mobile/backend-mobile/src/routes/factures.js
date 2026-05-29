const express = require('express');
const { getFactures, getFactureById, payerFacture } = require('../controllers/factureController');
const router = express.Router();

router.get('/', getFactures);
router.get('/:id', getFactureById);
router.put('/:id/payer', payerFacture);

module.exports = router;