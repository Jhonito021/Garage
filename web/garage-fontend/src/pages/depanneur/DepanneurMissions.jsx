// frontend/src/pages/depanneur/DepanneurMissions.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faSpinner, faMapMarkerAlt, faRefresh, faArrowLeft, faPhone, faClock, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import DepanneurSidebar from '../../components/DepanneurSidebar';
import DepanneurMap from '../../components/DepanneurMap';
import DepanneurDemandesList from '../../components/DepanneurDemandesList';
import { getTechnicienDemandes } from '../../services/depannageApi';

function DepanneurMissions() {
    const [demandes, setDemandes] = useState([]);
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchDemandes = useCallback(async () => {
        try {
            const data = await getTechnicienDemandes();
            setDemandes(data);
            setError('');
        } catch (err) {
            console.error('Erreur:', err);
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDemandes();
        let interval;
        if (autoRefresh) interval = setInterval(fetchDemandes, 10000);
        return () => { if (interval) clearInterval(interval); };
    }, [autoRefresh, fetchDemandes]);

    const filteredDemandes = demandes.filter(d => {
        if (filter === 'all') return true;
        if (filter === 'en_attente') return d.statut === 'en_attente';
        if (filter === 'acceptee') return d.statut === 'acceptee';
        if (filter === 'terminee') return d.statut === 'terminee';
        return true;
    });

    const stats = {
        en_attente: demandes.filter(d => d.statut === 'en_attente').length,
        acceptee: demandes.filter(d => d.statut === 'acceptee').length,
        terminee: demandes.filter(d => d.statut === 'terminee').length
    };

    if (loading) {
        return (
            <div className="admin-container">
                <DepanneurSidebar />
                <div className="admin-content">
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#4caf50" />
                        <h3>Chargement des missions...</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <DepanneurSidebar />
            <div className="admin-content">
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                            <h1><FontAwesomeIcon icon={faTruck} style={{ marginRight: '10px', color: '#4caf50' }} />Missions de dépannage</h1>
                            <p className="text-light">Gérez vos missions</p>
                        </div>
                        <Link to="/depanneur">
                            <button className="btn-outline"><FontAwesomeIcon icon={faArrowLeft} /> Retour</button>
                        </Link>
                    </div>
                    <div className="grid-3" style={{ marginTop: '20px' }}>
                        <div className="stat-card"><div className="stat-card-value" style={{ color: '#ff9800' }}>{stats.en_attente}</div><div className="stat-card-label">En attente</div></div>
                        <div className="stat-card"><div className="stat-card-value" style={{ color: '#4caf50' }}>{stats.acceptee}</div><div className="stat-card-label">En cours</div></div>
                        <div className="stat-card"><div className="stat-card-value" style={{ color: '#2196f3' }}>{stats.terminee}</div><div className="stat-card-label">Terminées</div></div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button onClick={() => setFilter('all')} className={filter === 'all' ? 'btn-primary' : 'btn-outline'}>Toutes ({demandes.length})</button>
                            <button onClick={() => setFilter('en_attente')} className={filter === 'en_attente' ? 'btn-primary' : 'btn-outline'}>En attente ({stats.en_attente})</button>
                            <button onClick={() => setFilter('acceptee')} className={filter === 'acceptee' ? 'btn-primary' : 'btn-outline'}>En cours ({stats.acceptee})</button>
                            <button onClick={() => setFilter('terminee')} className={filter === 'terminee' ? 'btn-primary' : 'btn-outline'}>Terminées ({stats.terminee})</button>
                        </div>
                        <button onClick={() => setAutoRefresh(!autoRefresh)} style={{ backgroundColor: autoRefresh ? '#4caf50' : 'transparent', border: '1px solid var(--border-color)' }}>
                            <FontAwesomeIcon icon={faRefresh} /> Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>

                {error && <div className="card" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', marginBottom: '20px' }}><p className="text-danger">{error}</p></div>}

                <div className="grid-2" style={{ gap: '30px' }}>
                    <DepanneurDemandesList demandes={filteredDemandes} selectedDemande={selectedDemande} onSelectDemande={setSelectedDemande} onRefresh={fetchDemandes} />
                    <div>
                        <h2><FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '10px', color: '#4caf50' }} />Suivi de mission</h2>
                        {selectedDemande ? <DepanneurMap demande={selectedDemande} onMissionUpdate={fetchDemandes} /> : <div className="card text-center" style={{ padding: '60px' }}><p>Sélectionnez une mission</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DepanneurMissions;