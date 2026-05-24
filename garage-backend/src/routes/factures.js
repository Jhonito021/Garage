const express = require('express');
const { 
    getFactures, 
    getFactureById,
    createFacture, 
    payerFacture,
    downloadFacturePDF, 
    deleteFacture
} = require('../controllers/factureController');
const router = express.Router();

router.get('/', getFactures);
router.get('/:id', getFactureById);
router.post('/', createFacture);
router.put('/:id/payer', payerFacture);
router.get('/:id/pdf', downloadFacturePDF);
router.delete('/:id', deleteFacture);

module.exports = router;