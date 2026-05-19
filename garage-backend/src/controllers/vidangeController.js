const db = require('../models/db');

// Enregistrer une vidange (technicien)
const createVidange = async (req, res) => {
    if (req.user.role !== 'technicien' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux techniciens' });
    }

    const { vehicule_id, intervention_id, kilometrage, type_huile } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO vidanges (vehicule_id, intervention_id, date_vidange, kilometrage, type_huile) VALUES (?, ?, CURDATE(), ?, ?)',
            [vehicule_id, intervention_id, kilometrage, type_huile]
        );
        
        await db.query('UPDATE vehicules SET kilometrage_actuel = ? WHERE id = ?', [kilometrage, vehicule_id]);
        
        res.status(201).json({ id: result.insertId, message: 'Vidange enregistrée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Récupérer les vidanges par véhicule
const getVidangesByVehicule = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT v.*, i.statut, i.date_debut, i.date_fin
             FROM vidanges v
             LEFT JOIN interventions i ON v.intervention_id = i.id
             WHERE v.vehicule_id = ?
             ORDER BY v.date_vidange DESC`,
            [req.params.vehiculeId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Récupérer toutes les interventions du client
const getClientInterventions = async (req, res) => {
    // Vérifier la session
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const clientId = req.session.userId;

    try {
        // Récupérer les véhicules du client
        const [vehicules] = await db.query(
            'SELECT id FROM vehicules WHERE client_id = ?',
            [clientId]
        );
        
        if (vehicules.length === 0) {
            return res.json([]);
        }
        
        const vehiculeIds = vehicules.map(v => v.id);
        
        // Récupérer les interventions pour ces véhicules
        const [rows] = await db.query(
            `SELECT i.*, 
                    v.immatriculation, v.marque, v.modele,
                    t.nom as technicien_nom, t.prenom as technicien_prenom
             FROM interventions i
             JOIN vehicules v ON i.vehicule_id = v.id
             LEFT JOIN utilisateurs t ON i.technicien_id = t.id
             WHERE v.id IN (?)
             ORDER BY i.date_debut DESC`,
            [vehiculeIds]
        );
        
        res.json(rows);
    } catch (err) {
        console.error('Erreur getClientInterventions:', err);
        res.status(500).json({ error: err.message });
    }
};

// Vérifier si une vidange est due
const checkVidangeDue = async (req, res) => {
    try {
        const [config] = await db.query("SELECT valeur FROM configurations WHERE cle = 'intervalle_vidange_defaut'");
        const intervalle = config[0] ? parseInt(config[0].valeur) : 8000;
        
        const [vehicule] = await db.query('SELECT kilometrage_actuel FROM vehicules WHERE id = ?', [req.params.vehiculeId]);
        const [derniere] = await db.query('SELECT kilometrage FROM vidanges WHERE vehicule_id = ? ORDER BY date_vidange DESC LIMIT 1', [req.params.vehiculeId]);
        
        
        
        const kmParcourus = vehicule[0].kilometrage_actuel - derniere[0].kilometrage;
        const due = kmParcourus >= intervalle;
        const kmRestant = due ? 0 : intervalle - kmParcourus;
        
        res.json({ due, kmParcourus, kmRestant, intervalle });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { 
    createVidange, 
    getVidangesByVehicule, 
    checkVidangeDue,
    getClientInterventions
};