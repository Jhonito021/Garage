const db = require('../models/db');

// Tableau de bord admin
const getDashboard = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé' });
    }

    try {
        // Chiffre d'affaires du mois
        const [ca] = await db.query(`
            SELECT SUM(montant_total) as total 
            FROM factures 
            WHERE statut_paiement = 'payé' 
            AND MONTH(date_emission) = MONTH(CURDATE()) 
            AND YEAR(date_emission) = YEAR(CURDATE())
        `);
        
        // Interventions par technicien (mois)
        const [interventionsTech] = await db.query(`
            SELECT u.id, u.nom, u.prenom, COUNT(i.id) as nb_interventions
            FROM interventions i
            JOIN utilisateurs u ON i.technicien_id = u.id
            WHERE MONTH(i.date_debut) = MONTH(CURDATE())
            AND YEAR(i.date_debut) = YEAR(CURDATE())
            GROUP BY i.technicien_id
        `);
        
        // Nombre de clients
        const [clients] = await db.query('SELECT COUNT(*) as total FROM utilisateurs WHERE role = "client"');
        
        // Nombre d'interventions ce mois
        const [interventions] = await db.query(`
            SELECT COUNT(*) as total FROM interventions 
            WHERE MONTH(date_debut) = MONTH(CURDATE())
            AND YEAR(date_debut) = YEAR(CURDATE())
        `);
        
        // Nombre de rendez-vous ce mois
        const [rdvs] = await db.query(`
            SELECT COUNT(*) as total FROM rdv 
            WHERE MONTH(date_heure) = MONTH(CURDATE())
            AND YEAR(date_heure) = YEAR(CURDATE())
        `);
        
        res.json({
            ca_mois: ca[0].total || 0,
            interventions_par_technicien: interventionsTech,
            total_clients: clients[0].total,
            total_interventions_mois: interventions[0].total,
            total_rdv_mois: rdvs[0].total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Statistiques des vidanges par mois
const getVidangesStats = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé' });
    }

    try {
        const [rows] = await db.query(`
            SELECT DATE_FORMAT(date_vidange, '%Y-%m') as mois, 
                   COUNT(*) as total,
                   SUM(CASE WHEN type_huile = 'synthétique' THEN 1 ELSE 0 END) as synthetique,
                   SUM(CASE WHEN type_huile = 'semi_synthétique' THEN 1 ELSE 0 END) as semi_synthetique,
                   SUM(CASE WHEN type_huile = 'minérale' THEN 1 ELSE 0 END) as minerale
            FROM vidanges
            GROUP BY mois
            ORDER BY mois DESC
            LIMIT 12
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Clients à échéance de vidange
const getClientsEcheanceVidange = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé' });
    }

    try {
        const [config] = await db.query("SELECT valeur FROM configurations WHERE cle = 'intervalle_vidange_defaut'");
        const intervalle = config[0] ? parseInt(config[0].valeur) : 8000;
        
        const [rows] = await db.query(`
            SELECT u.id, u.nom, u.prenom, u.email, u.telephone,
                   v.id as vehicule_id, v.immatriculation, v.marque, v.modele, v.kilometrage_actuel,
                   vid.kilometrage as dernier_km, 
                   (v.kilometrage_actuel - vid.kilometrage) as km_parcourus
            FROM vehicules v
            JOIN utilisateurs u ON v.client_id = u.id
            JOIN (
                SELECT vehicule_id, MAX(kilometrage) as kilometrage
                FROM vidanges
                GROUP BY vehicule_id
            ) vid ON v.id = vid.vehicule_id
            WHERE (v.kilometrage_actuel - vid.kilometrage) >= (? - 2000)
            ORDER BY km_parcourus DESC
        `, [intervalle]);
        
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getDashboard, getVidangesStats, getClientsEcheanceVidange };