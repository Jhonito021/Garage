const db = require('../models/db');

const createVidange = async (req, res) => {
    const { vehicule_id, intervention_id, kilometrage, type_huile } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO vidanges (vehicule_id, intervention_id, date_vidange, kilometrage, type_huile) VALUES (?, ?, CURDATE(), ?, ?)',
            [vehicule_id, intervention_id, kilometrage, type_huile]
        );
        
        await db.query('UPDATE vehicules SET kilometrage_actuel = ? WHERE id = ?', [kilometrage, vehicule_id]);
        
        res.status(201).json({ id: result.insertId, message: 'Vidange enregistrée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getVidangesByVehicule = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM vidanges WHERE vehicule_id = ? ORDER BY date_vidange DESC', [req.params.vehiculeId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const checkVidangeDue = async (req, res) => {
    try {
        const [config] = await db.query("SELECT valeur FROM configurations WHERE cle = 'intervalle_vidange_defaut'");
        const intervalle = config[0] ? parseInt(config[0].valeur) : 8000;
        
        const [vehicule] = await db.query('SELECT kilometrage_actuel FROM vehicules WHERE id = ?', [req.params.vehiculeId]);
        const [derniere] = await db.query('SELECT kilometrage FROM vidanges WHERE vehicule_id = ? ORDER BY date_vidange DESC LIMIT 1', [req.params.vehiculeId]);
        
        if (derniere.length === 0) {
            return res.json({ due: false, message: 'Aucune vidange enregistrée' });
        }
        
        const kmParcourus = vehicule[0].kilometrage_actuel - derniere[0].kilometrage;
        const due = kmParcourus >= intervalle;
        const kmRestant = due ? 0 : intervalle - kmParcourus;
        
        res.json({ due, kmParcourus, kmRestant, intervalle });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createVidange, getVidangesByVehicule, checkVidangeDue };