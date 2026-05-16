const express = require('express');
const { uploadPhoto, getPhotosByIntervention } = require('../controllers/photoController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.use(auth);

router.post('/', upload.single('photo'), uploadPhoto);
router.get('/intervention/:interventionId', getPhotosByIntervention);

module.exports = router;