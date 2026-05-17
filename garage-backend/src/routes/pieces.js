const express = require('express');
const { getPieces, addPiece, updatePiece, deletePiece, getStockAlertes, usePiece } = require('../controllers/pieceController');
const router = express.Router();

router.get('/', getPieces);
router.post('/', addPiece);
router.put('/:id', updatePiece);
router.delete('/:id', deletePiece);
router.get('/alertes', getStockAlertes);
router.post('/utiliser', usePiece);

module.exports = router;