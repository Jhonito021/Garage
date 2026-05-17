const db = require('../models/db');

const getVehicules = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    
    try {
        const [rows] = await db.query('SELECT * FROM vehicules WHERE client_id = ?', [req.session.userId]);
        res.json(rows);
    } catch (err) {
        console.error('Erreur getVehicules:', err);
        res.status(500).json({ error: err.message });
    }
};

const addVehicule = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    
    const { immatriculation, marque, modele, annee, type_carburant, kilometrage_actuel } = req.body;

    if (!immatriculation || !marque || !modele) {
        return res.status(400).json({ error: 'Immatriculation, marque et modèle sont requis' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO vehicules (client_id, immatriculation, marque, modele, annee, type_carburant, kilometrage_actuel) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.session.userId, immatriculation.toUpperCase(), marque, modele, annee || null, type_carburant || null, kilometrage_actuel || 0]
        );
        res.status(201).json({ id: result.insertId, message: 'Véhicule ajouté' });
    } catch (err) {
        console.error('Erreur addVehicule:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Cette immatriculation existe déjà' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

const updateVehicule = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    
    const { immatriculation, marque, modele, annee, type_carburant } = req.body;
    const vehiculeId = req.params.id;

    try {
        await db.query(
            'UPDATE vehicules SET immatriculation = ?, marque = ?, modele = ?, annee = ?, type_carburant = ? WHERE id = ? AND client_id = ?',
            [immatriculation.toUpperCase(), marque, modele, annee || null, type_carburant || null, vehiculeId, req.session.userId]
        );
        res.json({ message: 'Véhicule modifié' });
    } catch (err) {
        console.error('Erreur updateVehicule:', err);
        res.status(500).json({ error: err.message });
    }
};

const deleteVehicule = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    
    const vehiculeId = req.params.id;

    try {
        const [interventions] = await db.query('SELECT id FROM interventions WHERE vehicule_id = ?', [vehiculeId]);
        if (interventions.length > 0) {
            return res.status(400).json({ error: 'Impossible de supprimer : ce véhicule a des interventions' });
        }

        await db.query('DELETE FROM vehicules WHERE id = ? AND client_id = ?', [vehiculeId, req.session.userId]);
        res.json({ message: 'Véhicule supprimé' });
    } catch (err) {
        console.error('Erreur deleteVehicule:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getVehicules, addVehicule, updateVehicule, deleteVehicule };