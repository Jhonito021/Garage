const express = require('express');
const { getDevis, createDevis, acceptDevis, refuseDevis, downloadDevisPDF } = require('../controllers/devisController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', getDevis);
router.post('/', createDevis);
router.put('/:id/accepter', acceptDevis);
router.put('/:id/refuser', refuseDevis);
router.get('/:id/pdf', downloadDevisPDF);

module.exports = router;