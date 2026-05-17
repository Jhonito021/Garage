import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCar, faUser, faSearch } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Planning() {
    const [interventions, setInterventions] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlanning = async () => {
            try {
                const res = await api.get(`/planning?date=${selectedDate}`);
                setInterventions(res.data);
            } catch (err) {
                console.error('Erreur planning:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlanning();
    }, [selectedDate]);

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
                <div className="flex-between">
                    <h1>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
                        Planning atelier
                    </h1>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: 'auto' }}
                    />
                </div>

                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : interventions.length === 0 ? (
                    <div className="card text-center mt-30">
                        <p>Aucune intervention prévue ce jour</p>
                    </div>
                ) : (
                    <div className="mt-30">
                        {interventions.map(i => (
                            <div key={i.id} className="card mb-20">
                                <div className="flex-between">
                                    <div>
                                        <h3>
                                            {/* <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} /> */}
                                            {i.description || 'Intervention'}
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
                                            {i.date_debut && new Date(i.date_debut).toLocaleString('fr-FR')}
                                            {i.date_fin && ` → ${new Date(i.date_fin).toLocaleString('fr-FR')}`}
                                        </p>
                                        <p>
                                            Statut: 
                                            <span className={`badge ${i.statut === 'terminée' ? 'badge-success' : i.statut === 'en_cours' ? 'badge-warning' : 'badge-info'}`}>
                                                {i.statut}
                                            </span>
                                        </p>
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

export default Planning;