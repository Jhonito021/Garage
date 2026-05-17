import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faCar, faUser, faCalendarAlt, faSearch, faCheck, faPlay } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Interventions() {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

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

    const filteredInterventions = interventions.filter(i =>
        i.immatriculation?.toLowerCase().includes(filter.toLowerCase()) ||
        i.marque?.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
                    <div className="loading">Chargement...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
                <div className="flex-between">
                    <h1>
                        <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                        Interventions
                    </h1>
                    <div style={{ width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Rechercher par véhicule..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                </div>

                <div className="mt-30">
                    {filteredInterventions.length === 0 ? (
                        <div className="card text-center">
                            <p>Aucune intervention trouvée</p>
                        </div>
                    ) : (
                        filteredInterventions.map(i => (
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

export default Interventions;