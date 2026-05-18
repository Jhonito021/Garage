const db = require('../models/db');

const getRdvs = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, 
                   v.immatriculation, 
                   v.marque, 
                   v.modele,
                   u.nom as client_nom,
                   u.prenom as client_prenom
            FROM rdv r 
            JOIN vehicules v ON r.vehicule_id = v.id 
            JOIN utilisateurs u ON r.client_id = u.id
            ORDER BY r.date_heure DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Erreur getRdvs:', err);
        res.status(500).json({ error: err.message });
    }
};

const createRdv = async (req, res) => {
    const { vehicule_id, date_heure, service_demande } = req.body;

    if (!vehicule_id || !date_heure || !service_demande) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    try {
        // Vérifier si le créneau est disponible
        const [existing] = await db.query(
            'SELECT id FROM rdv WHERE date_heure = ? AND statut != "annulé"', 
            [date_heure]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Créneau déjà pris' });
        }

        const [result] = await db.query(
            'INSERT INTO rdv (client_id, vehicule_id, date_heure, service_demande, statut) VALUES (?, ?, ?, ?, "confirmé")',
            [req.session.userId, vehicule_id, date_heure, service_demande]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Rendez-vous confirmé' });
    } catch (err) {
        console.error('Erreur createRdv:', err);
        res.status(500).json({ error: err.message });
    }
};

const cancelRdv = async (req, res) => {
    const rdvId = req.params.id;

    try {
        await db.query('UPDATE rdv SET statut = "annulé" WHERE id = ?', [rdvId]);
        res.json({ message: 'Rendez-vous annulé' });
    } catch (err) {
        console.error('Erreur cancelRdv:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getRdvs, createRdv, cancelRdv };