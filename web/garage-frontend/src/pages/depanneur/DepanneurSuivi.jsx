// frontend/src/pages/depanneur/DepanneurSuivi.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faSpinner, faMapMarkerAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import DepanneurSidebar from '../../components/DepanneurSidebar';
import DepanneurMap from '../../components/DepanneurMap';
import { getTechnicienDemandes } from '../../services/depannageApi';

function DepanneurSuivi() {
    const [missions, setMissions] = useState([]);
    const [selectedMission, setSelectedMission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const data = await getTechnicienDemandes();
                const missionsEnCours = data.filter(d => d.statut === 'acceptee');
                setMissions(missionsEnCours);
                if (missionsEnCours.length > 0) {
                    setSelectedMission(missionsEnCours[0]);
                }
            } catch (err) {
                console.error('Erreur:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMissions();
    }, []);

    if (loading) {
        return (
            <div className="admin-container">
                <DepanneurSidebar />
                <div className="admin-content">
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#4caf50" />
                        <h3>Chargement...</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <DepanneurSidebar />
            <div className="admin-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <div>
                        <h1><FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '10px', color: '#4caf50' }} />Suivi GPS en temps réel</h1>
                        <p className="text-light">Suivez votre position et le trajet vers le client</p>
                    </div>
                    <Link to="/depanneur">
                        <button className="btn-outline"><FontAwesomeIcon icon={faArrowLeft} /> Retour</button>
                    </Link>
                </div>

                {missions.length === 0 ? (
                    <div className="card text-center" style={{ padding: '60px' }}>
                        <FontAwesomeIcon icon={faTruck} size="3x" style={{ color: 'var(--text-light)', marginBottom: '15px' }} />
                        <h3>Aucune mission en cours</h3>
                        <p className="text-light">Acceptez une mission pour commencer le suivi GPS</p>
                        <Link to="/depanneur/missions">
                            <button style={{ backgroundColor: '#4caf50', marginTop: '15px' }}>
                                Voir les missions disponibles
                            </button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="card" style={{ marginBottom: '20px' }}>
                            <h3>Sélectionner une mission</h3>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                {missions.map(mission => (
                                    <button
                                        key={mission.id}
                                        onClick={() => setSelectedMission(mission)}
                                        style={{
                                            backgroundColor: selectedMission?.id === mission.id ? '#4caf50' : 'transparent',
                                            border: '1px solid #4caf50',
                                            padding: '8px 15px'
                                        }}
                                    >
                                        {mission.client_prenom} {mission.client_nom}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {selectedMission && <DepanneurMap demande={selectedMission} onMissionUpdate={() => {}} />}
                    </>
                )}
            </div>
        </div>
    );
}

export default DepanneurSuivi;