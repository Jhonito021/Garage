// frontend/src/pages/depanneur/DepanneurDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faClock, faCheckCircle, faMapMarkerAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import DepanneurSidebar from '../../components/DepanneurSidebar';
import { getTechnicienDemandes } from '../../services/depannageApi';

function DepanneurDashboard() {
    const [stats, setStats] = useState({
        en_attente: 0,
        en_cours: 0,
        terminees: 0,
        total: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentMissions, setRecentMissions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Vérifier d'abord si l'utilisateur est connecté
                const depanneur = localStorage.getItem('depanneur');
                    if (!depanneur) {
                    console.log('Aucun dépanneur connecté');
                    return;
                }
        
                const demandes = await getTechnicienDemandes();
                    setStats({
                        en_attente: demandes.filter(d => d.statut === 'en_attente').length,
                        en_cours: demandes.filter(d => d.statut === 'acceptee').length,
                        terminees: demandes.filter(d => d.statut === 'terminee').length,
                        total: demandes.length
                    });
                    setRecentMissions(demandes.slice(0, 5));
            } catch (err) {
                console.error('Erreur:', err);
                if (err.response?.status === 401) {
                    // Non authentifié, rediriger vers login
                    localStorage.removeItem('depanneur');
                    window.location.href = '/depanneur/login';
                    }
                } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                <h1 style={{ marginBottom: '30px' }}>
                    <FontAwesomeIcon icon={faTruck} style={{ marginRight: '10px', color: '#4caf50' }} />
                    Tableau de bord dépanneur
                </h1>

                {/* Statistiques */}
                <div className="grid-4" style={{ marginBottom: '30px' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ color: '#ff9800' }}>
                            <FontAwesomeIcon icon={faClock} />
                        </div>
                        <div className="stat-card-value" style={{ color: '#ff9800' }}>{stats.en_attente}</div>
                        <div className="stat-card-label">Missions en attente</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ color: '#4caf50' }}>
                            <FontAwesomeIcon icon={faTruck} />
                        </div>
                        <div className="stat-card-value" style={{ color: '#4caf50' }}>{stats.en_cours}</div>
                        <div className="stat-card-label">Missions en cours</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ color: '#2196f3' }}>
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                        <div className="stat-card-value" style={{ color: '#2196f3' }}>{stats.terminees}</div>
                        <div className="stat-card-label">Missions terminées</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ color: '#e94560' }}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                        </div>
                        <div className="stat-card-value" style={{ color: '#e94560' }}>{stats.total}</div>
                        <div className="stat-card-label">Total missions</div>
                    </div>
                </div>

                {/* Actions rapides */}
                <div className="card" style={{ marginBottom: '30px' }}>
                    <h2>Actions rapides</h2>
                    <div className="grid-2" style={{ marginTop: '20px' }}>
                        <Link to="/depanneur/missions">
                            <button style={{ width: '100%', backgroundColor: '#4caf50' }}>
                                <FontAwesomeIcon icon={faTruck} style={{ marginRight: '10px' }} />
                                Voir les missions disponibles
                            </button>
                        </Link>
                        <Link to="/depanneur/suivi">
                            <button style={{ width: '100%', backgroundColor: '#2196f3' }}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '10px' }} />
                                Activer le suivi GPS
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Dernières missions */}
                <div className="card">
                    <h2>Dernières missions</h2>
                    {recentMissions.length === 0 ? (
                        <p className="text-center">Aucune mission pour le moment</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                            {recentMissions.map(mission => (
                                <div key={mission.id} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '10px',
                                    borderBottom: '1px solid var(--border-color)'
                                }}>
                                    <div>
                                        <strong>{mission.client_prenom} {mission.client_nom}</strong>
                                        <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                            {new Date(mission.date_demande).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`badge ${mission.statut === 'en_attente' ? 'badge-warning' : mission.statut === 'acceptee' ? 'badge-success' : 'badge-info'}`}>
                                        {mission.statut === 'en_attente' ? 'En attente' : mission.statut === 'acceptee' ? 'En cours' : 'Terminée'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link to="/depanneur/missions">
                        <button className="btn-outline w-100 mt-20">Voir toutes les missions</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default DepanneurDashboard;