const express = require('express');
const { 
    getFactures, 
    createFacture, 
    downloadFacturePDF, 
    payerFacture,
    getFactureById,
    deleteFacture
} = require('../controllers/factureController');
const router = express.Router();

router.get('/', getFactures);
router.post('/', createFacture);
router.get('/:id/pdf', downloadFacturePDF);
router.put('/:id/payer', payerFacture);
router.get('/:id', getFactureById);
router.delete('/:id', deleteFacture);

module.exports = router;