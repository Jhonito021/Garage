const db = require('../models/db');

// Vérifier si un technicien est disponible sur un créneau
const checkTechnicienDisponibilite = async (technicien_id, date_heure) => {
    const dateDebut = new Date(date_heure);
    const dateFin = new Date(dateDebut);
    dateFin.setHours(dateFin.getHours() + 2);
    
    const [rows] = await db.query(
        `SELECT i.* 
         FROM interventions i
         WHERE i.technicien_id = ? 
         AND i.statut != 'terminée'
         AND (
             (i.date_debut <= ? AND i.date_fin >= ?) OR
             (i.date_debut BETWEEN ? AND ?) OR
             (i.date_fin BETWEEN ? AND ?)
         )`,
        [technicien_id, dateFin, dateDebut, dateDebut, dateFin, dateDebut, dateFin]
    );
    
    return rows.length === 0;
};

// Lister les interventions du technicien connecté
const getInterventions = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [rows] = await db.query(
            `SELECT i.*, v.immatriculation, v.marque, v.modele, u.nom, u.prenom, r.date_heure as rdv_date
             FROM interventions i 
             JOIN vehicules v ON i.vehicule_id = v.id 
             JOIN utilisateurs u ON v.client_id = u.id 
             LEFT JOIN rdv r ON i.rdv_id = r.id
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
        const [check] = await db.query(
            `SELECT i.*, r.date_heure as rdv_date 
             FROM interventions i 
             LEFT JOIN rdv r ON i.rdv_id = r.id 
             WHERE i.id = ? AND i.technicien_id = ?`,
            [interventionId, req.session.userId]
        );
        
        if (check.length === 0) {
            return res.status(404).json({ error: 'Intervention non trouvée' });
        }

        const intervention = check[0];
        
        const dateActuelle = new Date();
        const datePrevue = intervention.rdv_date ? new Date(intervention.rdv_date) : new Date(intervention.date_debut);
        
        if (datePrevue && !isNaN(datePrevue.getTime())) {
            const diffTime = Math.abs(dateActuelle - datePrevue);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                return res.status(400).json({ 
                    error: 'Impossible de démarrer cette intervention car la date actuelle ne correspond pas à la date prévue par le client.',
                    datePrevue: datePrevue.toLocaleDateString('fr-FR'),
                    dateActuelle: dateActuelle.toLocaleDateString('fr-FR')
                });
            }
        }

        if (intervention.statut === 'en_cours') {
            return res.status(400).json({ error: 'Cette intervention est déjà en cours' });
        }
        
        if (intervention.statut === 'terminée') {
            return res.status(400).json({ error: 'Cette intervention est déjà terminée' });
        }

        await db.query('UPDATE interventions SET statut = "en_cours", date_debut = NOW() WHERE id = ?', [interventionId]);
        
        res.json({ message: 'Intervention démarrée avec succès' });
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

// Scanner une plaque
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

// Créer une intervention à partir d'un rendez-vous (avec tarif automatique)
const createInterventionFromRdv = async (req, res) => {
    const { rdv_id, technicien_id, prix_intervention } = req.body;

    if (!rdv_id || !technicien_id) {
        return res.status(400).json({ error: 'rdv_id et technicien_id sont requis' });
    }

    try {
        // Récupérer les informations du rendez-vous
        const [rdv] = await db.query(
            'SELECT vehicule_id, service_demande, date_heure FROM rdv WHERE id = ?',
            [rdv_id]
        );
        
        if (rdv.length === 0) {
            return res.status(404).json({ error: 'Rendez-vous non trouvé' });
        }

        // Récupérer le tarif par défaut selon le service
        const tarifMap = {
            'Vidange': 'tarif_vidange',
            'Contrôle technique': 'tarif_ct',
            'Réparation': 'tarif_reparation',
            'Entretien courant': 'tarif_entretien',
            'Pneumatiques': 'tarif_pneumatiques'
        };
        
        const tarifKey = tarifMap[rdv[0].service_demande];
        let prix = prix_intervention || 0;
        
        if (tarifKey && (!prix_intervention || prix_intervention === 0)) {
            const [tarif] = await db.query(
                'SELECT valeur FROM configurations WHERE cle = ?',
                [tarifKey]
            );
            if (tarif.length > 0) {
                prix = parseFloat(tarif[0].valeur) || 0;
            }
        }

        // Vérifier si une intervention existe déjà
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

        // Vérifier la disponibilité du technicien
        const estDisponible = await checkTechnicienDisponibilite(technicien_id, rdv[0].date_heure);
        
        if (!estDisponible) {
            return res.status(409).json({ 
                error: 'Ce technicien est déjà assigné à une autre intervention sur ce créneau' 
            });
        }

        // Créer l'intervention avec le prix
        const [result] = await db.query(
            `INSERT INTO interventions 
            (vehicule_id, technicien_id, rdv_id, statut, description, type_prestation, date_debut, prix_intervention) 
            VALUES (?, ?, ?, "prévue", ?, ?, ?, ?)`,
            [rdv[0].vehicule_id, technicien_id, rdv_id, rdv[0].service_demande, rdv[0].service_demande, rdv[0].date_heure, prix]
        );

        res.status(201).json({ 
            id: result.insertId, 
            message: 'Intervention créée avec succès',
            prix_applique: prix
        });
    } catch (err) {
        console.error('Erreur création intervention:', err);
        res.status(500).json({ error: err.message });
    }
};

// Vérifier la disponibilité d'un technicien
const checkDisponibilite = async (req, res) => {
    const { technicien_id, date_heure } = req.query;
    
    if (!technicien_id || !date_heure) {
        return res.status(400).json({ error: 'technicien_id et date_heure sont requis' });
    }
    
    try {
        const estDisponible = await checkTechnicienDisponibilite(technicien_id, date_heure);
        res.json({ disponible: estDisponible });
    } catch (err) {
        console.error('Erreur vérification disponibilité:', err);
        res.status(500).json({ error: err.message });
    }
};

// Lister toutes les interventions (admin)
const getAllInterventions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, 
                   v.immatriculation, v.marque, v.modele,
                   u.nom as client_nom, u.prenom as client_prenom,
                   t.nom as technicien_nom, t.prenom as technicien_prenom,
                   r.date_heure as rdv_date
            FROM interventions i
            JOIN vehicules v ON i.vehicule_id = v.id
            JOIN utilisateurs u ON v.client_id = u.id
            LEFT JOIN utilisateurs t ON i.technicien_id = t.id
            LEFT JOIN rdv r ON i.rdv_id = r.id
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
    const { technicien_id, description, type_prestation, statut, prix_intervention } = req.body;

    try {
        await db.query(
            'UPDATE interventions SET technicien_id = ?, description = ?, type_prestation = ?, statut = ?, prix_intervention = ? WHERE id = ?',
            [technicien_id, description, type_prestation, statut, prix_intervention, interventionId]
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

// Récupérer les interventions du client
const getClientInterventions = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [rows] = await db.query(`
            SELECT 
                i.id,
                i.vehicule_id,
                i.technicien_id,
                i.rdv_id,
                i.statut,
                i.description,
                i.type_prestation,
                i.date_debut,
                i.date_fin,
                i.duree_totale,
                i.prix_intervention,
                v.immatriculation,
                v.marque,
                v.modele,
                r.service_demande,
                r.date_heure as rdv_date
            FROM interventions i
            JOIN vehicules v ON i.vehicule_id = v.id
            LEFT JOIN rdv r ON i.rdv_id = r.id
            WHERE v.client_id = ?
            ORDER BY i.date_debut DESC
        `, [req.session.userId]);
        
        res.json(rows);
    } catch (err) {
        console.error('Erreur getClientInterventions:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getInterventions,
    startIntervention,
    endIntervention,
    scanPlaque,
    createInterventionFromRdv,
    checkDisponibilite,
    getAllInterventions,
    updateIntervention,
    deleteIntervention,
    getClientInterventions
};