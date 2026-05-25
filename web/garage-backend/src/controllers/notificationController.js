const db = require('../models/db');

const getNotifications = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM notifications WHERE client_id = ? ORDER BY date_envoi DESC LIMIT 50`,
            [1]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        await db.query('UPDATE notifications SET statut = "lu" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Notification marquée comme lue' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const verifierVidanges = async (req, res) => {
    try {
        const [config] = await db.query("SELECT valeur FROM configurations WHERE cle = 'intervalle_vidange_defaut'");
        const intervalle = config[0] ? parseInt(config[0].valeur) : 8000;
        
        const [vehicules] = await db.query(`
            SELECT v.id, v.client_id, v.kilometrage_actuel, v.immatriculation, 
                   (SELECT kilometrage FROM vidanges WHERE vehicule_id = v.id ORDER BY date_vidange DESC LIMIT 1) as dernier_km
            FROM vehicules v
        `);
        
        const notifs = [];
        for (const v of vehicules) {
            if (v.dernier_km && (v.kilometrage_actuel - v.dernier_km) >= intervalle) {
                notifs.push([v.client_id, v.id, `Vidange due pour ${v.immatriculation}`, 'vidange', new Date()]);
            }
        }
        
        if (notifs.length > 0) {
            await db.query('INSERT INTO notifications (client_id, vehicule_id, message, type, date_envoi) VALUES ?', [notifs]);
        }
        
        res.json({ message: `${notifs.length} notifications créées` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getNotifications, markAsRead, verifierVidanges };