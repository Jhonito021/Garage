const db = require('../models/db');
const { generateFacturePDF } = require('../utils/pdfGenerator');

// Lister toutes les factures
const getFactures = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                f.id,
                f.intervention_id,
                f.date_emission,
                f.montant_total,
                f.statut_paiement,
                f.pdf_url,
                i.description,
                v.immatriculation,
                v.marque,
                v.modele,
                u.nom,
                u.prenom,
                u.email,
                u.adresse
            FROM factures f 
            LEFT JOIN interventions i ON f.intervention_id = i.id 
            LEFT JOIN vehicules v ON i.vehicule_id = v.id 
            LEFT JOIN utilisateurs u ON v.client_id = u.id
            ORDER BY f.date_emission DESC
        `);
        
        console.log('Factures trouvées:', rows.length);
        res.json(rows);
    } catch (err) {
        console.error('Erreur getFactures:', err);
        res.status(500).json({ error: err.message });
    }
};

// Obtenir une facture par son ID
const getFactureById = async (req, res) => {
    const factureId = req.params.id;

    try {
        const [rows] = await db.query(`
            SELECT 
                f.id,
                f.intervention_id,
                f.date_emission,
                f.montant_total,
                f.statut_paiement,
                f.pdf_url,
                i.description,
                v.immatriculation,
                v.marque,
                v.modele,
                u.nom,
                u.prenom,
                u.email,
                u.adresse
            FROM factures f 
            LEFT JOIN interventions i ON f.intervention_id = i.id 
            LEFT JOIN vehicules v ON i.vehicule_id = v.id 
            LEFT JOIN utilisateurs u ON v.client_id = u.id
            WHERE f.id = ?
        `, [factureId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Erreur getFactureById:', err);
        res.status(500).json({ error: err.message });
    }
};

// Créer une facture (admin)
const createFacture = async (req, res) => {
    const { intervention_id, montant_total } = req.body;

    if (!intervention_id || !montant_total) {
        return res.status(400).json({ error: 'Intervention et montant requis' });
    }

    try {
        // Vérifier que l'intervention existe
        const [intervention] = await db.query(
            'SELECT id FROM interventions WHERE id = ?',
            [intervention_id]
        );

        if (intervention.length === 0) {
            return res.status(404).json({ error: 'Intervention non trouvée' });
        }

        // Vérifier si une facture existe déjà pour cette intervention
        const [existing] = await db.query(
            'SELECT id FROM factures WHERE intervention_id = ?',
            [intervention_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Une facture existe déjà pour cette intervention' });
        }

        const [result] = await db.query(
            `INSERT INTO factures (intervention_id, date_emission, montant_total, statut_paiement) 
             VALUES (?, CURDATE(), ?, "impayé")`,
            [intervention_id, montant_total]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Facture créée avec succès' 
        });
    } catch (err) {
        console.error('Erreur createFacture:', err);
        res.status(500).json({ error: err.message });
    }
};

// Mettre à jour une facture (admin)
const updateFacture = async (req, res) => {
    const factureId = req.params.id;
    const { montant_total, statut_paiement } = req.body;

    try {
        const [facture] = await db.query(
            'SELECT id FROM factures WHERE id = ?',
            [factureId]
        );

        if (facture.length === 0) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }

        await db.query(
            'UPDATE factures SET montant_total = ?, statut_paiement = ? WHERE id = ?',
            [montant_total, statut_paiement, factureId]
        );
        
        res.json({ message: 'Facture mise à jour avec succès' });
    } catch (err) {
        console.error('Erreur updateFacture:', err);
        res.status(500).json({ error: err.message });
    }
};

// Marquer une facture comme payée (paiement local)
const payerFacture = async (req, res) => {
    const factureId = req.params.id;

    try {
        // Vérifier que la facture existe
        const [facture] = await db.query(
            'SELECT id, statut_paiement FROM factures WHERE id = ?',
            [factureId]
        );

        if (facture.length === 0) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }

        if (facture[0].statut_paiement === 'payé') {
            return res.status(400).json({ error: 'Cette facture est déjà payée' });
        }

        // Marquer comme payée
        await db.query(
            'UPDATE factures SET statut_paiement = "payé" WHERE id = ?',
            [factureId]
        );

        res.json({ message: 'Facture payée avec succès' });
    } catch (err) {
        console.error('Erreur payerFacture:', err);
        res.status(500).json({ error: err.message });
    }
};

// Télécharger le PDF d'une facture
const downloadFacturePDF = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                f.*, 
                i.description, 
                v.immatriculation, 
                u.nom, 
                u.prenom, 
                u.adresse 
            FROM factures f 
            JOIN interventions i ON f.intervention_id = i.id 
            JOIN vehicules v ON i.vehicule_id = v.id 
            JOIN utilisateurs u ON v.client_id = u.id 
            WHERE f.id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }
        
        const pdfPath = await generateFacturePDF(rows[0]);
        res.download(pdfPath);
    } catch (err) {
        console.error('Erreur downloadFacturePDF:', err);
        res.status(500).json({ error: err.message });
    }
};

// Supprimer une facture (admin)
const deleteFacture = async (req, res) => {
    const factureId = req.params.id;

    try {
        const [facture] = await db.query(
            'SELECT id FROM factures WHERE id = ?',
            [factureId]
        );

        if (facture.length === 0) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }

        await db.query('DELETE FROM factures WHERE id = ?', [factureId]);
        res.json({ message: 'Facture supprimée avec succès' });
    } catch (err) {
        console.error('Erreur deleteFacture:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { 
    getFactures, 
    getFactureById,
    createFacture, 
    updateFacture,
    payerFacture,
    downloadFacturePDF, 
    deleteFacture
};