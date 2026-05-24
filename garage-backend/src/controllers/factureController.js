const db = require('../models/db');
const { generateFacturePDF } = require('../utils/pdfGenerator');

// Calculer le total des pièces pour une intervention
const calculerTotalPieces = async (intervention_id) => {
    const [rows] = await db.query(`
        SELECT SUM(p.prix_unitaire * ip.quantite_utilisee) as total
        FROM intervention_pieces ip
        JOIN pieces p ON ip.piece_id = p.id
        WHERE ip.intervention_id = ?
    `, [intervention_id]);
    
    return rows[0].total || 0;
};

// Lister les factures
const getFactures = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT f.*, 
                   i.id as intervention_id, 
                   i.prix_intervention,
                   v.immatriculation, v.marque, v.modele,
                   u.nom, u.prenom
            FROM factures f 
            JOIN interventions i ON f.intervention_id = i.id 
            JOIN vehicules v ON i.vehicule_id = v.id 
            JOIN utilisateurs u ON v.client_id = u.id
            ORDER BY f.date_emission DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Erreur getFactures:', err);
        res.status(500).json({ error: err.message });
    }
};

// Obtenir le détail d'une facture
const getFactureById = async (req, res) => {
    const factureId = req.params.id;

    try {
        const [facture] = await db.query(`
            SELECT f.*, 
                   i.id as intervention_id, 
                   i.description,
                   i.prix_intervention,
                   v.immatriculation, v.marque, v.modele,
                   u.nom, u.prenom, u.email, u.adresse
            FROM factures f 
            JOIN interventions i ON f.intervention_id = i.id 
            JOIN vehicules v ON i.vehicule_id = v.id 
            JOIN utilisateurs u ON v.client_id = u.id 
            WHERE f.id = ?
        `, [factureId]);
        
        if (facture.length === 0) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }
        
        // Récupérer les pièces utilisées
        const [pieces] = await db.query(`
            SELECT p.nom, p.reference, p.prix_unitaire, ip.quantite_utilisee,
                   (p.prix_unitaire * ip.quantite_utilisee) as total
            FROM intervention_pieces ip
            JOIN pieces p ON ip.piece_id = p.id
            WHERE ip.intervention_id = ?
        `, [facture[0].intervention_id]);
        
        const totalPieces = pieces.reduce((sum, p) => sum + p.total, 0);
        
        res.json({ 
            facture: facture[0], 
            pieces: pieces,
            prix_intervention: facture[0].prix_intervention,
            total_pieces: totalPieces,
            montant_total: facture[0].montant_total
        });
    } catch (err) {
        console.error('Erreur getFactureById:', err);
        res.status(500).json({ error: err.message });
    }
};

// Créer une facture (admin)
const createFacture = async (req, res) => {
    const { intervention_id } = req.body;

    if (!intervention_id) {
        return res.status(400).json({ error: 'Intervention requise' });
    }

    try {
        // Vérifier que l'intervention existe
        const [intervention] = await db.query(
            'SELECT statut, prix_intervention FROM interventions WHERE id = ?',
            [intervention_id]
        );

        if (intervention.length === 0) {
            return res.status(404).json({ error: 'Intervention non trouvée' });
        }

        // Vérifier que l'intervention est terminée
        if (intervention[0].statut !== 'terminée') {
            return res.status(400).json({ error: 'La facture ne peut être créée que pour une intervention terminée' });
        }

        // Vérifier si une facture existe déjà
        const [existing] = await db.query(
            'SELECT id FROM factures WHERE intervention_id = ?',
            [intervention_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Une facture existe déjà pour cette intervention' });
        }

        // Calculer le total des pièces utilisées
        const totalPieces = await calculerTotalPieces(intervention_id);
        const prixIntervention = parseFloat(intervention[0].prix_intervention) || 0;
        const montantTotal = prixIntervention + totalPieces;

        const [result] = await db.query(
            `INSERT INTO factures 
            (intervention_id, date_emission, montant_total, statut_paiement) 
            VALUES (?, CURDATE(), ?, "impayé")`,
            [intervention_id, montantTotal]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Facture créée avec succès',
            details: {
                prix_intervention: prixIntervention,
                total_pieces: totalPieces,
                montant_total: montantTotal
            }
        });
    } catch (err) {
        console.error('Erreur createFacture:', err);
        res.status(500).json({ error: err.message });
    }
};

// Marquer une facture comme payée
const payerFacture = async (req, res) => {
    const factureId = req.params.id;

    try {
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
            SELECT f.*, 
                   i.description, 
                   i.prix_intervention,
                   v.immatriculation, 
                   u.nom, 
                   u.prenom, 
                   u.adresse,
                   u.email
            FROM factures f 
            JOIN interventions i ON f.intervention_id = i.id 
            JOIN vehicules v ON i.vehicule_id = v.id 
            JOIN utilisateurs u ON v.client_id = u.id 
            WHERE f.id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }
        
        // Récupérer les pièces utilisées
        const [pieces] = await db.query(`
            SELECT p.nom, p.reference, p.prix_unitaire, ip.quantite_utilisee
            FROM intervention_pieces ip
            JOIN pieces p ON ip.piece_id = p.id
            WHERE ip.intervention_id = ?
        `, [rows[0].intervention_id]);
        
        const pdfPath = await generateFacturePDF(rows[0], pieces);
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
    payerFacture,
    downloadFacturePDF, 
    deleteFacture
};