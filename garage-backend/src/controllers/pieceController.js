const db = require('../models/db');

// Lister toutes les pièces
const getPieces = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM pieces ORDER BY nom');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Ajouter une pièce (admin)
const addPiece = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé' });
    }

    const { nom, reference, quantite_stock, seuil_alerte, prix_unitaire } = req.body;

    if (!nom || !reference || !prix_unitaire) {
        return res.status(400).json({ error: 'Nom, référence et prix unitaire requis' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO pieces (nom, reference, quantite_stock, seuil_alerte, prix_unitaire) 
             VALUES (?, ?, ?, ?, ?)`,
            [nom, reference, quantite_stock || 0, seuil_alerte || 5, prix_unitaire]
        );
        res.status(201).json({ id: result.insertId, message: 'Pièce ajoutée' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Cette référence existe déjà' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

// Modifier une pièce
const updatePiece = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé' });
    }

    const { nom, reference, quantite_stock, seuil_alerte, prix_unitaire } = req.body;

    try {
        await db.query(
            `UPDATE pieces SET nom = ?, reference = ?, quantite_stock = ?, seuil_alerte = ?, prix_unitaire = ? 
             WHERE id = ?`,
            [nom, reference, quantite_stock, seuil_alerte, prix_unitaire, req.params.id]
        );
        res.json({ message: 'Pièce modifiée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Supprimer une pièce
const deletePiece = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé' });
    }

    try {
        await db.query('DELETE FROM pieces WHERE id = ?', [req.params.id]);
        res.json({ message: 'Pièce supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Voir les alertes de stock bas
const getStockAlertes = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM pieces WHERE quantite_stock <= seuil_alerte');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Utiliser une pièce dans une intervention (technicien)
const usePiece = async (req, res) => {
    if (req.user.role !== 'technicien' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé' });
    }

    const { intervention_id, piece_id, quantite_utilisee } = req.body;

    try {
        const [piece] = await db.query('SELECT quantite_stock FROM pieces WHERE id = ?', [piece_id]);
        if (piece[0].quantite_stock < quantite_utilisee) {
            return res.status(400).json({ error: 'Stock insuffisant' });
        }
        
        await db.query(
            'INSERT INTO intervention_pieces (intervention_id, piece_id, quantite_utilisee) VALUES (?, ?, ?)',
            [intervention_id, piece_id, quantite_utilisee]
        );
        
        await db.query('UPDATE pieces SET quantite_stock = quantite_stock - ? WHERE id = ?', [quantite_utilisee, piece_id]);
        
        res.json({ message: 'Pièce utilisée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getPieces, addPiece, updatePiece, deletePiece, getStockAlertes, usePiece };