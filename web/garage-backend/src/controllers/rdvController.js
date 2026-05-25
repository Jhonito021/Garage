const db = require('../models/db');

// Lister les rendez-vous (admin voit tout, client voit uniquement les siens)
const getRdvs = async (req, res) => {
    try {
        let query = `
            SELECT r.*, 
                   v.immatriculation, 
                   v.marque, 
                   v.modele,
                   u.nom as client_nom,
                   u.prenom as client_prenom
            FROM rdv r 
            JOIN vehicules v ON r.vehicule_id = v.id 
            JOIN utilisateurs u ON r.client_id = u.id
        `;
        
        let params = [];
        
        // Si l'utilisateur n'est pas admin, filtrer par son client_id
        if (req.session.userRole !== 'admin') {
            query += ` WHERE r.client_id = ?`;
            params.push(req.session.userId);
        }
        
        query += ` ORDER BY r.date_heure DESC`;
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Erreur getRdvs:', err);
        res.status(500).json({ error: err.message });
    }
};

// Prendre un rendez-vous (client uniquement)
const createRdv = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { vehicule_id, date_heure, service_demande } = req.body;

    // Vérifier que le véhicule appartient au client
    const [check] = await db.query(
        'SELECT * FROM vehicules WHERE id = ? AND client_id = ?',
        [vehicule_id, req.session.userId]
    );
    
    if (check.length === 0) {
        return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    try {
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

// Annuler un rendez-vous (client uniquement)
const cancelRdv = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const rdvId = req.params.id;

    try {
        // Vérifier que le rendez-vous appartient au client
        const [check] = await db.query(
            'SELECT * FROM rdv WHERE id = ? AND client_id = ?',
            [rdvId, req.session.userId]
        );
        
        if (check.length === 0) {
            return res.status(404).json({ error: 'Rendez-vous non trouvé' });
        }

        await db.query('UPDATE rdv SET statut = "annulé" WHERE id = ?', [rdvId]);
        res.json({ message: 'Rendez-vous annulé' });
    } catch (err) {
        console.error('Erreur cancelRdv:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getRdvs, createRdv, cancelRdv };