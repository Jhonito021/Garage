const express = require('express');
const {
    getAllConfigurations,
    getConfigurationByCle,
    updateConfiguration,
    createConfiguration,
    deleteConfiguration
} = require('../controllers/configurationController');
const router = express.Router();

// Routes publiques (ou protégées selon besoin)
router.get('/all', getAllConfigurations);
router.get('/:cle', getConfigurationByCle);
router.post('/', createConfiguration);
router.put('/', updateConfiguration);
router.delete('/:cle', deleteConfiguration);

module.exports = router;