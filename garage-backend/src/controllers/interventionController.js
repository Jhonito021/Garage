const db = require('../models/db');

const TECHNICIEN_ID_FIXE = 2;

const getInterventions = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT i.*, v.immatriculation, v.marque, v.modele, u.nom, u.prenom 
             FROM interventions i 
             JOIN vehicules v ON i.vehicule_id = v.id 
             JOIN utilisateurs u ON v.client_id = u.id 
             WHERE i.technicien_id = ? 
             ORDER BY i.date_debut DESC`,
            [TECHNICIEN_ID_FIXE]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const startIntervention = async (req, res) => {
    const interventionId = req.params.id;

    try {
        await db.query('UPDATE interventions SET statut = "en_cours", date_debut = NOW() WHERE id = ?', [interventionId]);
        res.json({ message: 'Intervention démarrée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const endIntervention = async (req, res) => {
    const interventionId = req.params.id;

    try {
        await db.query('UPDATE interventions SET statut = "terminée", date_fin = NOW() WHERE id = ?', [interventionId]);
        
        const [row] = await db.query('SELECT TIMESTAMPDIFF(MINUTE, date_debut, NOW()) as duree FROM interventions WHERE id = ?', [interventionId]);
        const duree = row[0].duree;
        await db.query('UPDATE interventions SET duree_totale = ? WHERE id = ?', [duree, interventionId]);
        
        res.json({ message: 'Intervention terminée', duree });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const scanPlaque = async (req, res) => {
    const plaque = req.params.plaque;

    try {
        const [rows] = await db.query(
            `SELECT v.*, u.id as client_id, u.nom, u.prenom, u.email, u.telephone, u.adresse
             FROM vehicules v 
             JOIN utilisateurs u ON v.client_id = u.id 
             WHERE v.immatriculation = ?`,
            [plaque.toUpperCase()]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }
        
        const [vidanges] = await db.query('SELECT * FROM vidanges WHERE vehicule_id = ? ORDER BY date_vidange DESC LIMIT 1', [rows[0].id]);
        
        res.json({ vehicule: rows[0], derniereVidange: vidanges[0] || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getInterventions, startIntervention, endIntervention, scanPlaque };