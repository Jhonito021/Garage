const express = require('express');
const { uploadPhoto, getPhotosByIntervention } = require('../controllers/photoController');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/', upload.single('photo'), uploadPhoto);
router.get('/intervention/:interventionId', getPhotosByIntervention);

module.exports = router;