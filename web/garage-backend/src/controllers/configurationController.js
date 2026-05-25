const db = require('../models/db');

// Récupérer toutes les configurations
const getAllConfigurations = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT cle, valeur FROM configurations');
        res.json(rows);
    } catch (err) {
        console.error('Erreur getAllConfigurations:', err);
        res.status(500).json({ error: err.message });
    }
};

// Récupérer une configuration par sa clé
const getConfigurationByCle = async (req, res) => {
    const { cle } = req.params;
    
    try {
        const [rows] = await db.query('SELECT valeur FROM configurations WHERE cle = ?', [cle]);
        res.json(rows[0] || { valeur: '' });
    } catch (err) {
        console.error('Erreur getConfigurationByCle:', err);
        res.status(500).json({ error: err.message });
    }
};

// Mettre à jour une configuration
const updateConfiguration = async (req, res) => {
    const { cle, valeur } = req.body;
    
    if (!cle) {
        return res.status(400).json({ error: 'Clé requise' });
    }
    
    try {
        await db.query(
            'INSERT INTO configurations (cle, valeur) VALUES (?, ?) ON DUPLICATE KEY UPDATE valeur = ?',
            [cle, valeur, valeur]
        );
        res.json({ message: 'Configuration mise à jour avec succès' });
    } catch (err) {
        console.error('Erreur updateConfiguration:', err);
        res.status(500).json({ error: err.message });
    }
};

// Créer une nouvelle configuration
const createConfiguration = async (req, res) => {
    const { cle, valeur, description } = req.body;
    
    if (!cle || !valeur) {
        return res.status(400).json({ error: 'Clé et valeur requises' });
    }
    
    try {
        const [result] = await db.query(
            'INSERT INTO configurations (cle, valeur, description) VALUES (?, ?, ?)',
            [cle, valeur, description || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Configuration créée avec succès' });
    } catch (err) {
        console.error('Erreur createConfiguration:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Cette configuration existe déjà' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

// Supprimer une configuration
const deleteConfiguration = async (req, res) => {
    const { cle } = req.params;
    
    try {
        await db.query('DELETE FROM configurations WHERE cle = ?', [cle]);
        res.json({ message: 'Configuration supprimée avec succès' });
    } catch (err) {
        console.error('Erreur deleteConfiguration:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllConfigurations,
    getConfigurationByCle,
    updateConfiguration,
    createConfiguration,
    deleteConfiguration
};  