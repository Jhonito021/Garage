import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faCar, faCalendarAlt, faBell, faPlus, faEye, faUser, faWrench, faClock, faCheckCircle, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function Dashboard() {
    const [vehicules, setVehicules] = useState([]);
    const [rdv, setRdv] = useState([]);
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiculesRes, rdvRes, interventionsRes] = await Promise.all([
                    api.get('/vehicules'),
                    api.get('/rdv'),
                    api.get('/vidange/client/interventions')  // Nouvelle URL
                ]);
        
                setVehicules(vehiculesRes.data);
                setRdv(rdvRes.data);
                setInterventions(interventionsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
            setLoading(false);
        }
    };
        fetchData();
    }, []);

    const getStatusBadge = (statut) => {
        switch(statut) {
            case 'terminée':
                return <span className="badge badge-success"><FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px' }} />Terminée</span>;
            case 'en_cours':
                return <span className="badge badge-warning"><FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />En cours</span>;
            case 'prévue':
                return <span className="badge badge-info"><FontAwesomeIcon icon={faHourglassHalf} style={{ marginRight: '5px' }} />En attente</span>;
            default:
                return <span className="badge badge-info">{statut}</span>;
        }
    };

    if (loading) {
        return (
            <div className="container text-center">
                <div className="loading">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="flex-between">
                <h1>
                    <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '10px' }} />
                    Tableau de bord
                </h1>
                <p className="text-light">
                    <FontAwesomeIcon icon={faUser} style={{ marginRight: '5px' }} />
                    Bonjour {user.prenom} {user.nom}
                </p>
            </div>

            <div className="grid-2" style={{ marginTop: '30px' }}>
                {/* Mes véhicules */}
                <div className="card">
                    <h2>
                        <FontAwesomeIcon icon={faCar} style={{ marginRight: '10px' }} />
                        Mes véhicules
                    </h2>
                    {vehicules.length === 0 ? (
                        <p className="text-center">Aucun véhicule enregistré</p>
                    ) : (
                        vehicules.slice(0, 3).map(v => (
                            <div key={v.id} className="mb-10" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                <strong>{v.marque} {v.modele}</strong> - {v.immatriculation}
                                <br />
                                <span className="text-light">Kilométrage: {v.kilometrage_actuel?.toLocaleString()} km</span>
                            </div>
                        ))
                    )}
                    <Link to="/vehicles">
                        <button className="w-100 mt-20">
                            <FontAwesomeIcon icon={vehicules.length === 0 ? faPlus : faEye} style={{ marginRight: '5px' }} />
                            {vehicules.length === 0 ? 'Ajouter un véhicule' : 'Voir tous mes véhicules'}
                        </button>
                    </Link>
                </div>

                {/* Prochains rendez-vous */}
                <div className="card">
                    <h2>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
                        Prochains rendez-vous
                    </h2>
                    {rdv.length === 0 ? (
                        <p className="text-center">Aucun rendez-vous à venir</p>
                    ) : (
                        rdv.slice(0, 3).map(r => (
                            <div key={r.id} className="mb-10" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                <strong>{r.service_demande}</strong>
                                <br />
                                <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px' }} />
                                {new Date(r.date_heure).toLocaleString('fr-FR')}
                                <br />
                                <FontAwesomeIcon icon={faCar} style={{ marginRight: '5px' }} />
                                {r.marque} {r.modele}
                                <br />
                                <span className={`badge ${r.statut === 'confirmé' ? 'badge-success' : 'badge-warning'}`}>
                                    {r.statut}
                                </span>
                            </div>
                        ))
                    )}
                    <Link to="/rdv">
                        <button className="w-100 mt-20">
                            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '5px' }} />
                            Prendre rendez-vous
                        </button>
                    </Link>
                </div>

                {/* Suivi des interventions */}
                <div className="card">
                    <h2>
                        <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                        Suivi des interventions
                    </h2>
                    {interventions.length === 0 ? (
                        <p className="text-center">Aucune intervention en cours</p>
                    ) : (
                        interventions.slice(0, 3).map(i => (
                            <div key={i.id} className="mb-10" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                <strong>{i.type_huile || 'Intervention'}</strong>
                                <br />
                                <FontAwesomeIcon icon={faCar} style={{ marginRight: '5px' }} />
                                {i.vehicule?.marque} {i.vehicule?.modele} - {i.vehicule?.immatriculation}
                                <br />
                                <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px' }} />
                                {new Date(i.date_vidange).toLocaleDateString('fr-FR')}
                                <br />
                                <div style={{ marginTop: '8px' }}>
                                    Statut: {getStatusBadge(i.statut || 'terminée')}
                                </div>
                            </div>
                        ))
                    )}
                    <Link to="/historique">
                        <button className="w-100 mt-20">
                            <FontAwesomeIcon icon={faEye} style={{ marginRight: '5px' }} />
                            Voir tout l'historique
                        </button>
                    </Link>
                </div>

                {/* Rappel vidange */}
                <div className="card">
                    <h2>
                        <FontAwesomeIcon icon={faBell} style={{ marginRight: '10px' }} />
                        Rappel vidange
                    </h2>
                    {vehicules.length === 0 ? (
                        <div className="text-center">
                            <p>Ajoutez un véhicule pour voir les rappels</p>
                            <Link to="/vehicles">
                                <button className="mt-20">
                                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: '5px' }} />
                                    Ajouter un véhicule
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div style={{ fontSize: '2rem', marginBottom: '15px', color: 'var(--secondary-color)' }}>
                                <FontAwesomeIcon icon={faCar} />
                            </div>
                            <p className="text-light">Consultez vos véhicules pour voir les échéances d'entretien</p>
                            <Link to="/vehicles">
                                <button className="mt-20">
                                    <FontAwesomeIcon icon={faEye} style={{ marginRight: '5px' }} />
                                    Voir mes véhicules
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;