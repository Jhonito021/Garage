import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faCar, faWrench, faCalendarAlt, faSearch, faCheckCircle, faClock, faHourglassHalf, faUser } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function Historique() {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchHistorique = async () => {
            try {
                const res = await api.get('/vidange/client/interventions');
                console.log('Interventions reçues:', res.data);
                setInterventions(res.data);
            } catch (err) {
                console.error('Erreur:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistorique();
    }, []);

    const getStatusBadge = (statut) => {
        switch(statut) {
            case 'terminée':
                return <span className="badge badge-success"><FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px' }} />Terminée</span>;
            case 'en_cours':
                return <span className="badge badge-warning"><FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />En cours</span>;
            case 'prévue':
                return <span className="badge badge-info"><FontAwesomeIcon icon={faHourglassHalf} style={{ marginRight: '5px' }} />En attente</span>;
            default:
                return <span className="badge badge-info">{statut || 'Terminée'}</span>;
        }
    };

    const filteredInterventions = interventions.filter(i =>
        i.immatriculation?.toLowerCase().includes(filter.toLowerCase()) ||
        i.marque?.toLowerCase().includes(filter.toLowerCase()) ||
        i.modele?.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) {
        return (
            <div className="container text-center">
                <div className="loading">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>
                <FontAwesomeIcon icon={faHistory} style={{ marginRight: '10px' }} />
                Historique des interventions
            </h1>

            <div className="card mt-20">
                <div className="flex" style={{ alignItems: 'center', gap: '10px' }}>
                    <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--text-light)' }} />
                    <input 
                        type="text" 
                        placeholder="Rechercher par véhicule ou immatriculation..." 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ marginBottom: 0 }}
                    />
                </div>
            </div>

            <div className="mt-30">
                {filteredInterventions.length === 0 ? (
                    <div className="card text-center">
                        <FontAwesomeIcon icon={faHistory} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
                        <p>Aucune intervention trouvée</p>
                    </div>
                ) : (
                    filteredInterventions.map(i => (
                        <div key={i.id} className="card mb-20">
                            <div className="flex-between">
                                <div>
                                    <h3>
                                        <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                                        Intervention du {new Date(i.date_intervention || i.date_debut).toLocaleDateString('fr-FR')}
                                    </h3>
                                    <p>
                                        <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                                        {i.marque} {i.modele} - {i.immatriculation}
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                                        Date: {new Date(i.date_debut).toLocaleDateString('fr-FR')}
                                        {i.date_fin && ` → ${new Date(i.date_fin).toLocaleDateString('fr-FR')}`}
                                    </p>
                                    {i.description && (
                                        <p>
                                            <FontAwesomeIcon icon={faWrench} style={{ marginRight: '8px' }} />
                                            Description: {i.description}
                                        </p>
                                    )}
                                    {i.technicien_nom && (
                                        <p>
                                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                                            Technicien: {i.technicien_prenom} {i.technicien_nom}
                                        </p>
                                    )}
                                    {i.duree_totale && (
                                        <p className="text-light">Durée: {i.duree_totale} minutes</p>
                                    )}
                                    <div style={{ marginTop: '10px' }}>
                                        Statut: {getStatusBadge(i.statut)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Historique;