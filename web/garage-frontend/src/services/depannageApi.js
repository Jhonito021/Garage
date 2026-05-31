// frontend/src/services/depannageApi.js
import api from './api';

// ==================== CLIENT ====================

// Demander un dépannage
export const demanderDepannage = async (data) => {
    try {
        const response = await api.post('/depannage/demande', data);
        return response.data;
    } catch (error) {
        console.error('Erreur demanderDepannage:', error);
        throw error;
    }
};

// Suivre une demande
export const suivreDemande = async (demandeId) => {
    try {
        const response = await api.get(`/depannage/suivi/${demandeId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur suivreDemande:', error);
        throw error;
    }
};

// ==================== ADMIN ====================

// Récupérer toutes les demandes
export const getDemandesDepannage = async () => {
    try {
        const response = await api.get('/depannage/demandes');
        return response.data;
    } catch (error) {
        console.error('Erreur getDemandesDepannage:', error);
        throw error;
    }
};

// Récupérer les techniciens (pour assignation)
export const getTechniciens = async () => {
    try {
        const response = await api.get('/utilisateurs?role=technicien');
        return response.data;
    } catch (error) {
        console.error('Erreur getTechniciens:', error);
        throw error;
    }
};

// Accepter une demande (admin)
export const accepterDemande = async (demandeId) => {
    try {
        const response = await api.put(`/depannage/demande/${demandeId}/accepter`);
        return response.data;
    } catch (error) {
        console.error('Erreur accepterDemande:', error);
        throw error;
    }
};

// Refuser une demande (admin)
export const refuserDemande = async (demandeId) => {
    try {
        const response = await api.put(`/depannage/demande/${demandeId}/refuser`);
        return response.data;
    } catch (error) {
        console.error('Erreur refuserDemande:', error);
        throw error;
    }
};

// Assigner un technicien à une demande (admin)
export const assignerTechnicien = async (demandeId, technicienId) => {
    try {
        const response = await api.put(`/depannage/demande/${demandeId}/assigner`, {
            technicien_id: technicienId
        });
        return response.data;
    } catch (error) {
        console.error('Erreur assignerTechnicien:', error);
        throw error;
    }
};

// ==================== TECHNICIEN / DÉPANNEUR ====================

// Récupérer les missions du technicien/dépanneur
export const getTechnicienDemandes = async () => {
    try {
        const response = await api.get('/depannage/technicien/demandes');
        return response.data;
    } catch (error) {
        console.error('Erreur getTechnicienDemandes:', error);
        throw error;
    }
};

// Accepter une mission (technicien/dépanneur)
export const accepterMission = async (missionId) => {
    try {
        const response = await api.put(`/depannage/technicien/mission/${missionId}/accepter`);
        return response.data;
    } catch (error) {
        console.error('Erreur accepterMission:', error);
        throw error;
    }
};

// Terminer une mission (technicien/dépanneur)
export const terminerMission = async (missionId) => {
    try {
        const response = await api.put(`/depannage/technicien/mission/${missionId}/terminer`);
        return response.data;
    } catch (error) {
        console.error('Erreur terminerMission:', error);
        throw error;
    }
};

// Mettre à jour la position GPS
export const mettreAJourPosition = async (demandeId, lat, lng) => {
    try {
        const response = await api.post('/depannage/technicien/position', {
            demande_id: demandeId,
            lat: lat,
            lng: lng
        });
        return response.data;
    } catch (error) {
        console.error('Erreur mettreAJourPosition:', error);
        throw error;
    }
};