const express = require('express');
const { getClients, getClientById } = require('../controllers/clientController');
const router = express.Router();

router.get('/', getClients);
router.get('/:id', getClientById);

module.exports = router;