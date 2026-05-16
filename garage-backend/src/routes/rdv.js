const express = require('express');
const { getRdvs, createRdv, cancelRdv } = require('../controllers/rdvController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', getRdvs);
router.post('/', createRdv);
router.put('/:id/annuler', cancelRdv);

module.exports = router;