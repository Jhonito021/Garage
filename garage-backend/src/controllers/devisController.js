const db = require('../models/db');
const { generateDevisPDF } = require('../utils/pdfGenerator');

// Lister les devis du client
const getDevis = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT d.*, i.id as intervention_id, v.immatriculation, v.marque, v.modele
             FROM devis d 
             JOIN interventions i ON d.intervention_id = i.id 
             JOIN vehicules v ON i.vehicule_id = v.id 
             JOIN utilisateurs u ON v.client_id = u.id 
             WHERE u.id = ? 
             ORDER BY d.date_emission DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Créer un devis (admin)
const createDevis = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé' });
    }

    const { intervention_id, montant } = req.body;

    if (!intervention_id || !montant) {
        return res.status(400).json({ error: 'Intervention et montant requis' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO devis (intervention_id, date_emission, montant, statut) 
             VALUES (?, CURDATE(), ?, "envoyé")`,
            [intervention_id, montant]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Devis créé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Accepter un devis (client)
const acceptDevis = async (req, res) => {
    try {
        const [check] = await db.query(
            `SELECT d.id FROM devis d 
             JOIN interventions i ON d.intervention_id = i.id 
             JOIN vehicules v ON i.vehicule_id = v.id 
             WHERE d.id = ? AND v.client_id = ?`,
            [req.params.id, req.user.id]
        );
        
        if (check.length === 0) {
            return res.status(404).json({ error: 'Devis non trouvé' });
        }
        
        await db.query('UPDATE devis SET statut = "accepté" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Devis accepté' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Refuser un devis (client)
const refuseDevis = async (req, res) => {
    try {
        const [check] = await db.query(
            `SELECT d.id FROM devis d 
             JOIN interventions i ON d.intervention_id = i.id 
             JOIN vehicules v ON i.vehicule_id = v.id 
             WHERE d.id = ? AND v.client_id = ?`,
            [req.params.id, req.user.id]
        );
        
        if (check.length === 0) {
            return res.status(404).json({ error: 'Devis non trouvé' });
        }
        
        await db.query('UPDATE devis SET statut = "refusé" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Devis refusé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Télécharger le PDF d'un devis
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