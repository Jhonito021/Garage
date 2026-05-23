import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faCar, faUser, faCalendarAlt, faPlay, faCheck, faSyncAlt, faCheckCircle, faClock, faHourglassHalf, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function TechnicienInterventions() {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInterventions = async () => {
        try {
            const res = await api.get('/interventions/technicien');
            console.log('Mes interventions:', res.data);
            setInterventions(res.data);
        } catch (err) {
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInterventions();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchInterventions();
    };

    // Vérifier si l'intervention peut être démarrée (date dans la tolérance ±1 jour)
    const canStart = (intervention) => {
        if (intervention.statut !== 'prévue') return false;
        
        // Récupérer la date prévue (du rendez-vous ou de l'intervention)
        const datePrevue = intervention.rdv_date ? new Date(intervention.rdv_date) : (intervention.date_debut ? new Date(intervention.date_debut) : null);
        
        if (!datePrevue) return true; // Si pas de date, on autorise
        
        const dateActuelle = new Date();
        
        // Calculer la différence en jours
        const diffTime = Math.abs(dateActuelle - datePrevue);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Tolérance de 1 jour
        return diffDays <= 1;
    };

    // Obtenir le message d'alerte si l'intervention ne peut pas être démarrée
    const getStartWarning = (intervention) => {
        if (intervention.statut !== 'prévue') return null;
        
        const datePrevue = intervention.rdv_date ? new Date(intervention.rdv_date) : (intervention.date_debut ? new Date(intervention.date_debut) : null);
        
        if (!datePrevue) return null;
        
        const dateActuelle = new Date();
        const diffTime = Math.abs(dateActuelle - datePrevue);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
            if (dateActuelle < datePrevue) {
                return `Intervention prévue pour le ${datePrevue.toLocaleDateString('fr-FR')} (dans ${diffDays} jours)`;
            } else {
                return `Intervention en retard de ${diffDays} jours (prévue le ${datePrevue.toLocaleDateString('fr-FR')})`;
            }
        }
        
        return null;
    };

    const handleStart = async (id) => {
        try {
            const response = await api.put(`/interventions/${id}/debut`);
            
            if (response.data.message) {
                alert(response.data.message);
                // Mettre à jour l'état local
                setInterventions(interventions.map(i => 
                    i.id === id ? { ...i, statut: 'en_cours', date_debut: new Date().toISOString() } : i
                ));
            }
        } catch (err) {
            console.error('Erreur:', err);
            
            let errorMessage = 'Erreur lors du démarrage';
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            }
            
            // Afficher l'erreur avec plus de détails si disponibles
            if (err.response?.data?.datePrevue && err.response?.data?.dateActuelle) {
                errorMessage = `${errorMessage}\n\nDate prévue: ${err.response.data.datePrevue}\nDate actuelle: ${err.response.data.dateActuelle}`;
            }
            
            alert(errorMessage);
        }
    };

    const handleEnd = async (id) => {
        try {
            const res = await api.put(`/interventions/${id}/fin`);
            setInterventions(interventions.map(i => 
                i.id === id ? { ...i, statut: 'terminée', date_fin: new Date().toISOString(), duree_totale: res.data.duree } : i
            ));
            alert('Intervention terminée');
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors de la fin de l\'intervention');
        }
    };

    const getStatusBadge = (statut) => {
        switch(statut) {
            case 'terminée':
                return <span className="badge badge-success"><FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px' }} />Terminée</span>;
            case 'en_cours':
                return <span className="badge badge-warning"><FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />En cours</span>;
            case 'prévue':
                return <span className="badge badge-info"><FontAwesomeIcon icon={faHourglassHalf} style={{ marginRight: '5px' }} />Prévue</span>;
            default:
                return <span className="badge badge-info">{statut}</span>;
        }
    };

    if (loading) {
        return (
            <div className="admin-container">
                <Sidebar />
                <div className="admin-content">
                    <div className="loading">Chargement de vos interventions...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <Sidebar />
            <div className="admin-content">
                <div className="flex-between">
                    <h1>
                        <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                        Mes interventions
                    </h1>
                    <button onClick={handleRefresh} disabled={refreshing}>
                        <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: '5px' }} />
                        {refreshing ? 'Actualisation...' : 'Actualiser'}
                    </button>
                </div>

                {interventions.length === 0 ? (
                    <div className="card text-center mt-30">
                        <FontAwesomeIcon icon={faWrench} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
                        <p>Aucune intervention pour le moment</p>
                    </div>
                ) : (
                    <div className="mt-30">
                        {interventions.map(i => (
                            <div key={i.id} className="card mb-20">
                                <div className="flex-between" style={{ flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3>
                                            <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                                            Intervention #{i.id}
                                        </h3>
                                        <p>
                                            <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                                            {i.marque} {i.modele} - {i.immatriculation}
                                        </p>
                                        <p>
                                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                                            Client: {i.prenom} {i.nom}
                                        </p>
                                        <p>
                                            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                                            Date prévue: {i.rdv_date ? new Date(i.rdv_date).toLocaleString('fr-FR') : 'Non planifiée'}
                                        </p>
                                        {i.date_debut && (
                                            <p>
                                                <FontAwesomeIcon icon={faClock} style={{ marginRight: '8px' }} />
                                                Début: {new Date(i.date_debut).toLocaleString('fr-FR')}
                                            </p>
                                        )}
                                        {i.date_fin && (
                                            <p>
                                                <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px' }} />
                                                Fin: {new Date(i.date_fin).toLocaleString('fr-FR')}
                                            </p>
                                        )}
                                        {i.duree_totale && (
                                            <p className="text-light">Durée: {i.duree_totale} minutes</p>
                                        )}
                                        <p style={{ marginTop: '10px' }}>
                                            Statut: {getStatusBadge(i.statut)}
                                        </p>
                                        
                                        {/* Afficher l'avertissement si la date n'est pas dans la tolérance */}
                                        {getStartWarning(i) && (
                                            <p className="text-danger mt-10" style={{ fontSize: '12px', padding: '8px', backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: '5px' }}>
                                                <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '8px' }} />
                                                {getStartWarning(i)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-10" style={{ marginTop: '10px' }}>
                                        {i.statut === 'prévue' && (
                                            <button 
                                                onClick={() => handleStart(i.id)}
                                                disabled={!canStart(i)}
                                                style={{ 
                                                    opacity: !canStart(i) ? 0.5 : 1,
                                                    cursor: !canStart(i) ? 'not-allowed' : 'pointer'
                                                }}
                                                title={!canStart(i) ? "Intervention non disponible à la date actuelle" : ""}
                                            >
                                                <FontAwesomeIcon icon={faPlay} style={{ marginRight: '5px' }} />
                                                Démarrer
                                            </button>
                                        )}
                                        {i.statut === 'en_cours' && (
                                            <button onClick={() => handleEnd(i.id)}>
                                                <FontAwesomeIcon icon={faCheck} style={{ marginRight: '5px' }} />
                                                Terminer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TechnicienInterventions;