const bcrypt = require('bcrypt');
const db = require('../models/db');

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
        
        // Créer la session après inscription
        req.session.userId = result.insertId;
        req.session.userEmail = email;
        req.session.userRole = 'client';
        
        req.session.save((err) => {
            if (err) {
                console.error('Erreur sauvegarde session:', err);
            }
        });
        
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
        console.error('Erreur register:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Email déjà utilisé' });
        } else {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
};

const login = async (req, res) => {
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
        const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        
        if (!valid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        // Créer la session
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userRole = user.role;
        
        req.session.save((err) => {
            if (err) {
                console.error('Erreur sauvegarde session:', err);
            }
        });

        console.log('Session créée - userId:', req.session.userId);
        console.log('Session ID:', req.sessionID);

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
        console.error('Erreur login:', err);
        res.status(500).json({ error: 'Erreur serveur: ' + err.message });
    }
};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur destruction session:', err);
            return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Déconnecté' });
    });
};

const getMe = async (req, res) => {
    console.log('getMe - Session userId:', req.session.userId);
    
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    
    try {
        const [rows] = await db.query(
            'SELECT id, email, nom, prenom, telephone, adresse, role FROM utilisateurs WHERE id = ?', 
            [req.session.userId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Erreur getMe:', err);
        res.status(500).json({ error: err.message });
    }
};

// Mettre à jour le profil
const updateProfil = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { nom, prenom, telephone, adresse } = req.body;

    try {
        await db.query(
            'UPDATE utilisateurs SET nom = ?, prenom = ?, telephone = ?, adresse = ? WHERE id = ?',
            [nom, prenom, telephone, adresse, req.session.userId]
        );
        res.json({ message: 'Profil mis à jour avec succès' });
    } catch (err) {
        console.error('Erreur updateProfil:', err);
        res.status(500).json({ error: err.message });
    }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

    try {
        const [rows] = await db.query('SELECT mot_de_passe FROM utilisateurs WHERE id = ?', [req.session.userId]);
        const valid = await bcrypt.compare(ancien_mot_de_passe, rows[0].mot_de_passe);
        
        if (!valid) {
            return res.status(400).json({ error: 'Ancien mot de passe incorrect' });
        }

        const hashedPassword = await bcrypt.hash(nouveau_mot_de_passe, 10);
        await db.query('UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?', [hashedPassword, req.session.userId]);
        
        res.json({ message: 'Mot de passe modifié avec succès' });
    } catch (err) {
        console.error('Erreur changePassword:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login, logout, getMe };