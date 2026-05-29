import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faCalendarAlt, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function TechnicienDashboard() {
    const [stats, setStats] = useState({
        interventions_aujourdhui: 0,
        interventions_terminees: 0,
        interventions_en_cours: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/interventions/technicien');
                const interventions = res.data;
                const aujourdhui = new Date().toISOString().split('T')[0];
                
                setStats({
                    interventions_aujourdhui: interventions.filter(i => i.date_debut?.split('T')[0] === aujourdhui).length,
                    interventions_terminees: interventions.filter(i => i.statut === 'terminée').length,
                    interventions_en_cours: interventions.filter(i => i.statut === 'en_cours').length
                });
            } catch (err) {
                console.error('Erreur:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

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
                <h1>Tableau de bord technicien</h1>
                
                <div className="grid-3" style={{ marginTop: '30px' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                        </div>
                        <div className="stat-card-value">{stats.interventions_aujourdhui}</div>
                        <div className="stat-card-label">Interventions aujourd'hui</div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-card-icon">
                            <FontAwesomeIcon icon={faClock} />
                        </div>
                        <div className="stat-card-value">{stats.interventions_en_cours}</div>
                        <div className="stat-card-label">En cours</div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-card-icon">
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                        <div className="stat-card-value">{stats.interventions_terminees}</div>
                        <div className="stat-card-label">Terminées</div>
                    </div>
                </div>

                <div className="admin-card" style={{ marginTop: '30px' }}>
                    <div className="admin-card-header">
                        <div className="admin-card-title">Actions rapides</div>
                    </div>
                    <div className="flex gap-20">
                        <Link to="/technicien/interventions">
                            <button>
                                <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                                Voir mes interventions
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TechnicienDashboard;