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
                console.log('Stats reçues:', res.data);
                
                // Convertir les valeurs en nombres
                const caMois = parseFloat(res.data.ca_mois) || 0;
                const totalClients = parseInt(res.data.total_clients) || 0;
                const totalInterventions = parseInt(res.data.total_interventions_mois) || 0;
                const totalRdv = parseInt(res.data.total_rdv_mois) || 0;
                
                setStats({
                    ca_mois: caMois,
                    total_clients: totalClients,
                    total_interventions_mois: totalInterventions,
                    total_rdv_mois: totalRdv,
                    interventions_par_technicien: res.data.interventions_par_technicien || []
                });
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
                <h1>Tableau de bord</h1>
                
                <div className="grid-4" style={{ marginTop: '30px' }}>
                    <div className="card text-center">
                        <div style={{ fontSize: '2rem', color: 'var(--secondary-color)' }}>
                            <FontAwesomeIcon icon={faEuroSign} />
                        </div>
                        <h3>CA du mois</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.ca_mois.toFixed(2)} €</p>
                    </div>
                    
                    <div className="card text-center">
                        <div style={{ fontSize: '2rem', color: 'var(--secondary-color)' }}>
                            <FontAwesomeIcon icon={faWrench} />
                        </div>
                        <h3>Interventions</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total_interventions_mois}</p>
                        <p className="text-light">ce mois</p>
                    </div>
                    
                    <div className="card text-center">
                        <div style={{ fontSize: '2rem', color: 'var(--secondary-color)' }}>
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <h3>Clients</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total_clients}</p>
                    </div>
                    
                    <div className="card text-center">
                        <div style={{ fontSize: '2rem', color: 'var(--secondary-color)' }}>
                            <FontAwesomeIcon icon={faCalendarAlt} />
                        </div>
                        <h3>Rendez-vous</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total_rdv_mois}</p>
                        <p className="text-light">ce mois</p>
                    </div>
                </div>

                {stats.interventions_par_technicien.length > 0 && (
                    <div className="card mt-30">
                        <h2>Interventions par technicien</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Technicien</th>
                                    <th>Nombre d'interventions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.interventions_par_technicien.map((tech, index) => (
                                    <tr key={index}>
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