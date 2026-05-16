const db = require('../models/db');

// Lister les véhicules du client connecté
const getVehicules = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est authentifié
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const [rows] = await db.query(
            'SELECT * FROM vehicules WHERE client_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        
        // Retourner un tableau même vide
        res.status(200).json(rows || []);
    } catch (err) {
        console.error('Erreur getVehicules:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des véhicules' });
    }
};

// Ajouter un véhicule
const addVehicule = async (req, res) => {
    const { immatriculation, marque, modele, annee, type_carburant, kilometrage_actuel } = req.body;

    // Vérifier les champs obligatoires
    if (!immatriculation || !marque || !modele) {
        return res.status(400).json({ 
            error: 'Champs manquants. Immatriculation, marque et modèle sont requis.' 
        });
    }

    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    try {
        // Vérifier si l'immatriculation existe déjà pour ce client
        const [existing] = await db.query(
            'SELECT id FROM vehicules WHERE immatriculation = ? AND client_id = ?',
            [immatriculation.toUpperCase(), req.user.id]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Cette immatriculation existe déjà pour votre compte' });
        }

        const [result] = await db.query(
            `INSERT INTO vehicules 
            (client_id, immatriculation, marque, modele, annee, type_carburant, kilometrage_actuel) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id, 
                immatriculation.toUpperCase(), 
                marque, 
                modele, 
                annee || null, 
                type_carburant || null, 
                kilometrage_actuel || 0
            ]
        );

        // Retourner l'ID du nouveau véhicule
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Véhicule ajouté avec succès' 
        });
    } catch (err) {
        console.error('Erreur addVehicule:', err);
        
        // Gérer les erreurs spécifiques
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Cette immatriculation existe déjà' });
        }
        
        res.status(500).json({ error: 'Erreur lors de l\'ajout du véhicule' });
    }
};

// Modifier un véhicule
const updateVehicule = async (req, res) => {
    const { immatriculation, marque, modele, annee, type_carburant } = req.body;
    const vehiculeId = req.params.id;

    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!vehiculeId) {
        return res.status(400).json({ error: 'ID du véhicule requis' });
    }

    try {
        // Vérifier que le véhicule appartient au client
        const [check] = await db.query(
            'SELECT * FROM vehicules WHERE id = ? AND client_id = ?', 
            [vehiculeId, req.user.id]
        );
        
        if (check.length === 0) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        await db.query(
            `UPDATE vehicules SET 
            immatriculation = ?, 
            marque = ?, 
            modele = ?, 
            annee = ?, 
            type_carburant = ? 
            WHERE id = ?`,
            [immatriculation.toUpperCase(), marque, modele, annee || null, type_carburant || null, vehiculeId]
        );
        
        res.status(200).json({ 
            message: 'Véhicule modifié avec succès' 
        });
    } catch (err) {
        console.error('Erreur updateVehicule:', err);
        
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Cette immatriculation existe déjà' });
        }
        
        res.status(500).json({ error: 'Erreur lors de la modification du véhicule' });
    }
};

// Supprimer un véhicule
const deleteVehicule = async (req, res) => {
    const vehiculeId = req.params.id;

    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!vehiculeId) {
        return res.status(400).json({ error: 'ID du véhicule requis' });
    }

    try {
        // Vérifier que le véhicule appartient au client
        const [check] = await db.query(
            'SELECT * FROM vehicules WHERE id = ? AND client_id = ?', 
            [vehiculeId, req.user.id]
        );
        
        if (check.length === 0) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        // Vérifier si le véhicule a des interventions
        const [interventions] = await db.query(
            'SELECT id FROM interventions WHERE vehicule_id = ?', 
            [vehiculeId]
        );
        
        if (interventions.length > 0) {
            return res.status(400).json({ 
                error: 'Impossible de supprimer : ce véhicule a des interventions passées' 
            });
        }

        // Supprimer les vidanges liées (si existantes)
        await db.query('DELETE FROM vidanges WHERE vehicule_id = ?', [vehiculeId]);
        
        // Supprimer les photos liées (si existantes)
        await db.query(
            'DELETE FROM photos WHERE intervention_id IN (SELECT id FROM interventions WHERE vehicule_id = ?)',
            [vehiculeId]
        );
        
        // Supprimer les interventions liées (si existantes)
        await db.query('DELETE FROM interventions WHERE vehicule_id = ?', [vehiculeId]);
        
        // Supprimer les rendez-vous liés (si existants)
        await db.query('DELETE FROM rdv WHERE vehicule_id = ?', [vehiculeId]);
        
        // Supprimer le véhicule
        await db.query('DELETE FROM vehicules WHERE id = ?', [vehiculeId]);
        
        res.status(200).json({ 
            message: 'Véhicule supprimé avec succès' 
        });
    } catch (err) {
        console.error('Erreur deleteVehicule:', err);
        res.status(500).json({ error: 'Erreur lors de la suppression du véhicule' });
    }
};

module.exports = { 
    getVehicules, 
    addVehicule, 
    updateVehicule, 
    deleteVehicule 
};