const bcrypt = require('bcrypt');
const db = require('../models/db');

// Inscription
const register = async (req, res) => {
    const { email, mot_de_passe, nom, prenom, role } = req.body;

    // Validation des champs requis
    if (!email || !mot_de_passe || !nom || !prenom) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    try {
        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        
        // Requête d'insertion
        const query = 'INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, role) VALUES (?, ?, ?, ?, ?)';
        const params = [email, hashedPassword, nom, prenom, role || 'client'];
        
        const [result] = await db.query(query, params);
        
        console.log('[AUTH] Utilisateur créé avec succès - email:', email, 'role:', role || 'client');
        
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            userId: result.insertId,
            nom: nom,
            prenom: prenom,
            email: email,
            role: role || 'client'
        });
        
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Email déjà utilisé' });
        } else {
            console.error('[AUTH] Erreur:', err);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
};

// Connexion
const login = async (req, res) => {
    const { email, mot_de_passe, role } = req.body;

    try {
        let query = 'SELECT * FROM utilisateurs WHERE email = ?';
        let params = [email];
        
        // Si un rôle est spécifié, vérifier que l'utilisateur a ce rôle
        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        const [rows] = await db.query(query, params);
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
            success: true,
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