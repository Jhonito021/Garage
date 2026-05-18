import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCar, faUser, faFilter, faWrench, faClock, faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Planning() {
    const [rdvs, setRdvs] = useState([]);
    const [filteredRdvs, setFilteredRdvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterPeriod, setFilterPeriod] = useState('all'); // today, last7, last30, all
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Filtrer les rendez-vous par période
    const filterByPeriod = (data, period) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayStr = today.toISOString().split('T')[0];
        
        if (period === 'today') {
            return data.filter(r => r.date_heure?.split('T')[0] === todayStr);
        }
        
        if (period === 'last7') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);
            return data.filter(r => {
                const date = new Date(r.date_heure);
                return date >= sevenDaysAgo && date <= today;
            });
        }
        
        if (period === 'last30') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return data.filter(r => {
                const date = new Date(r.date_heure);
                return date >= thirtyDaysAgo && date <= today;
            });
        }
        
        if (period === 'all') {
            return data;
        }
        
        return data;
    };

    const fetchRdvs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/rdv');
            const sortedRdvs = res.data.sort((a, b) => new Date(b.date_heure) - new Date(a.date_heure));
            setRdvs(sortedRdvs);
            const filtered = filterByPeriod(sortedRdvs, filterPeriod);
            setFilteredRdvs(filtered);
        } catch (err) {
            console.error('Erreur chargement rendez-vous:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRdvs();
    }, []);

    useEffect(() => {
        const filtered = filterByPeriod(rdvs, filterPeriod);
        setFilteredRdvs(filtered);
    }, [filterPeriod, selectedDate, rdvs]);

    const handlePeriodChange = (period) => {
        setFilterPeriod(period);
    };

    const getPeriodLabel = () => {
        switch(filterPeriod) {
            case 'today': return "Aujourd'hui";
            case 'last7': return "7 derniers jours";
            case 'last30': return "30 derniers jours";
            case 'all': return "Tous les rendez-vous";
            default: return "Aujourd'hui";
        }
    };

    const getStatusBadge = (statut) => {
        switch(statut) {
            case 'terminé':
                return <span className="badge badge-success"><FontAwesomeIcon icon={faCheck} style={{ marginRight: '5px' }} />Terminé</span>;
            case 'confirmé':
                return <span className="badge badge-warning"><FontAwesomeIcon icon={faSpinner} style={{ marginRight: '5px' }} />Confirmé</span>;
            case 'annulé':
                return <span className="badge badge-danger"><FontAwesomeIcon icon={faTimes} style={{ marginRight: '5px' }} />Annulé</span>;
            default:
                return <span className="badge badge-info">{statut}</span>;
        }
    };

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
                <div className="flex-between">
                    <h1>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
                        Planning atelier - Rendez-vous
                    </h1>
                    <div className="flex gap-10">
                        <button 
                            onClick={() => handlePeriodChange('today')}
                            className={filterPeriod === 'today' ? 'btn-primary' : 'btn-outline'}
                            style={{ padding: '8px 15px' }}
                        >
                            <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                            Aujourd'hui
                        </button>
                        <button 
                            onClick={() => handlePeriodChange('last7')}
                            className={filterPeriod === 'last7' ? 'btn-primary' : 'btn-outline'}
                            style={{ padding: '8px 15px' }}
                        >
                            <FontAwesomeIcon icon={faFilter} style={{ marginRight: '5px' }} />
                            7 jours
                        </button>
                        <button 
                            onClick={() => handlePeriodChange('last30')}
                            className={filterPeriod === 'last30' ? 'btn-primary' : 'btn-outline'}
                            style={{ padding: '8px 15px' }}
                        >
                            <FontAwesomeIcon icon={faFilter} style={{ marginRight: '5px' }} />
                            30 jours
                        </button>
                        <button 
                            onClick={() => handlePeriodChange('all')}
                            className={filterPeriod === 'all' ? 'btn-primary' : 'btn-outline'}
                            style={{ padding: '8px 15px' }}
                        >
                            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px' }} />
                            Tous
                        </button>
                    </div>
                </div>

                {filterPeriod === 'today' && (
                    <div className="card mt-20">
                        <div className="flex-between">
                            <label style={{ marginBottom: 0 }}>Sélectionner une date :</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ width: 'auto', marginBottom: 0 }}
                            />
                        </div>
                    </div>
                )}

                <div className="card mt-20" style={{ backgroundColor: 'var(--accent-color)' }}>
                    <div className="flex-between">
                        <div>
                            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
                            <strong>Période : {getPeriodLabel()}</strong>
                        </div>
                        <div>
                            <strong>{filteredRdvs.length}</strong> rendez-vous
                        </div>
                    </div>
                </div>

                {filteredRdvs.length === 0 ? (
                    <div className="card text-center mt-30">
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
                        <p>Aucun rendez-vous trouvé pour cette période</p>
                    </div>
                ) : (
                    <div className="mt-30">
                        {filteredRdvs.map(r => (
                            <div key={r.id} className="card mb-20">
                                <div className="flex-between">
                                    <div>
                                        <h3>
                                            <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                                            {r.service_demande}
                                        </h3>
                                        <p>
                                            <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                                            {r.marque} {r.modele} - {r.immatriculation}
                                        </p>
                                        <p>
                                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                                            Client: {r.client_nom} {r.client_prenom}
                                        </p>
                                        <p>
                                            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                                            {new Date(r.date_heure).toLocaleString('fr-FR')}
                                        </p>
                                        <p>
                                            Statut: {getStatusBadge(r.statut)}
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