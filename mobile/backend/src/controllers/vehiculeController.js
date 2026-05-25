const db = require('../models/db');

// Version SANS vérification de session (pour test)
const getVehicules = async (req, res) => {
    // Récupérer client_id du paramètre ou de la session
    const clientId = req.query.client_id || req.session?.userId;
    
    if (!clientId) {
        return res.status(400).json({ error: 'client_id requis' });
    }

    try {
        const [rows] = await db.query(
            'SELECT * FROM vehicules WHERE client_id = ?',
            [clientId]
        );
        console.log('Véhicules trouvés pour client', clientId, ':', rows.length);
        res.json(rows);
    } catch (err) {
        console.error('Erreur getVehicules:', err);
        res.status(500).json({ error: err.message });
    }
};

const addVehicule = async (req, res) => {
    const { client_id, immatriculation, marque, modele, annee, type_carburant, kilometrage_actuel } = req.body;

    if (!client_id || !immatriculation || !marque || !modele) {
        return res.status(400).json({ error: 'client_id, immatriculation, marque et modèle sont requis' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO vehicules (client_id, immatriculation, marque, modele, annee, type_carburant, kilometrage_actuel) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [client_id, immatriculation.toUpperCase(), marque, modele, annee || null, type_carburant || null, kilometrage_actuel || 0]
        );
        res.status(201).json({ id: result.insertId, message: 'Véhicule ajouté' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Cette immatriculation existe déjà' });
        } else {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
};

const updateVehicule = async (req, res) => {
    const { immatriculation, marque, modele, annee, type_carburant, client_id } = req.body;
    const vehiculeId = req.params.id;

    try {
        await db.query(
            'UPDATE vehicules SET immatriculation = ?, marque = ?, modele = ?, annee = ?, type_carburant = ? WHERE id = ? AND client_id = ?',
            [immatriculation.toUpperCase(), marque, modele, annee || null, type_carburant || null, vehiculeId, client_id]
        );
        res.json({ message: 'Véhicule modifié' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const deleteVehicule = async (req, res) => {
    const { client_id } = req.body;
    const vehiculeId = req.params.id;

    try {
        await db.query('DELETE FROM vehicules WHERE id = ? AND client_id = ?', [vehiculeId, client_id]);
        res.json({ message: 'Véhicule supprimé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getVehicules, addVehicule, updateVehicule, deleteVehicule };