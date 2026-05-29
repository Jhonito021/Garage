const db = require('../models/db');

// Récupérer les interventions du client
const getInterventions = async (req, res) => {
    const clientId = req.query.client_id || req.session?.userId;
    
    if (!clientId) {
        return res.status(400).json({ error: 'client_id requis' });
    }

    try {
        const [rows] = await db.query(`
            SELECT 
                i.id,
                i.statut,
                i.description,
                i.date_debut,
                i.date_fin,
                i.duree_totale,
                v.immatriculation,
                v.marque,
                v.modele
            FROM interventions i
            JOIN vehicules v ON i.vehicule_id = v.id
            WHERE v.client_id = ?
            ORDER BY i.date_debut DESC
        `, [clientId]);
        res.json(rows);
    } catch (err) {
        console.error('Erreur getInterventions:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getInterventions };