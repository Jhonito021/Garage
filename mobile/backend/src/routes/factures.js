const express = require('express');
const { getFactures } = require('../controllers/factureController');
const router = express.Router();

router.get('/', getFactures);

module.exports = router;