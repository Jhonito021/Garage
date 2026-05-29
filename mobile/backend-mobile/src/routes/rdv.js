const express = require('express');
const { getRdvs, createRdv, cancelRdv } = require('../controllers/rdvController');
const router = express.Router();

router.get('/', getRdvs);
router.post('/', createRdv);
router.put('/:id/annuler', cancelRdv);

module.exports = router;