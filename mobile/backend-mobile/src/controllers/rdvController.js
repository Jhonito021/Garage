const db = require('../models/db');

// Lister les rendez-vous du client (via client_id en paramètre)
const getRdvs = async (req, res) => {
    const clientId = req.query.client_id || req.session?.userId;
    
    if (!clientId) {
        return res.status(400).json({ error: 'client_id requis' });
    }

    try {
        const [rows] = await db.query(`
            SELECT r.*, v.immatriculation, v.marque, v.modele
            FROM rdv r 
            JOIN vehicules v ON r.vehicule_id = v.id 
            WHERE r.client_id = ?
            ORDER BY r.date_heure DESC
        `, [clientId]);
        res.json(rows);
    } catch (err) {
        console.error('Erreur getRdvs:', err);
        res.status(500).json({ error: err.message });
    }
};

// Prendre un rendez-vous
const createRdv = async (req, res) => {
    const { client_id, vehicule_id, date_heure, service_demande } = req.body;

    if (!client_id || !vehicule_id || !date_heure || !service_demande) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO rdv (client_id, vehicule_id, date_heure, service_demande, statut) VALUES (?, ?, ?, ?, "confirmé")',
            [client_id, vehicule_id, date_heure, service_demande]
        );
        res.status(201).json({ id: result.insertId, message: 'Rendez-vous confirmé' });
    } catch (err) {
        console.error('Erreur createRdv:', err);
        res.status(500).json({ error: err.message });
    }
};

// Annuler un rendez-vous
const cancelRdv = async (req, res) => {
    const { client_id } = req.body;
    const rdvId = req.params.id;

    if (!client_id) {
        return res.status(400).json({ error: 'client_id requis' });
    }

    try {
        await db.query('UPDATE rdv SET statut = "annulé" WHERE id = ? AND client_id = ?', [rdvId, client_id]);
        res.json({ message: 'Rendez-vous annulé' });
    } catch (err) {
        console.error('Erreur cancelRdv:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getRdvs, createRdv, cancelRdv };