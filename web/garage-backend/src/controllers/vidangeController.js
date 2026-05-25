const db = require('../models/db');

// Enregistrer une vidange (technicien)
const createVidange = async (req, res) => {
    const { vehicule_id, intervention_id, kilometrage, type_huile } = req.body;

    // Vérifier les champs requis
    if (!vehicule_id || !intervention_id || !kilometrage) {
        return res.status(400).json({ error: 'Veuillez fournir vehicule_id, intervention_id et kilometrage' });
    }

    try {
        // Vérifier que l'intervention existe
        const [intervention] = await db.query(
            'SELECT id FROM interventions WHERE id = ?',
            [intervention_id]
        );
        
        if (intervention.length === 0) {
            return res.status(404).json({ error: 'Intervention non trouvée' });
        }

        // Vérifier que le véhicule existe
        const [vehicule] = await db.query(
            'SELECT id FROM vehicules WHERE id = ?',
            [vehicule_id]
        );
        
        if (vehicule.length === 0) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        // Vérifier si une vidange existe déjà pour cette intervention
        const [existing] = await db.query(
            'SELECT id FROM vidanges WHERE intervention_id = ?',
            [intervention_id]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Une vidange a déjà été enregistrée pour cette intervention' });
        }

        // Insérer la vidange
        const [result] = await db.query(
            `INSERT INTO vidanges 
            (vehicule_id, intervention_id, date_vidange, kilometrage, type_huile) 
            VALUES (?, ?, CURDATE(), ?, ?)`,
            [vehicule_id, intervention_id, kilometrage, type_huile || 'synthétique']
        );
        
        // Mettre à jour le kilométrage du véhicule
        await db.query(
            'UPDATE vehicules SET kilometrage_actuel = ? WHERE id = ?',
            [kilometrage, vehicule_id]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Vidange enregistrée avec succès' 
        });
    } catch (err) {
        console.error('Erreur createVidange:', err);
        res.status(500).json({ error: err.message });
    }
};

// Récupérer les vidanges par véhicule (pour l'historique client)
const getVidangesByVehicule = async (req, res) => {
    const vehiculeId = req.params.vehiculeId;

    try {
        const [rows] = await db.query(
            `SELECT v.*, i.statut, i.date_debut, i.date_fin
             FROM vidanges v
             LEFT JOIN interventions i ON v.intervention_id = i.id
             WHERE v.vehicule_id = ?
             ORDER BY v.date_vidange DESC`,
            [vehiculeId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Erreur getVidangesByVehicule:', err);
        res.status(500).json({ error: err.message });
    }
};

// Vérifier si une vidange est due pour un véhicule
const checkVidangeDue = async (req, res) => {
    const vehiculeId = req.params.vehiculeId;

    try {
        // Récupérer l'intervalle par défaut
        const [config] = await db.query(
            "SELECT valeur FROM configurations WHERE cle = 'intervalle_vidange_defaut'"
        );
        const intervalle = config[0] ? parseInt(config[0].valeur) : 8000;
        
        // Récupérer le kilométrage actuel du véhicule
        const [vehicule] = await db.query(
            'SELECT kilometrage_actuel FROM vehicules WHERE id = ?',
            [vehiculeId]
        );
        
        if (vehicule.length === 0) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }
        
        // Récupérer la dernière vidange
        const [derniere] = await db.query(
            'SELECT kilometrage FROM vidanges WHERE vehicule_id = ? ORDER BY date_vidange DESC LIMIT 1',
            [vehiculeId]
        );
        
        if (derniere.length === 0) {
            return res.json({ 
                due: false, 
                message: 'Aucune vidange enregistrée pour ce véhicule' 
            });
        }
        
        const kmParcourus = vehicule[0].kilometrage_actuel - derniere[0].kilometrage;
        const due = kmParcourus >= intervalle;
        const kmRestant = due ? 0 : intervalle - kmParcourus;
        
        res.json({ 
            due, 
            kmParcourus, 
            kmRestant, 
            intervalle,
            dernierKm: derniere[0].kilometrage,
            kmActuel: vehicule[0].kilometrage_actuel
        });
    } catch (err) {
        console.error('Erreur checkVidangeDue:', err);
        res.status(500).json({ error: err.message });
    }
};

// Récupérer toutes les interventions du client (pour suivi)
const getClientInterventions = async (req, res) => {
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

// Récupérer l'historique complet des vidanges d'un client
const getClientVidangesHistory = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const clientId = req.session.userId;

    try {
        const [rows] = await db.query(
            `SELECT 
                v.id,
                v.date_vidange,
                v.kilometrage,
                v.type_huile,
                ve.marque,
                ve.modele,
                ve.immatriculation,
                i.description
             FROM vidanges v
             JOIN vehicules ve ON v.vehicule_id = ve.id
             JOIN interventions i ON v.intervention_id = i.id
             WHERE ve.client_id = ?
             ORDER BY v.date_vidange DESC`,
            [clientId]
        );
        
        res.json(rows);
    } catch (err) {
        console.error('Erreur getClientVidangesHistory:', err);
        res.status(500).json({ error: err.message });
    }
};

// Supprimer une vidange (admin)
const deleteVidange = async (req, res) => {
    const vidangeId = req.params.id;

    try {
        const [vidange] = await db.query(
            'SELECT id FROM vidanges WHERE id = ?',
            [vidangeId]
        );
        
        if (vidange.length === 0) {
            return res.status(404).json({ error: 'Vidange non trouvée' });
        }

        await db.query('DELETE FROM vidanges WHERE id = ?', [vidangeId]);
        res.json({ message: 'Vidange supprimée avec succès' });
    } catch (err) {
        console.error('Erreur deleteVidange:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { 
    createVidange, 
    getVidangesByVehicule, 
    checkVidangeDue,
    getClientInterventions,
    getClientVidangesHistory,
    deleteVidange
};