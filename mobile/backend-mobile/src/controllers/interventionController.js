// backend/src/controllers/interventionController.js
const db = require('../models/db');

// Récupérer les interventions du technicien
const getTechnicienInterventions = async (req, res) => {
    // Récupérer l'ID depuis la session OU depuis le paramètre
    let technicienId = req.session?.userId || req.query.user_id;
    
    console.log('[getTechnicienInterventions] Technicien ID:', technicienId);
    
    if (!technicienId) {
        return res.status(401).json({ error: 'Non authentifié - ID manquant' });
    }

    try {
        const [interventions] = await db.query(
            `SELECT 
                i.id,  
                i.description, 
                i.date_debut,
                i.date_fin,
                v.marque, 
                v.modele,
                v.immatriculation
             FROM interventions i
             LEFT JOIN vehicules v ON i.vehicule_id = v.id
             WHERE i.technicien_id = ?`,
            [technicienId]
        );
        
        res.json({ success: true, data: interventions });
    } catch (err) {
        console.error('Erreur getTechnicienInterventions:', err);
        res.status(500).json({ error: err.message });
    }
};

// Récupérer une intervention spécifique
const getTechnicienInterventionDetail = async (req, res) => {
    let technicienId = req.session?.userId || req.query.user_id;
    const { interventionId } = req.params;

    if (!technicienId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [intervention] = await db.query(
            `SELECT i.*, 
                    v.marque, 
                    v.modele, 
                    v.immatriculation, 
                    u.nom as client_nom, 
                    u.prenom as client_prenom,
                    u.telephone as client_tel
             FROM interventions i
             LEFT JOIN vehicules v ON i.vehicule_id = v.id
             LEFT JOIN utilisateurs u ON v.client_id = u.id
             WHERE i.id = ? AND i.technicien_id = ?`,
            [interventionId, technicienId]
        );

        if (intervention.length === 0) {
            return res.status(404).json({ error: 'Intervention non trouvée' });
        }

        res.json({ success: true, data: intervention[0] });
    } catch (err) {
        console.error('Erreur getTechnicienInterventionDetail:', err);
        res.status(500).json({ error: err.message });
    }
};

// Accepter une intervention
const accepterIntervention = async (req, res) => {
    let technicienId = req.session?.userId || req.query.user_id;
    const { interventionId } = req.params;

    if (!technicienId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [result] = await db.query(
            `UPDATE interventions SET statut = 'acceptee', technicien_id = ?
             WHERE id = ? AND (statut = 'en_attente' OR technicien_id = ?)`,
            [technicienId, interventionId, technicienId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Impossible d\'accepter cette intervention' });
        }

        res.json({ success: true, message: 'Intervention acceptée' });
    } catch (err) {
        console.error('Erreur accepterIntervention:', err);
        res.status(500).json({ error: err.message });
    }
};

// Démarrer une intervention
const demarrerIntervention = async (req, res) => {
    let technicienId = req.session?.userId || req.query.user_id;
    const { interventionId } = req.params;

    if (!technicienId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [result] = await db.query(
            `UPDATE interventions SET statut = 'en_cours', date_debut = NOW()
             WHERE id = ? AND technicien_id = ? AND statut = 'acceptee'`,
            [interventionId, technicienId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Impossible de démarrer cette intervention' });
        }

        res.json({ success: true, message: 'Intervention démarrée' });
    } catch (err) {
        console.error('Erreur demarrerIntervention:', err);
        res.status(500).json({ error: err.message });
    }
};

// Terminer une intervention
const terminerIntervention = async (req, res) => {
    let technicienId = req.session?.userId || req.query.user_id;
    const { interventionId } = req.params;
    const { description_completion, cout } = req.body;

    if (!technicienId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [result] = await db.query(
            `UPDATE interventions SET statut = 'terminee', description_completion = ?, cout = ?, date_fin = NOW()
             WHERE id = ? AND technicien_id = ? AND statut = 'en_cours'`,
            [description_completion || null, cout || null, interventionId, technicienId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Impossible de terminer cette intervention' });
        }

        res.json({ success: true, message: 'Intervention terminée' });
    } catch (err) {
        console.error('Erreur terminerIntervention:', err);
        res.status(500).json({ error: err.message });
    }
};

// Obtenir le profil du technicien
const getTechnicienProfile = async (req, res) => {
    let technicienId = req.session?.userId || req.query.user_id;

    if (!technicienId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [user] = await db.query(
            `SELECT id, email, nom, prenom, telephone, adresse, specialites, competences
             FROM utilisateurs WHERE id = ? AND role = 'technicien'`,
            [technicienId]
        );

        if (user.length === 0) {
            return res.status(404).json({ error: 'Technicien non trouvé' });
        }

        res.json({ success: true, data: user[0] });
    } catch (err) {
        console.error('Erreur getTechnicienProfile:', err);
        res.status(500).json({ error: err.message });
    }
};

// Mettre à jour le profil du technicien
const updateTechnicienProfile = async (req, res) => {
    let technicienId = req.session?.userId || req.query.user_id;
    const { telephone, adresse, specialites, competences } = req.body;

    if (!technicienId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        await db.query(
            `UPDATE utilisateurs SET telephone = ?, adresse = ?, specialites = ?, competences = ?
             WHERE id = ? AND role = 'technicien'`,
            [telephone, adresse, specialites, competences, technicienId]
        );

        res.json({ success: true, message: 'Profil mis à jour' });
    } catch (err) {
        console.error('Erreur updateTechnicienProfile:', err);
        res.status(500).json({ error: err.message });
    }
};

// Ajouter une note
const ajouterNote = async (req, res) => {
    let technicienId = req.session?.userId || req.query.user_id;
    const { interventionId } = req.params;
    const { note, commentaire } = req.body;

    if (!technicienId || !note) {
        return res.status(400).json({ error: 'Données manquantes' });
    }

    if (note < 1 || note > 5) {
        return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
    }

    try {
        await db.query(
            `UPDATE interventions SET note = ?, commentaire_note = ?
             WHERE id = ? AND technicien_id = ?`,
            [note, commentaire, interventionId, technicienId]
        );

        res.json({ success: true, message: 'Note ajoutée' });
    } catch (err) {
        console.error('Erreur ajouterNote:', err);
        res.status(500).json({ error: err.message });
    }
};

// Obtenir les statistiques du technicien
const getTechnicienStats = async (req, res) => {
    let technicienId = req.session?.userId || req.query.user_id;

    if (!technicienId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [stats] = await db.query(
            `SELECT 
                COUNT(*) as total_interventions,
                SUM(CASE WHEN statut = 'terminee' THEN 1 ELSE 0 END) as interventions_terminees,
                SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as interventions_en_cours,
                AVG(note) as note_moyenne
             FROM interventions WHERE technicien_id = ?`,
            [technicienId]
        );

        res.json({ success: true, data: stats[0] });
    } catch (err) {
        console.error('Erreur getTechnicienStats:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getTechnicienInterventions,
    getTechnicienInterventionDetail,
    accepterIntervention,
    demarrerIntervention,
    terminerIntervention,
    getTechnicienProfile,
    updateTechnicienProfile,
    ajouterNote,
    getTechnicienStats
};