// backend/src/controllers/depannageController.js
const db = require('../models/db');

/**
 * Client - Demander un dépannage
 */
const demanderDepannage = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { lat, lng, adresse } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Coordonnées GPS requises' });
    }

    try {
        const [client] = await db.query(
            'SELECT id, nom, prenom, email, telephone FROM utilisateurs WHERE id = ?',
            [req.session.userId]
        );

        if (client.length === 0) {
            return res.status(404).json({ error: 'Client non trouvé' });
        }

        const [result] = await db.query(
            `INSERT INTO depannage_demandes 
            (client_id, client_nom, client_prenom, client_email, client_telephone, 
             lat, lng, adresse, statut, date_demande) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'en_attente', NOW())`,
            [
                req.session.userId,
                client[0].nom,
                client[0].prenom,
                client[0].email,
                client[0].telephone || '',
                lat,
                lng,
                adresse || null
            ]
        );

        res.status(201).json({
            success: true,
            id: result.insertId,
            message: 'Demande de dépannage envoyée',
            client: {
                nom: client[0].nom,
                prenom: client[0].prenom,
                telephone: client[0].telephone
            }
        });

    } catch (err) {
        console.error('Erreur demanderDepannage:', err);
        res.status(500).json({ error: 'Erreur serveur: ' + err.message });
    }
};

/**
 * Admin - Récupérer toutes les demandes de dépannage
 */
const getDemandesDepannage = async (req, res) => {
    if (!req.session || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Accès non autorisé' });
    }

    try {
        const [rows] = await db.query(
            `SELECT * FROM depannage_demandes ORDER BY date_demande DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Erreur getDemandesDepannage:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Admin - Accepter une demande de dépannage
 */
const accepterDemande = async (req, res) => {
    if (!req.session || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const { technicien_id } = req.body;

    try {
        await db.query(
            `UPDATE depannage_demandes 
             SET statut = 'acceptee', 
                 technicien_id = ?,
                 date_traitement = NOW() 
             WHERE id = ?`,
            [technicien_id || null, id]
        );

        res.json({ success: true, message: 'Demande acceptée' });
    } catch (err) {
        console.error('Erreur accepterDemande:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Admin - Refuser une demande de dépannage
 */
const refuserDemande = async (req, res) => {
    if (!req.session || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const { id } = req.params;

    try {
        await db.query(
            `UPDATE depannage_demandes 
             SET statut = 'refusee', date_traitement = NOW() 
             WHERE id = ?`,
            [id]
        );

        res.json({ success: true, message: 'Demande refusée' });
    } catch (err) {
        console.error('Erreur refuserDemande:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Client - Suivre l'état de sa demande
 */
const suivreDemande = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT id, statut, lat, lng, date_demande, date_traitement
             FROM depannage_demandes 
             WHERE id = ? AND client_id = ?`,
            [id, req.session.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Demande non trouvée' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Erreur suivreDemande:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    demanderDepannage,
    getDemandesDepannage,
    accepterDemande,
    refuserDemande,
    suivreDemande
};