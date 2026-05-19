const express = require('express');
const db = require('../models/db');
const bcrypt = require('bcrypt');
const router = express.Router();

// Lister tous les utilisateurs ou filtrer par rôle
router.get('/', async (req, res) => {
    const { role } = req.query;
    
    try {
        let query = 'SELECT id, email, nom, prenom, telephone, role, specialite, actif, date_inscription FROM utilisateurs';
        let params = [];
        
        if (role) {
            query += ' WHERE role = ?';
            params = [role];
        }
        
        query += ' ORDER BY date_inscription DESC';
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Erreur get utilisateurs:', err);
        res.status(500).json({ error: err.message });
    }
});

// Obtenir un utilisateur par son ID
router.get('/:id', async (req, res) => {
    const userId = req.params.id;
    
    try {
        const [rows] = await db.query(
            'SELECT id, email, nom, prenom, telephone, role, specialite, actif, date_inscription FROM utilisateurs WHERE id = ?',
            [userId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Erreur get utilisateur:', err);
        res.status(500).json({ error: err.message });
    }
});

// Ajouter un utilisateur (admin uniquement)
router.post('/', async (req, res) => {
    const { email, mot_de_passe, nom, prenom, telephone, specialite, role, actif } = req.body;

    if (!email || !mot_de_passe || !nom || !prenom) {
        return res.status(400).json({ error: 'Email, mot de passe, nom et prénom sont requis' });
    }

    try {
        // Vérifier si l'email existe déjà
        const [existing] = await db.query('SELECT id FROM utilisateurs WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        const [result] = await db.query(
            `INSERT INTO utilisateurs 
            (email, mot_de_passe, nom, prenom, telephone, specialite, role, actif) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [email, hashedPassword, nom, prenom, telephone || null, specialite || null, role || 'technicien', actif !== undefined ? actif : 1]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Utilisateur créé avec succès' });
    } catch (err) {
        console.error('Erreur création utilisateur:', err);
        res.status(500).json({ error: err.message });
    }
});

// Modifier un utilisateur
router.put('/:id', async (req, res) => {
    const { nom, prenom, telephone, specialite, actif } = req.body;
    const userId = req.params.id;

    try {
        await db.query(
            `UPDATE utilisateurs 
             SET nom = ?, prenom = ?, telephone = ?, specialite = ?, actif = ? 
             WHERE id = ?`,
            [nom, prenom, telephone || null, specialite || null, actif, userId]
        );
        res.json({ message: 'Utilisateur modifié avec succès' });
    } catch (err) {
        console.error('Erreur modification utilisateur:', err);
        res.status(500).json({ error: err.message });
    }
});

// Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Vérifier si l'utilisateur a des interventions
        const [interventions] = await db.query('SELECT id FROM interventions WHERE technicien_id = ?', [userId]);
        if (interventions.length > 0) {
            return res.status(400).json({ error: 'Impossible de supprimer : ce technicien a des interventions' });
        }

        await db.query('DELETE FROM utilisateurs WHERE id = ?', [userId]);
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (err) {
        console.error('Erreur suppression utilisateur:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;