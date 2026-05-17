import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEuroSign, faWrench, faUsers, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function AdminDashboard() {
    const [stats, setStats] = useState({
        ca_mois: 0,
        total_clients: 0,
        total_interventions_mois: 0,
        total_rdv_mois: 0,
        interventions_par_technicien: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/statistiques/dashboard');
                setStats(res.data);
            } catch (err) {
                console.error('Erreur stats:', err);
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
                <h1>Tableau de bord</h1>
                
                <div className="grid-4">
                    <div className="stat-card">
                        <div className="stat-card-icon">
                            <FontAwesomeIcon icon={faEuroSign} />
                        </div>
                        <div className="stat-card-value">{stats.ca_mois.toFixed(2)} €</div>
                        <div className="stat-card-label">CA du mois</div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-card-icon">
                            <FontAwesomeIcon icon={faWrench} />
                        </div>
                        <div className="stat-card-value">{stats.total_interventions_mois}</div>
                        <div className="stat-card-label">Interventions ce mois</div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-card-icon">
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <div className="stat-card-value">{stats.total_clients}</div>
                        <div className="stat-card-label">Clients</div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-card-icon">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                        </div>
                        <div className="stat-card-value">{stats.total_rdv_mois}</div>
                        <div className="stat-card-label">Rendez-vous ce mois</div>
                    </div>
                </div>

                {stats.interventions_par_technicien.length > 0 && (
                    <div className="admin-card" style={{ marginTop: '30px' }}>
                        <div className="admin-card-header">
                            <div className="admin-card-title">Interventions par technicien</div>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Technicien</th>
                                    <th>Nombre d'interventions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.interventions_par_technicien.map(tech => (
                                    <tr key={tech.id}>
                                        <td>{tech.prenom} {tech.nom}</td>
                                        <td>{tech.nb_interventions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;