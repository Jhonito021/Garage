const db = require('../models/db');

// Lister les interventions du technicien connecté
const getInterventions = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [rows] = await db.query(
            `SELECT i.*, v.immatriculation, v.marque, v.modele, u.nom, u.prenom 
             FROM interventions i 
             JOIN vehicules v ON i.vehicule_id = v.id 
             JOIN utilisateurs u ON v.client_id = u.id 
             WHERE i.technicien_id = ? 
             ORDER BY i.date_debut DESC`,
            [req.session.userId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Erreur getInterventions:', err);
        res.status(500).json({ error: err.message });
    }
};

// Démarrer une intervention
const startIntervention = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const interventionId = req.params.id;

    try {
        // Vérifier que l'intervention appartient au technicien
        const [check] = await db.query(
            'SELECT * FROM interventions WHERE id = ? AND technicien_id = ?',
            [interventionId, req.session.userId]
        );
        
        if (check.length === 0) {
            return res.status(404).json({ error: 'Intervention non trouvée' });
        }

        await db.query('UPDATE interventions SET statut = "en_cours", date_debut = NOW() WHERE id = ?', [interventionId]);
        res.json({ message: 'Intervention démarrée' });
    } catch (err) {
        console.error('Erreur startIntervention:', err);
        res.status(500).json({ error: err.message });
    }
};

// Terminer une intervention
const endIntervention = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const interventionId = req.params.id;

    try {
        // Vérifier que l'intervention appartient au technicien
        const [check] = await db.query(
            'SELECT * FROM interventions WHERE id = ? AND technicien_id = ?',
            [interventionId, req.session.userId]
        );
        
        if (check.length === 0) {
            return res.status(404).json({ error: 'Intervention non trouvée' });
        }

        await db.query('UPDATE interventions SET statut = "terminée", date_fin = NOW() WHERE id = ?', [interventionId]);
        
        const [row] = await db.query('SELECT TIMESTAMPDIFF(MINUTE, date_debut, NOW()) as duree FROM interventions WHERE id = ?', [interventionId]);
        const duree = row[0].duree;
        await db.query('UPDATE interventions SET duree_totale = ? WHERE id = ?', [duree, interventionId]);
        
        res.json({ message: 'Intervention terminée', duree });
    } catch (err) {
        console.error('Erreur endIntervention:', err);
        res.status(500).json({ error: err.message });
    }
};

// Scanner une plaque d'immatriculation
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
        
        const [vidanges] = await db.query(
            'SELECT * FROM vidanges WHERE vehicule_id = ? ORDER BY date_vidange DESC LIMIT 1',
            [rows[0].id]
        );
        
        res.json({ vehicule: rows[0], derniereVidange: vidanges[0] || null });
    } catch (err) {
        console.error('Erreur scanPlaque:', err);
        res.status(500).json({ error: err.message });
    }
};

// Créer une intervention à partir d'un rendez-vous (pour admin)
const createInterventionFromRdv = async (req, res) => {
    const { rdv_id, technicien_id } = req.body;

    if (!rdv_id || !technicien_id) {
        return res.status(400).json({ error: 'rdv_id et technicien_id sont requis' });
    }

    try {
        // Récupérer les informations du rendez-vous
        const [rdv] = await db.query(
            'SELECT vehicule_id, service_demande FROM rdv WHERE id = ?',
            [rdv_id]
        );
        
        if (rdv.length === 0) {
            return res.status(404).json({ error: 'Rendez-vous non trouvé' });
        }

        // Vérifier si une intervention existe déjà pour ce rdv
        const [existing] = await db.query(
            'SELECT id FROM interventions WHERE rdv_id = ?',
            [rdv_id]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Une intervention existe déjà pour ce rendez-vous' });
        }

        // Vérifier que le technicien existe
        const [technicien] = await db.query(
            'SELECT id FROM utilisateurs WHERE id = ? AND role = "technicien"',
            [technicien_id]
        );
        
        if (technicien.length === 0) {
            return res.status(404).json({ error: 'Technicien non trouvé' });
        }

        // Créer l'intervention
        const [result] = await db.query(
            `INSERT INTO interventions 
            (vehicule_id, technicien_id, rdv_id, statut, description) 
            VALUES (?, ?, ?, "prévue", ?)`,
            [rdv[0].vehicule_id, technicien_id, rdv_id, rdv[0].service_demande]
        );

        res.status(201).json({ 
            id: result.insertId, 
            message: 'Intervention créée avec succès' 
        });
    } catch (err) {
        console.error('Erreur création intervention:', err);
        res.status(500).json({ error: err.message });
    }
};

// Lister toutes les interventions (pour admin)
const getAllInterventions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, 
                   v.immatriculation, v.marque, v.modele,
                   u.nom as client_nom, u.prenom as client_prenom,
                   t.nom as technicien_nom, t.prenom as technicien_prenom
            FROM interventions i
            JOIN vehicules v ON i.vehicule_id = v.id
            JOIN utilisateurs u ON v.client_id = u.id
            LEFT JOIN utilisateurs t ON i.technicien_id = t.id
            ORDER BY i.date_debut DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Erreur getAllInterventions:', err);
        res.status(500).json({ error: err.message });
    }
};

// Modifier une intervention (admin)
const updateIntervention = async (req, res) => {
    const interventionId = req.params.id;
    const { technicien_id, description, statut } = req.body;

    try {
        await db.query(
            'UPDATE interventions SET technicien_id = ?, description = ?, statut = ? WHERE id = ?',
            [technicien_id, description, statut, interventionId]
        );
        res.json({ message: 'Intervention modifiée avec succès' });
    } catch (err) {
        console.error('Erreur updateIntervention:', err);
        res.status(500).json({ error: err.message });
    }
};

// Supprimer une intervention (admin)
const deleteIntervention = async (req, res) => {
    const interventionId = req.params.id;

    try {
        await db.query('DELETE FROM interventions WHERE id = ?', [interventionId]);
        res.json({ message: 'Intervention supprimée avec succès' });
    } catch (err) {
        console.error('Erreur deleteIntervention:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getInterventions,
    startIntervention,
    endIntervention,
    scanPlaque,
    createInterventionFromRdv,
    getAllInterventions,
    updateIntervention,
    deleteIntervention
};