const db = require('../models/db');

// Lister les notifications du client
const getNotifications = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT n.*, v.immatriculation 
             FROM notifications n 
             LEFT JOIN vehicules v ON n.vehicule_id = v.id 
             WHERE n.client_id = ? 
             ORDER BY n.date_envoi DESC 
             LIMIT 50`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Marquer une notification comme lue
const markAsRead = async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET statut = "lu" WHERE id = ? AND client_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Notification marquée comme lue' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Tâche automatique : vérifier les vidanges (à exécuter par cron)
const verifierVidanges = async (req, res) => {
    const secret = req.headers['x-cron-secret'];
    if (secret !== process.env.CRON_SECRET) {
        return res.status(403).json({ error: 'Non autorisé' });
    }
    
    try {
        const [config] = await db.query("SELECT valeur FROM configurations WHERE cle = 'intervalle_vidange_defaut'");
        const [seuilRelance] = await db.query("SELECT valeur FROM configurations WHERE cle = 'seuil_relance_vidange'");
        
        const intervalle = config[0] ? parseInt(config[0].valeur) : 8000;
        const seuil = seuilRelance[0] ? parseInt(seuilRelance[0].valeur) : 2000;
        
        const [vehicules] = await db.query(`
            SELECT v.id, v.client_id, v.kilometrage_actuel, v.immatriculation, 
                   (SELECT kilometrage FROM vidanges WHERE vehicule_id = v.id ORDER BY date_vidange DESC LIMIT 1) as dernier_km
            FROM vehicules v
        `);
        
        const notifs = [];
        for (const v of vehicules) {
            if (v.dernier_km) {
                const kmParcourus = v.kilometrage_actuel - v.dernier_km;
                if (kmParcourus >= intervalle - seuil && kmParcourus < intervalle) {
                    const kmRestant = intervalle - kmParcourus;
                    notifs.push([
                        v.client_id, 
                        v.id, 
                        `Vidange bientôt due pour ${v.immatriculation} (encore ${kmRestant} km)`, 
                        'vidange'
                    ]);
                } else if (kmParcourus >= intervalle) {
                    notifs.push([
                        v.client_id, 
                        v.id, 
                        `Vidange due pour ${v.immatriculation} (dépassé de ${kmParcourus - intervalle} km)`, 
                        'vidange'
                    ]);
                }
            }
        }
        
        if (notifs.length > 0) {
            const values = notifs.map(n => [n[0], n[1], n[2], n[3], new Date()]);
            await db.query('INSERT INTO notifications (client_id, vehicule_id, message, type, date_envoi) VALUES ?', [values]);
        }
        
        res.json({ message: `${notifs.length} notifications créées` });
    } catch (err) {
        console.error('Erreur vérification vidanges:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getNotifications, markAsRead, verifierVidanges };