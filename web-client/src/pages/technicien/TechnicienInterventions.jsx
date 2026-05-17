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
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const handleEnd = async (id) => {
        try {
            const res = await api.put(`/interventions/${id}/fin`);
            setInterventions(interventions.map(i => 
                i.id === id ? { ...i, statut: 'terminée', date_fin: new Date().toISOString(), duree_totale: res.data.duree } : i
            ));
        } catch (err) {
            console.error('Erreur:', err);
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

                <div className="mt-30">
                    {interventions.length === 0 ? (
                        <div className="card text-center">
                            <p>Aucune intervention</p>
                        </div>
                    ) : (
                        interventions.map(i => (
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
                                            {i.prenom} {i.nom}
                                        </p>
                                        <p>
                                            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                                            {i.date_debut ? new Date(i.date_debut).toLocaleString('fr-FR') : 'Non démarrée'}
                                            {i.date_fin && ` → ${new Date(i.date_fin).toLocaleString('fr-FR')}`}
                                        </p>
                                        {i.duree_totale && (
                                            <p className="text-light">Durée: {i.duree_totale} minutes</p>
                                        )}
                                        <p>
                                            Statut: 
                                            <span className={`badge ${i.statut === 'terminée' ? 'badge-success' : i.statut === 'en_cours' ? 'badge-warning' : 'badge-info'}`}>
                                                {i.statut}
                                            </span>
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
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default TechnicienInterventions;