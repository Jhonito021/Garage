const db = require('../models/db');

// Lister les interventions du technicien connecté
const getInterventions = async (req, res) => {
    if (req.user.role !== 'technicien' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux techniciens' });
    }

    try {
        const [rows] = await db.query(
            `SELECT i.*, v.immatriculation, v.marque, v.modele, u.nom, u.prenom 
             FROM interventions i 
             JOIN vehicules v ON i.vehicule_id = v.id 
             JOIN utilisateurs u ON v.client_id = u.id 
             WHERE i.technicien_id = ? 
             ORDER BY i.date_debut DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Pointer début d'intervention
const startIntervention = async (req, res) => {
    const interventionId = req.params.id;
    const io = req.app.get('io');

    if (req.user.role !== 'technicien' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux techniciens' });
    }

    try {
        const [check] = await db.query('SELECT * FROM interventions WHERE id = ? AND technicien_id = ?', [interventionId, req.user.id]);
        if (check.length === 0) {
            return res.status(404).json({ error: 'Intervention non trouvée' });
        }

        await db.query('UPDATE interventions SET statut = "en_cours", date_debut = NOW() WHERE id = ?', [interventionId]);
        
        io.emit('planning_update', { interventionId, statut: 'en_cours' });
        
        res.json({ message: 'Intervention démarrée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Pointer fin d'intervention
const endIntervention = async (req, res) => {
    const interventionId = req.params.id;
    const io = req.app.get('io');

    if (req.user.role !== 'technicien' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux techniciens' });
    }

    try {
        const [check] = await db.query('SELECT * FROM interventions WHERE id = ? AND technicien_id = ?', [interventionId, req.user.id]);
        if (check.length === 0) {
            return res.status(404).json({ error: 'Intervention non trouvée' });
        }

        await db.query('UPDATE interventions SET statut = "terminée", date_fin = NOW() WHERE id = ?', [interventionId]);
        
        // Calculer durée
        const [row] = await db.query('SELECT TIMESTAMPDIFF(MINUTE, date_debut, NOW()) as duree FROM interventions WHERE id = ?', [interventionId]);
        const duree = row[0].duree;
        await db.query('UPDATE interventions SET duree_totale = ? WHERE id = ?', [duree, interventionId]);
        
        io.emit('planning_update', { interventionId, statut: 'terminée' });
        
        res.json({ message: 'Intervention terminée', duree });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Scanner une plaque d'immatriculation
const scanPlaque = async (req, res) => {
    const plaque = req.params.plaque;

    if (req.user.role !== 'technicien' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux techniciens' });
    }

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
        
        // Récupérer historique des vidanges
        const [vidanges] = await db.query(
            'SELECT * FROM vidanges WHERE vehicule_id = ? ORDER BY date_vidange DESC LIMIT 1',
            [rows[0].id]
        );
        
        res.json({ vehicule: rows[0], derniereVidange: vidanges[0] || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getInterventions, startIntervention, endIntervention, scanPlaque };