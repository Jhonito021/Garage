const db = require('../models/db');

// Lister les factures du client
const getFactures = async (req, res) => {
    const clientId = req.query.client_id || req.session?.userId;
    
    if (!clientId) {
        return res.status(400).json({ error: 'client_id requis' });
    }

    try {
        const [rows] = await db.query(`
            SELECT f.*, i.description, v.immatriculation, v.marque, v.modele
            FROM factures f
            JOIN interventions i ON f.intervention_id = i.id
            JOIN vehicules v ON i.vehicule_id = v.id
            WHERE v.client_id = ?
            ORDER BY f.date_emission DESC
        `, [clientId]);
        res.json(rows);
    } catch (err) {
        console.error('Erreur getFactures:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getFactures };