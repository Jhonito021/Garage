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
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [rows] = await db.query(
            `SELECT d.*, 
                    u.nom as technicien_nom, 
                    u.prenom as technicien_prenom 
             FROM depannage_demandes d
             LEFT JOIN utilisateurs u ON d.technicien_id = u.id
             ORDER BY 
               CASE d.statut 
                 WHEN 'en_attente' THEN 1 
                 WHEN 'acceptee' THEN 2 
                 WHEN 'terminee' THEN 3 
                 ELSE 4 
               END,
               d.date_demande DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Erreur getDemandesDepannage:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Technicien/Dépanneur - Récupérer les demandes disponibles et assignées
 */
const getTechnicienDemandes = async (req, res) => {
    // Vérifier l'authentification
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    let technicienId = req.session.userId;
    
    // Si l'utilisateur est admin, prendre le premier technicien pour les tests
    if (req.session.userRole === 'admin') {
        const [techniciens] = await db.query(
            'SELECT id FROM utilisateurs WHERE role = "technicien" LIMIT 1'
        );
        if (techniciens.length > 0) {
            technicienId = techniciens[0].id;
        }
    }

    try {
        const [rows] = await db.query(
            `SELECT * FROM depannage_demandes 
             WHERE technicien_id = ? OR (statut = 'en_attente' AND technicien_id IS NULL)
             ORDER BY 
               CASE statut 
                 WHEN 'en_attente' THEN 1 
                 WHEN 'acceptee' THEN 2 
                 ELSE 3 
               END,
               date_demande DESC`,
            [technicienId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Erreur getTechnicienDemandes:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Admin - Accepter une demande (assigner un technicien)
 */
const accepterDemande = async (req, res) => {
    if (!req.session || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const { id } = req.params;
    const { technicien_id } = req.body;

    try {
        const [demande] = await db.query(
            'SELECT client_id FROM depannage_demandes WHERE id = ?',
            [id]
        );

        if (demande.length === 0) {
            return res.status(404).json({ error: 'Demande non trouvée' });
        }

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
 * Admin - Refuser une demande
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
 * Technicien/Dépanneur - Accepter une mission
 */
const accepterMission = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;
    let technicienId = req.session.userId;

    // Si l'utilisateur est admin, prendre le premier technicien pour les tests
    if (req.session.userRole === 'admin') {
        const [techniciens] = await db.query(
            'SELECT id FROM utilisateurs WHERE role = "technicien" LIMIT 1'
        );
        if (techniciens.length > 0) {
            technicienId = techniciens[0].id;
        }
    }

    try {
        // Vérifier que la mission existe et est en attente
        const [demande] = await db.query(
            'SELECT id, statut FROM depannage_demandes WHERE id = ? AND statut = "en_attente"',
            [id]
        );

        if (demande.length === 0) {
            return res.status(404).json({ error: 'Mission non disponible ou déjà acceptée' });
        }

        await db.query(
            `UPDATE depannage_demandes 
             SET statut = 'acceptee', 
                 technicien_id = ?,
                 date_traitement = NOW() 
             WHERE id = ?`,
            [technicienId, id]
        );

        res.json({ success: true, message: 'Mission acceptée' });
    } catch (err) {
        console.error('Erreur accepterMission:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Technicien/Dépanneur - Terminer une mission
 */
const terminerMission = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;
    let technicienId = req.session.userId;

    // Si l'utilisateur est admin, prendre le premier technicien pour les tests
    if (req.session.userRole === 'admin') {
        const [techniciens] = await db.query(
            'SELECT id FROM utilisateurs WHERE role = "technicien" LIMIT 1'
        );
        if (techniciens.length > 0) {
            technicienId = techniciens[0].id;
        }
    }

    try {
        // Vérifier que la mission appartient au technicien
        const [demande] = await db.query(
            'SELECT id FROM depannage_demandes WHERE id = ? AND technicien_id = ?',
            [id, technicienId]
        );

        if (demande.length === 0) {
            return res.status(404).json({ error: 'Mission non trouvée' });
        }

        await db.query(
            `UPDATE depannage_demandes 
             SET statut = 'terminee', date_arrivee = NOW() 
             WHERE id = ?`,
            [id]
        );

        res.json({ success: true, message: 'Mission terminée' });
    } catch (err) {
        console.error('Erreur terminerMission:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Client - Suivre l'état d'une demande
 */
const suivreDemande = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT id, statut, lat, lng, date_demande, date_traitement, date_arrivee,
                    (SELECT nom FROM utilisateurs WHERE id = technicien_id) as technicien_nom,
                    (SELECT prenom FROM utilisateurs WHERE id = technicien_id) as technicien_prenom
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

/**
 * Technicien/Dépanneur - Mettre à jour sa position GPS
 */
const mettreAJourPositionTechnicien = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { demande_id, lat, lng } = req.body;

    if (!demande_id || !lat || !lng) {
        return res.status(400).json({ error: 'demande_id, lat et lng requis' });
    }

    let technicienId = req.session.userId;

    // Si l'utilisateur est admin, prendre le premier technicien pour les tests
    if (req.session.userRole === 'admin') {
        const [techniciens] = await db.query(
            'SELECT id FROM utilisateurs WHERE role = "technicien" LIMIT 1'
        );
        if (techniciens.length > 0) {
            technicienId = techniciens[0].id;
        }
    }

    try {
        // Vérifier que la mission appartient au technicien
        const [demande] = await db.query(
            'SELECT id FROM depannage_demandes WHERE id = ? AND technicien_id = ?',
            [demande_id, technicienId]
        );

        if (demande.length === 0) {
            return res.status(404).json({ error: 'Mission non trouvée' });
        }

        await db.query(
            `UPDATE depannage_demandes 
             SET technicien_lat = ?, technicien_lng = ?,
                 derniere_mise_a_jour = NOW()
             WHERE id = ?`,
            [lat, lng, demande_id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Erreur mettreAJourPositionTechnicien:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Client - Terminer un dépannage (confirmation arrivée)
 */
const terminerDepannage = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;

    try {
        const [demande] = await db.query(
            'SELECT id, statut FROM depannage_demandes WHERE id = ? AND client_id = ?',
            [id, req.session.userId]
        );

        if (demande.length === 0) {
            return res.status(404).json({ error: 'Demande non trouvée' });
        }

        if (demande[0].statut !== 'acceptee') {
            return res.status(400).json({ error: 'Impossible de terminer: mission non acceptée' });
        }

        await db.query(
            `UPDATE depannage_demandes 
             SET statut = 'terminee', date_arrivee = NOW() 
             WHERE id = ?`,
            [id]
        );

        res.json({ success: true, message: 'Dépannage terminé' });
    } catch (err) {
        console.error('Erreur terminerDepannage:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Statistiques pour le dashboard admin
 */
const getDepannageStats = async (req, res) => {
    if (!req.session || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Accès non autorisé' });
    }

    try {
        const [stats] = await db.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
                SUM(CASE WHEN statut = 'acceptee' THEN 1 ELSE 0 END) as en_cours,
                SUM(CASE WHEN statut = 'terminee' THEN 1 ELSE 0 END) as terminees,
                SUM(CASE WHEN statut = 'refusee' THEN 1 ELSE 0 END) as refusees
             FROM depannage_demandes
             WHERE MONTH(date_demande) = MONTH(CURDATE())
             AND YEAR(date_demande) = YEAR(CURDATE())`
        );
        res.json(stats[0]);
    } catch (err) {
        console.error('Erreur getDepannageStats:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Route de test pour vérifier la session
 */
const testSession = async (req, res) => {
    res.json({
        hasSession: !!req.session,
        userId: req.session?.userId,
        userRole: req.session?.userRole,
        userEmail: req.session?.userEmail,
        sessionID: req.sessionID
    });
};

/**
 * Admin - Récupérer la liste des dépanneurs (techniciens)
 */
const getDepanneurs = async (req, res) => {
    // VERSION TEST - À ENLEVER EN PRODUCTION
    // Permet l'accès pour les tests sans vérification de rôle
    
    // Vérifier juste que l'utilisateur est connecté
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [rows] = await db.query(
            `SELECT id, nom, prenom, email, telephone, specialite, actif 
             FROM utilisateurs 
             WHERE role = 'technicien' AND actif = 1
             ORDER BY nom, prenom`
        );
        res.json(rows);
    } catch (err) {
        console.error('Erreur getDepanneurs:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Admin - Assigner un dépanneur à une demande
 */
const assignerDepanneur = async (req, res) => {
    // VERSION TEST - À ENLEVER EN PRODUCTION
    
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;
    const { technicien_id } = req.body;

    if (!technicien_id) {
        return res.status(400).json({ error: 'Veuillez sélectionner un dépanneur' });
    }

    try {
        // Vérifier que la demande existe
        const [demande] = await db.query(
            'SELECT id, statut FROM depannage_demandes WHERE id = ?',
            [id]
        );

        if (demande.length === 0) {
            return res.status(404).json({ error: 'Demande non trouvée' });
        }

        if (demande[0].statut !== 'en_attente') {
            return res.status(400).json({ error: 'Cette demande a déjà été traitée' });
        }

        const [technicien] = await db.query(
            'SELECT id, nom, prenom FROM utilisateurs WHERE id = ? AND role = "technicien" AND actif = 1',
            [technicien_id]
        );

        if (technicien.length === 0) {
            return res.status(404).json({ error: 'Dépanneur non trouvé' });
        }

        await db.query(
            `UPDATE depannage_demandes 
             SET technicien_id = ?, 
                 statut = 'acceptee',
                 date_traitement = NOW()
             WHERE id = ?`,
            [technicien_id, id]
        );

        res.json({ 
            success: true, 
            message: `Dépanneur assigné avec succès`
        });
    } catch (err) {
        console.error('Erreur assignerDepanneur:', err);
        res.status(500).json({ error: err.message });
    }
};

// Export de toutes les fonctions
module.exports = {
    demanderDepannage,
    getDemandesDepannage,
    getTechnicienDemandes,
    accepterDemande,
    refuserDemande,
    accepterMission,
    terminerMission,
    suivreDemande,
    mettreAJourPositionTechnicien,
    terminerDepannage,
    getDepannageStats,
    testSession,
    getDepanneurs,        // NOUVEAU
    assignerDepanneur     // NOUVEAU
};