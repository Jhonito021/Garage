// frontend/src/services/depannageApi.js
import api from './api';
import { getCurrentPosition } from './geolocation';

export const demanderDepannage = async () => {
    try {
        const position = await getCurrentPosition();
        
        const response = await api.post('/depannage/demande', {
            lat: position.lat,
            lng: position.lng,
            adresse: null
        });
        
        return {
            success: true,
            demandeId: response.data.id,
            position: position,
            client: response.data.client
        };
    } catch (error) {
        console.error('Erreur demande dépannage:', error);
        throw error;
    }
};

export const suivreDemande = async (demandeId) => {
    try {
        const response = await api.get(`/depannage/suivi/${demandeId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur suivi:', error);
        throw error;
    }
};

export const getDemandesDepannage = async () => {
    try {
        const response = await api.get('/depannage/demandes');
        return response.data;
    } catch (error) {
        console.error('Erreur chargement demandes:', error);
        throw error;
    }
};

export const accepterDemande = async (demandeId, technicienId = null) => {
    try {
        const response = await api.put(`/depannage/demande/${demandeId}/accepter`, {
            technicien_id: technicienId
        });
        return response.data;
    } catch (error) {
        console.error('Erreur acceptation:', error);
        throw error;
    }
};

export const refuserDemande = async (demandeId) => {
    try {
        const response = await api.put(`/depannage/demande/${demandeId}/refuser`);
        return response.data;
    } catch (error) {
        console.error('Erreur refus:', error);
        throw error;
    }
};

// AJOUTER CES FONCTIONS À frontend/src/services/depannageApi.js

/**
 * Technicien - Récupérer les demandes disponibles
 */
export const getTechnicienDemandes = async () => {
    try {
        const response = await api.get('/depannage/technicien/demandes');
        return response.data;
    } catch (error) {
        console.error('Erreur getTechnicienDemandes:', error);
        throw error;
    }
};

/**
 * Technicien - Accepter une mission
 */
export const accepterMission = async (demandeId) => {
    try {
        const response = await api.put(`/depannage/technicien/mission/${demandeId}/accepter`);
        return response.data;
    } catch (error) {
        console.error('Erreur accepterMission:', error);
        throw error;
    }
};

/**
 * Technicien - Terminer une mission
 */
export const terminerMission = async (demandeId) => {
    try {
        const response = await api.put(`/depannage/technicien/mission/${demandeId}/terminer`);
        return response.data;
    } catch (error) {
        console.error('Erreur terminerMission:', error);
        throw error;
    }
};

/**
 * Technicien - Mettre à jour la position GPS
 */
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