const db = require('../models/db');

// Lister les factures du client
const getFactures = async (req, res) => {
    const clientId = req.query.client_id || req.session?.userId;
    
    if (!clientId) {
        return res.status(400).json({ error: 'client_id requis' });
    }

    try {
        const [rows] = await db.query(`
            SELECT f.*, i.description, v.immatriculation, v.marque, v.modele
            FROM factures f
            JOIN interventions i ON f.intervention_id = i.id
            JOIN vehicules v ON i.vehicule_id = v.id
            WHERE v.client_id = ?
            ORDER BY f.date_emission DESC
        `, [clientId]);
        res.json(rows);
    } catch (err) {
        console.error('Erreur getFactures:', err);
        res.status(500).json({ error: err.message });
    }
};

// Marquer une facture comme payée
const payerFacture = async (req, res) => {
    const factureId = req.params.id;
    const clientId = req.body.client_id || req.query.client_id;

    if (!factureId) {
        return res.status(400).json({ error: 'facture_id requis' });
    }

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

// Obtenir le détail d'une facture
const getFactureById = async (req, res) => {
    const factureId = req.params.id;
    const clientId = req.query.client_id;

    if (!factureId) {
        return res.status(400).json({ error: 'facture_id requis' });
    }

    try {
        const [facture] = await db.query(`
            SELECT f.*, 
                   i.description, 
                   i.prix_intervention,
                   v.immatriculation, v.marque, v.modele,
                   u.nom, u.prenom, u.email, u.adresse
            FROM factures f 
            JOIN interventions i ON f.intervention_id = i.id 
            JOIN vehicules v ON i.vehicule_id = v.id 
            JOIN utilisateurs u ON v.client_id = u.id 
            WHERE f.id = ? AND v.client_id = ?
        `, [factureId, clientId]);
        
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
        const prixPrestation = parseFloat(facture[0].prix_intervention) || 0;
        const montantTotal = prixPrestation + totalPieces;
        
        res.json({ 
            ...facture[0], 
            pieces: pieces,
            prix_intervention: prixPrestation,
            total_pieces: totalPieces,
            montant_total: montantTotal
        });
    } catch (err) {
        console.error('Erreur getFactureById:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getFactures, getFactureById, payerFacture };