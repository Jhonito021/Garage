const db = require('../models/db');

// Lister les rendez-vous du client connecté
const getRdvs = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT r.*, v.immatriculation, v.marque, v.modele 
             FROM rdv r 
             JOIN vehicules v ON r.vehicule_id = v.id 
             WHERE r.client_id = ? 
             ORDER BY r.date_heure DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Prendre un rendez-vous
const createRdv = async (req, res) => {
    const { vehicule_id, date_heure, service_demande } = req.body;
    const io = req.app.get('io');

    if (!vehicule_id || !date_heure || !service_demande) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    try {
        // Vérifier que le véhicule appartient au client
        const [check] = await db.query('SELECT * FROM vehicules WHERE id = ? AND client_id = ?', [vehicule_id, req.user.id]);
        if (check.length === 0) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        // Vérifier que le créneau est disponible
        const [existing] = await db.query(
            'SELECT id FROM rdv WHERE date_heure = ? AND statut != "annulé"',
            [date_heure]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Créneau déjà pris' });
        }

        const [result] = await db.query(
            'INSERT INTO rdv (client_id, vehicule_id, date_heure, service_demande) VALUES (?, ?, ?, ?)',
            [req.user.id, vehicule_id, date_heure, service_demande]
        );

        // Notifier via socket
        io.emit('nouveau_rdv', { id: result.insertId, vehicule_id, date_heure });

        res.status(201).json({ id: result.insertId, message: 'Rendez-vous confirmé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Annuler un rendez-vous
const cancelRdv = async (req, res) => {
    const rdvId = req.params.id;
    const io = req.app.get('io');

    try {
        const [check] = await db.query('SELECT * FROM rdv WHERE id = ? AND client_id = ?', [rdvId, req.user.id]);
        if (check.length === 0) {
            return res.status(404).json({ error: 'Rendez-vous non trouvé' });
        }

        await db.query('UPDATE rdv SET statut = "annulé" WHERE id = ?', [rdvId]);
        
        io.emit('rdv_annule', { id: rdvId });
        
        res.json({ message: 'Rendez-vous annulé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getRdvs, createRdv, cancelRdv };