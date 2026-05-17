const db = require('../models/db');
const { generateDevisPDF } = require('../utils/pdfGenerator');

const getDevis = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT d.*, i.id as intervention_id, v.immatriculation, v.marque, v.modele
             FROM devis d 
             JOIN interventions i ON d.intervention_id = i.id 
             JOIN vehicules v ON i.vehicule_id = v.id 
             ORDER BY d.date_emission DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createDevis = async (req, res) => {
    const { intervention_id, montant } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO devis (intervention_id, date_emission, montant, statut) VALUES (?, CURDATE(), ?, "envoyé")',
            [intervention_id, montant]
        );
        res.status(201).json({ id: result.insertId, message: 'Devis créé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const acceptDevis = async (req, res) => {
    try {
        await db.query('UPDATE devis SET statut = "accepté" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Devis accepté' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const refuseDevis = async (req, res) => {
    try {
        await db.query('UPDATE devis SET statut = "refusé" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Devis refusé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const downloadDevisPDF = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT d.*, i.description, v.immatriculation, u.nom, u.prenom 
             FROM devis d 
             JOIN interventions i ON d.intervention_id = i.id 
             JOIN vehicules v ON i.vehicule_id = v.id 
             JOIN utilisateurs u ON v.client_id = u.id 
             WHERE d.id = ?`,
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Devis non trouvé' });
        }
        
        const pdfPath = await generateDevisPDF(rows[0]);
        res.download(pdfPath);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getDevis, createDevis, acceptDevis, refuseDevis, downloadDevisPDF };