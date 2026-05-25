const bcrypt = require('bcrypt');
const db = require('../models/db');

// Inscription
const register = async (req, res) => {
    const { email, mot_de_passe, nom, prenom, telephone, adresse } = req.body;

    if (!email || !mot_de_passe || !nom || !prenom) {
        return res.status(400).json({ error: 'Champs manquants' });
    }

    try {
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        const [result] = await db.query(
            'INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, telephone, adresse, role) VALUES (?, ?, ?, ?, ?, ?, "client")',
            [email, hashedPassword, nom, prenom, telephone, adresse]
        );
        
        res.status(201).json({ 
            message: 'Compte créé', 
            id: result.insertId,
            user: {
                id: result.insertId,
                email: email,
                nom: nom,
                prenom: prenom,
                role: 'client'
            }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Email déjà utilisé' });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
};

// Connexion
const login = async (req, res) => {
    const { email, mot_de_passe } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const user = rows[0];
        const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!valid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        // Stocker l'utilisateur dans la session
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userRole = user.role;

        res.json({
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
                telephone: user.telephone,
                adresse: user.adresse
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Déconnexion
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur déconnexion' });
        }
        res.json({ message: 'Déconnecté' });
    });
};

// Récupérer l'utilisateur connecté
const getMe = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    
    try {
        const [rows] = await db.query(
            'SELECT id, email, nom, prenom, telephone, adresse, role FROM utilisateurs WHERE id = ?',
            [req.session.userId]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login, logout, getMe };