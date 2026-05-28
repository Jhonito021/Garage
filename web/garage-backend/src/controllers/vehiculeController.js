// backend/src/controllers/vehiculeController.js
const db = require('../models/db');

/**
 * Récupérer tous les véhicules du client connecté
 */
const getVehicules = async (req, res) => {
    // Vérification de l'authentification
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const [rows] = await db.query(
            'SELECT * FROM vehicules WHERE client_id = ? ORDER BY created_at DESC',
            [req.session.userId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Erreur getVehicules:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Ajouter un véhicule
 */
const addVehicule = async (req, res) => {
    // Vérification de l'authentification
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { immatriculation, marque, modele, annee, type_carburant, kilometrage_actuel } = req.body;

    // Validation des champs obligatoires
    if (!immatriculation || !marque || !modele) {
        return res.status(400).json({ error: 'Immatriculation, marque et modèle sont requis' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO vehicules 
            (client_id, immatriculation, marque, modele, annee, type_carburant, kilometrage_actuel) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.session.userId, 
                immatriculation.toUpperCase(), 
                marque, 
                modele, 
                annee || null, 
                type_carburant || null, 
                kilometrage_actuel || 0
            ]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Véhicule ajouté avec succès' 
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Cette immatriculation existe déjà' });
        } else {
            console.error('Erreur addVehicule:', err);
            res.status(500).json({ error: err.message });
        }
    }
};

/**
 * Modifier un véhicule
 */
const updateVehicule = async (req, res) => {
    // Vérification de l'authentification
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { immatriculation, marque, modele, annee, type_carburant, kilometrage_actuel } = req.body;
    const vehiculeId = req.params.id;

    // Validation des champs obligatoires
    if (!immatriculation || !marque || !modele) {
        return res.status(400).json({ error: 'Immatriculation, marque et modèle sont requis' });
    }

    try {
        // Vérifier que le véhicule appartient bien au client
        const [check] = await db.query(
            'SELECT id FROM vehicules WHERE id = ? AND client_id = ?',
            [vehiculeId, req.session.userId]
        );
        
        if (check.length === 0) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        await db.query(
            `UPDATE vehicules 
             SET immatriculation = ?, 
                 marque = ?, 
                 modele = ?, 
                 annee = ?, 
                 type_carburant = ?,
                 kilometrage_actuel = ?
             WHERE id = ? AND client_id = ?`,
            [
                immatriculation.toUpperCase(), 
                marque, 
                modele, 
                annee || null, 
                type_carburant || null,
                kilometrage_actuel || 0,
                vehiculeId, 
                req.session.userId
            ]
        );
        
        res.json({ message: 'Véhicule modifié avec succès' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Cette immatriculation existe déjà' });
        } else {
            console.error('Erreur updateVehicule:', err);
            res.status(500).json({ error: err.message });
        }
    }
};

/**
 * Supprimer un véhicule
 */
const deleteVehicule = async (req, res) => {
    // Vérification de l'authentification
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const vehiculeId = req.params.id;

    try {
        // Vérifier que le véhicule appartient bien au client
        const [check] = await db.query(
            'SELECT id FROM vehicules WHERE id = ? AND client_id = ?',
            [vehiculeId, req.session.userId]
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
                error: 'Impossible de supprimer : ce véhicule a des interventions associées' 
            });
        }

        // Supprimer le véhicule
        await db.query(
            'DELETE FROM vehicules WHERE id = ? AND client_id = ?',
            [vehiculeId, req.session.userId]
        );
        
        res.json({ message: 'Véhicule supprimé avec succès' });
    } catch (err) {
        console.error('Erreur deleteVehicule:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Récupérer un véhicule par son ID
 */
const getVehiculeById = async (req, res) => {
    // Vérification de l'authentification
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const vehiculeId = req.params.id;

    try {
        const [rows] = await db.query(
            'SELECT * FROM vehicules WHERE id = ? AND client_id = ?',
            [vehiculeId, req.session.userId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Erreur getVehiculeById:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Mettre à jour le kilométrage d'un véhicule
 */
const updateKilometrage = async (req, res) => {
    // Vérification de l'authentification
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const vehiculeId = req.params.id;
    const { kilometrage } = req.body;

    if (!kilometrage) {
        return res.status(400).json({ error: 'Kilométrage requis' });
    }

    try {
        await db.query(
            'UPDATE vehicules SET kilometrage_actuel = ? WHERE id = ? AND client_id = ?',
            [kilometrage, vehiculeId, req.session.userId]
        );
        
        res.json({ message: 'Kilométrage mis à jour' });
    } catch (err) {
        console.error('Erreur updateKilometrage:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { 
    getVehicules, 
    addVehicule, 
    updateVehicule, 
    deleteVehicule,
    getVehiculeById,
    updateKilometrage
};