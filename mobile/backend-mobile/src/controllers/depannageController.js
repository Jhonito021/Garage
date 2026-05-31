// backend/src/controllers/depannageController.js
const db = require('../models/db');

// Récupérer les missions du dépanneur (avec paramètre user_id)
const getDepanneurMissions = async (req, res) => {
    // Récupérer l'ID depuis la session OU depuis le paramètre
    let depanneurId = req.session?.userId || req.query.user_id;
    
    console.log('[getDepanneurMissions] Depanneur ID:', depanneurId);
    
    if (!depanneurId) {
        return res.status(401).json({ error: 'Non authentifié - ID manquant' });
    }

    try {
        const [missions] = await db.query(
            `SELECT d.* 
             FROM depannage_demandes d
             WHERE d.id = ? OR d.statut = 'disponible'`,
            [depanneurId]
        );
        
        console.log('[getDepanneurMissions] Missions trouvées:', missions.length);
        
        res.json({ success: true, data: missions });
    } catch (err) {
        console.error('Erreur getDepanneurMissions:', err);
        res.status(500).json({ error: err.message });
    }
};

// Récupérer une mission spécifique
const getDepanneurMissionDetail = async (req, res) => {
    let depanneurId = req.session?.userId || req.query.user_id;
    const { missionId } = req.params;

    if (!depanneurId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [mission] = await db.query(
            `SELECT d.* FROM depannage d
             WHERE d.id = ? AND (d.depanneur_id = ? OR d.statut = 'disponible')`,
            [missionId, depanneurId]
        );

        if (mission.length === 0) {
            return res.status(404).json({ error: 'Mission non trouvée' });
        }

        res.json({ success: true, data: mission[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Accepter une mission
const accepterMission = async (req, res) => {
    let depanneurId = req.session?.userId || req.query.user_id;
    const { missionId } = req.params;

    if (!depanneurId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [result] = await db.query(
            `UPDATE depannage SET statut = 'acceptee', depanneur_id = ?
             WHERE id = ? AND (statut = 'disponible' OR statut = 'en_attente')`,
            [depanneurId, missionId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Impossible d\'accepter cette mission' });
        }

        res.json({ success: true, message: 'Mission acceptée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Mettre en cours une mission
const mettreEnCoursMission = async (req, res) => {
    let depanneurId = req.session?.userId || req.query.user_id;
    const { missionId } = req.params;

    if (!depanneurId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [result] = await db.query(
            `UPDATE depannage SET statut = 'en_cours'
             WHERE id = ? AND depanneur_id = ? AND statut = 'acceptee'`,
            [missionId, depanneurId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Impossible de mettre la mission en cours' });
        }

        res.json({ success: true, message: 'Mission en cours' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Terminer une mission
const terminerMission = async (req, res) => {
    let depanneurId = req.session?.userId || req.query.user_id;
    const { missionId } = req.params;
    const { description_completion } = req.body;

    if (!depanneurId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [result] = await db.query(
            `UPDATE depannage SET statut = 'terminee', description_completion = ?, date_mise_a_jour = NOW()
             WHERE id = ? AND depanneur_id = ?`,
            [description_completion, missionId, depanneurId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Impossible de terminer cette mission' });
        }

        res.json({ success: true, message: 'Mission terminée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Mettre à jour la position GPS
const mettreAJourPosition = async (req, res) => {
    let depanneurId = req.session?.userId || req.query.user_id;
    const { latitude, longitude } = req.body;

    if (!depanneurId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude et longitude requises' });
    }

    try {
        await db.query(
            `UPDATE utilisateurs SET latitude = ?, longitude = ?, date_derniere_position = NOW()
             WHERE id = ? AND role = 'depanneur'`,
            [latitude, longitude, depanneurId]
        );

        res.json({ success: true, message: 'Position mise à jour' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Récupérer le suivi des missions
const getSuiviMissions = async (req, res) => {
    let depanneurId = req.session?.userId || req.query.user_id;

    if (!depanneurId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [suivis] = await db.query(
            `SELECT s.*, d.titre as mission_titre
             FROM suivi_depannage s
             JOIN depannage d ON s.depannage_id = d.id
             WHERE d.depanneur_id = ?
             ORDER BY s.date_creation DESC`,
            [depanneurId]
        );

        res.json({ success: true, data: suivis });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Obtenir le profil du dépanneur
const getDepanneurProfile = async (req, res) => {
    let depanneurId = req.session?.userId || req.query.user_id;

    if (!depanneurId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [user] = await db.query(
            `SELECT id, email, nom, prenom, telephone, adresse, specialites, note_moyenne
             FROM utilisateurs WHERE id = ? AND role = 'depanneur'`,
            [depanneurId]
        );

        if (user.length === 0) {
            return res.status(404).json({ error: 'Dépanneur non trouvé' });
        }

        res.json({ success: true, data: user[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Mettre à jour le profil du dépanneur
const updateDepanneurProfile = async (req, res) => {
    let depanneurId = req.session?.userId || req.query.user_id;
    const { telephone, adresse, specialites } = req.body;

    if (!depanneurId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        await db.query(
            `UPDATE utilisateurs SET telephone = ?, adresse = ?, specialites = ?
             WHERE id = ? AND role = 'depanneur'`,
            [telephone, adresse, specialites, depanneurId]
        );

        res.json({ success: true, message: 'Profil mis à jour' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = {
    getDepanneurMissions,
    getDepanneurMissionDetail,
    accepterMission,
    mettreEnCoursMission,
    terminerMission,
    mettreAJourPosition,
    getSuiviMissions,
    getDepanneurProfile,
    updateDepanneurProfile
};