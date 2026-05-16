const db = require('../models/db');
const { generateFacturePDF } = require('../utils/pdfGenerator');

// Lister les factures du client
const getFactures = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT f.*, i.id as intervention_id, v.immatriculation, v.marque, v.modele
             FROM factures f 
             JOIN interventions i ON f.intervention_id = i.id 
             JOIN vehicules v ON i.vehicule_id = v.id 
             JOIN utilisateurs u ON v.client_id = u.id 
             WHERE u.id = ? 
             ORDER BY f.date_emission DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Créer une facture (admin)
const createFacture = async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'caissier') {
        return res.status(403).json({ error: 'Accès réservé' });
    }

    const { intervention_id, montant_total } = req.body;

    if (!intervention_id || !montant_total) {
        return res.status(400).json({ error: 'Intervention et montant requis' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO factures (intervention_id, date_emission, montant_total, statut_paiement) 
             VALUES (?, CURDATE(), ?, "impayé")`,
            [intervention_id, montant_total]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Facture créée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Télécharger le PDF d'une facture
const downloadFacturePDF = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT f.*, i.description, v.immatriculation, u.nom, u.prenom, u.adresse 
             FROM factures f 
             JOIN interventions i ON f.intervention_id = i.id 
             JOIN vehicules v ON i.vehicule_id = v.id 
             JOIN utilisateurs u ON v.client_id = u.id 
             WHERE f.id = ?`,
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }
        
        const pdfPath = await generateFacturePDF(rows[0]);
        res.download(pdfPath);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Marquer une facture comme payée
const payerFacture = async (req, res) => {
    try {
        await db.query('UPDATE factures SET statut_paiement = "payé" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Facture payée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getFactures, createFacture, downloadFacturePDF, payerFacture };