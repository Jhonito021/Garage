const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
    const { email, mot_de_passe, nom, prenom, telephone, adresse } = req.body;

    // Vérifier que tous les champs obligatoires sont présents
    if (!email || !mot_de_passe || !nom || !prenom) {
        return res.status(400).json({ 
            error: 'Champs manquants. email, mot_de_passe, nom et prenom sont requis.' 
        });
    }

    try {
        // Vérifier si l'email existe déjà
        const [existing] = await db.query('SELECT id FROM utilisateurs WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        
        // Insérer l'utilisateur
        const [result] = await db.query(
            `INSERT INTO utilisateurs 
            (email, mot_de_passe, nom, prenom, telephone, adresse, role) 
            VALUES (?, ?, ?, ?, ?, ?, 'client')`,
            [email, hashedPassword, nom, prenom, telephone || null, adresse || null]
        );
        
        res.status(201).json({ 
            message: 'Compte créé avec succès', 
            id: result.insertId 
        });
    } catch (err) {
        console.error('Erreur inscription:', err);
        res.status(500).json({ error: 'Erreur serveur: ' + err.message });
    }
});

// Connexion
router.post('/login', async (req, res) => {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const user = rows[0];
        
        // Vérifier le mot de passe
        const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        
        if (!valid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        // Générer le token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Erreur connexion:', err);
        res.status(500).json({ error: 'Erreur serveur: ' + err.message });
    }
});

module.exports = router;