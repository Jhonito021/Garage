const db = require('../models/db');

const getClients = async (req, res) => {

    
    // if (!req.session || !req.session.userId) {
    //     return res.status(401).json({ error: 'Non authentifié' });
    // }

    try {
        const [rows] = await db.query(`
            SELECT id, email, nom, prenom, telephone, adresse, role, date_inscription, actif 
            FROM utilisateurs 
            WHERE role = 'client' 
            ORDER BY date_inscription DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Erreur getClients:', err);
        res.status(500).json({ error: err.message });
    }
};

const getClientById = async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const clientId = req.params.id;

    try {
        const [client] = await db.query(`
            SELECT id, email, nom, prenom, telephone, adresse, date_inscription 
            FROM utilisateurs 
            WHERE id = ? AND role = 'client'
        `, [clientId]);
        
        if (client.length === 0) {
            return res.status(404).json({ error: 'Client non trouvé' });
        }
        
        const [vehicules] = await db.query(`
            SELECT * FROM vehicules WHERE client_id = ?
        `, [clientId]);
        
        res.json({ client: client[0], vehicules });
    } catch (err) {
        console.error('Erreur getClientById:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getClients, getClientById };