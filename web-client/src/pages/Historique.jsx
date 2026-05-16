import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faCar, faTachometerAlt, faOilCan, faSearch, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

function Historique() {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchHistorique = async () => {
            try {
                const vehiculesRes = await api.get('/vehicules');
                const vehicules = vehiculesRes.data;
                
                let allInterventions = [];
                for (const v of vehicules) {
                    try {
                        const res = await api.get(`/vidange/vehicule/${v.id}`);
                        allInterventions = [...allInterventions, ...res.data.map(i => ({ ...i, vehicule: v }))];
                    } catch (e) {}
                }
                
                allInterventions.sort((a, b) => new Date(b.date_vidange) - new Date(a.date_vidange));
                setInterventions(allInterventions);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistorique();
    }, []);

    const filteredInterventions = interventions.filter(i =>
        i.vehicule?.immatriculation?.toLowerCase().includes(filter.toLowerCase()) ||
        i.vehicule?.marque?.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>
                <FontAwesomeIcon icon={faHistory} style={{ marginRight: '10px' }} />
                Historique des vidanges
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
                        <div style={{ fontSize: '3rem', marginBottom: '15px', color: 'var(--text-light)' }}>
                            <FontAwesomeIcon icon={faHistory} />
                        </div>
                        <p>Aucune vidange trouvée</p>
                    </div>
                ) : (
                    filteredInterventions.map(i => (
                        <div key={i.id} className="card mb-20">
                            <div className="flex-between">
                                <div>
                                    <h3>
                                        Vidange du {new Date(i.date_vidange).toLocaleDateString('fr-FR')}
                                    </h3>
                                    <p>
                                        <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                                        {i.vehicule?.marque} {i.vehicule?.modele} - {i.vehicule?.immatriculation}
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '8px' }} />
                                        Kilométrage: {i.kilometrage?.toLocaleString()} km
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faOilCan} style={{ marginRight: '8px' }} />
                                        Type d'huile: {i.type_huile}
                                    </p>
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