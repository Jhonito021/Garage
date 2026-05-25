const db = require('../models/db');

// Récupérer toutes les interventions du client connecté
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
            `SELECT 
                i.id,
                i.vehicule_id,
                i.statut,
                i.description,
                i.date_debut,
                i.date_fin,
                i.duree_totale,
                v.immatriculation,
                v.marque,
                v.modele,
                v.kilometrage_actuel,
                t.nom as technicien_nom,
                t.prenom as technicien_prenom
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

// Récupérer le détail d'une intervention spécifique
const getInterventionById = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const interventionId = req.params.id;
    const clientId = req.session.userId;

    try {
        const [rows] = await db.query(
            `SELECT 
                i.*,
                v.immatriculation,
                v.marque,
                v.modele,
                v.kilometrage_actuel,
                t.nom as technicien_nom,
                t.prenom as technicien_prenom
             FROM interventions i
             JOIN vehicules v ON i.vehicule_id = v.id
             LEFT JOIN utilisateurs t ON i.technicien_id = t.id
             WHERE i.id = ? AND v.client_id = ?`,
            [interventionId, clientId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Intervention non trouvée' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Erreur getInterventionById:', err);
        res.status(500).json({ error: err.message });
    }
};

// Récupérer les statistiques des interventions du client
const getInterventionStats = async (req, res) => {
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
            return res.json({
                total: 0,
                en_cours: 0,
                terminees: 0,
                prevues: 0
            });
        }
        
        const vehiculeIds = vehicules.map(v => v.id);
        
        // Récupérer les statistiques
        const [stats] = await db.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
                SUM(CASE WHEN statut = 'terminée' THEN 1 ELSE 0 END) as terminees,
                SUM(CASE WHEN statut = 'prévue' THEN 1 ELSE 0 END) as prevues
             FROM interventions i
             WHERE i.vehicule_id IN (?)
            `,
            [vehiculeIds]
        );
        
        res.json({
            total: stats[0].total || 0,
            en_cours: stats[0].en_cours || 0,
            terminees: stats[0].terminees || 0,
            prevues: stats[0].prevues || 0
        });
    } catch (err) {
        console.error('Erreur getInterventionStats:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { 
    getClientInterventions, 
    getInterventionById,
    getInterventionStats
};