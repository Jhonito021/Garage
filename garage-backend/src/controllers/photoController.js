const db = require('../models/db');

const uploadPhoto = async (req, res) => {
    const { intervention_id, description } = req.body;

    if (!intervention_id || !req.file) {
        return res.status(400).json({ error: 'Intervention et photo requis' });
    }

    try {
        const photoUrl = `/uploads/${req.file.filename}`;
        const [result] = await db.query('INSERT INTO photos (intervention_id, url_photo, description) VALUES (?, ?, ?)', [intervention_id, photoUrl, description || '']);
        
        res.status(201).json({ id: result.insertId, url: photoUrl, message: 'Photo envoyée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPhotosByIntervention = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM photos WHERE intervention_id = ?', [req.params.interventionId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { uploadPhoto, getPhotosByIntervention };