import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faCar, faUser, faCalendarAlt, faPlay, faCheck } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function TechnicienInterventions() {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterventions = async () => {
            try {
                const res = await api.get('/interventions/technicien');
                console.log('Mes interventions:', res.data);
                setInterventions(res.data);
            } catch (err) {
                console.error('Erreur:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInterventions();
    }, []);

    const handleStart = async (id) => {
        try {
            await api.put(`/interventions/${id}/debut`);
            setInterventions(interventions.map(i => 
                i.id === id ? { ...i, statut: 'en_cours', date_debut: new Date().toISOString() } : i
            ));
            alert('Intervention démarrée');
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors du démarrage');
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
            alert('Erreur lors de la fin');
        }
    };

    const getStatusBadge = (statut) => {
        switch(statut) {
            case 'terminée':
                return <span className="badge badge-success">Terminée</span>;
            case 'en_cours':
                return <span className="badge badge-warning">En cours</span>;
            case 'prévue':
                return <span className="badge badge-info">Prévue</span>;
            default:
                return <span className="badge badge-info">{statut}</span>;
        }
    };

    if (loading) {
        return (
            <div className="admin-container">
                <Sidebar />
                <div className="admin-content">
                    <div className="loading">Chargement...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <Sidebar />
            <div className="admin-content">
                <h1>Mes interventions</h1>

                {interventions.length === 0 ? (
                    <div className="card text-center mt-30">
                        <p>Aucune intervention pour le moment</p>
                    </div>
                ) : (
                    <div className="mt-30">
                        {interventions.map(i => (
                            <div key={i.id} className="card mb-20">
                                <div className="flex-between">
                                    <div>
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
                                            {i.date_debut ? new Date(i.date_debut).toLocaleString('fr-FR') : 'Non démarrée'}
                                            {i.date_fin && ` → ${new Date(i.date_fin).toLocaleString('fr-FR')}`}
                                        </p>
                                        {i.duree_totale && (
                                            <p className="text-light">Durée: {i.duree_totale} minutes</p>
                                        )}
                                        <p style={{ marginTop: '10px' }}>
                                            Statut: {getStatusBadge(i.statut)}
                                        </p>
                                    </div>
                                    <div className="flex gap-10">
                                        {i.statut === 'prévue' && (
                                            <button onClick={() => handleStart(i.id)}>
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