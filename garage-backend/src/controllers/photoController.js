const db = require('../models/db');

// Upload d'une photo (technicien)
const uploadPhoto = async (req, res) => {
    if (req.user.role !== 'technicien' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux techniciens' });
    }

    const { intervention_id, description } = req.body;

    if (!intervention_id || !req.file) {
        return res.status(400).json({ error: 'Intervention et photo requis' });
    }

    const io = req.app.get('io');

    try {
        const photoUrl = `/uploads/${req.file.filename}`;
        
        const [result] = await db.query(
            'INSERT INTO photos (intervention_id, url_photo, description) VALUES (?, ?, ?)',
            [intervention_id, photoUrl, description || '']
        );
        
        // Notifier le client
        const [interv] = await db.query(
            `SELECT v.client_id FROM interventions i JOIN vehicules v ON i.vehicule_id = v.id WHERE i.id = ?`,
            [intervention_id]
        );
        
        if (interv[0]) {
            io.emit('nouvelle_photo', { clientId: interv[0].client_id, photoUrl, intervention_id });
        }
        
        res.status(201).json({ id: result.insertId, url: photoUrl, message: 'Photo envoyée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Récupérer les photos d'une intervention (client)
const getPhotosByIntervention = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.* FROM photos p 
             JOIN interventions i ON p.intervention_id = i.id 
             JOIN vehicules v ON i.vehicule_id = v.id 
             WHERE i.id = ? AND v.client_id = ?`,
            [req.params.interventionId, req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { uploadPhoto, getPhotosByIntervention };