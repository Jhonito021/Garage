const db = require('../models/db');

// Vue planning (admin/technicien)
const getPlanning = async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'technicien') {
        return res.status(403).json({ error: 'Accès réservé' });
    }

    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: 'Date requise' });
    }

    try {
        let query = `
            SELECT i.*, v.immatriculation, v.marque, v.modele, u.nom, u.prenom, u.telephone
            FROM interventions i
            JOIN vehicules v ON i.vehicule_id = v.id
            JOIN utilisateurs u ON v.client_id = u.id
            WHERE DATE(i.date_debut) = ?
        `;
        
        if (req.user.role === 'technicien') {
            query += ' AND i.technicien_id = ?';
        }
        
        query += ' ORDER BY i.date_debut';
        
        const params = [date];
        if (req.user.role === 'technicien') {
            params.push(req.user.id);
        }
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Créneaux disponibles pour une date
const getCreneauxDisponibles = async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: 'Date requise' });
    }

    try {
        const [config] = await db.query("SELECT valeur FROM configurations WHERE cle = 'heure_ouverture'");
        const [configFerm] = await db.query("SELECT valeur FROM configurations WHERE cle = 'heure_fermeture'");
        
        const heureOuverture = config[0]?.valeur || '08:00';
        const heureFermeture = configFerm[0]?.valeur || '18:00';
        
        const [pris] = await db.query(
            "SELECT date_heure FROM rdv WHERE DATE(date_heure) = ? AND statut != 'annulé'",
            [date]
        );
        
        const creneauxPris = pris.map(r => {
            const d = new Date(r.date_heure);
            return d.toTimeString().slice(0,5);
        });
        
        // Générer créneaux disponibles (tranches de 30 min)
        const creneaux = [];
        let heure = new Date(`2000-01-01 ${heureOuverture}`);
        const fin = new Date(`2000-01-01 ${heureFermeture}`);
        
        while (heure < fin) {
            const heureStr = heure.toTimeString().slice(0,5);
            if (!creneauxPris.includes(heureStr)) {
                creneaux.push(heureStr);
            }
            heure.setMinutes(heure.getMinutes() + 30);
        }
        
        res.json(creneaux);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Bloquer un créneau (admin)
const bloquerCreneau = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé' });
    }

    const { date_heure, raison } = req.body;

    if (!date_heure) {
        return res.status(400).json({ error: 'Date et heure requises' });
    }

    try {
        // Vérifier si déjà pris
        const [existing] = await db.query(
            'SELECT id FROM rdv WHERE date_heure = ? AND statut != "annulé"',
            [date_heure]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Créneau déjà occupé par un rendez-vous' });
        }
        
        // Créer un créneau bloqué
        await db.query(
            "INSERT INTO rdv (client_id, vehicule_id, date_heure, service_demande, statut) VALUES (NULL, NULL, ?, 'CRENEAU BLOQUÉ', 'confirmé')",
            [date_heure]
        );
        
        res.json({ message: 'Créneau bloqué' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getPlanning, getCreneauxDisponibles, bloquerCreneau };