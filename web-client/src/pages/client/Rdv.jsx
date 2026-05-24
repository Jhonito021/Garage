import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCar, faWrench, faCheck, faTimes, faPlus, faSpinner, faCheckCircle, faClock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function Rdv() {
    const [vehicules, setVehicules] = useState([]);
    const [rdvs, setRdvs] = useState([]);
    const [interventions, setInterventions] = useState([]);
    const [creneaux, setCreneaux] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        vehicule_id: '',
        date: '',
        heure: '',
        service_demande: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [vehiculesRes, rdvsRes, interventionsRes] = await Promise.all([
                api.get('/vehicules'),
                api.get('/rdv'),
                api.get('/interventions/client')
            ]);
            setVehicules(vehiculesRes.data);
            setRdvs(rdvsRes.data);
            setInterventions(interventionsRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchCreneaux = async (date) => {
        if (!date) return;
        try {
            const res = await api.get(`/planning/disponibles?date=${date}`);
            setCreneaux(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setFormData({ ...formData, date, heure: '' });
        fetchCreneaux(date);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const dateHeure = `${formData.date} ${formData.heure}:00`;

        try {
            await api.post('/rdv', {
                vehicule_id: formData.vehicule_id,
                date_heure: dateHeure,
                service_demande: formData.service_demande
            });
            setShowForm(false);
            setFormData({ vehicule_id: '', date: '', heure: '', service_demande: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de la réservation');
        } finally {
            setLoading(false);
        }
    };

    const handleAnnuler = async (id) => {
        if (window.confirm('Annuler ce rendez-vous ?')) {
            try {
                await api.put(`/rdv/${id}/annuler`);
                fetchData();
            } catch (err) {
                alert(err.response?.data?.error || 'Erreur');
            }
        }
    };

    // Vérifier si un rendez-vous a une intervention associée
    const hasIntervention = (rdvId) => {
        return interventions.some(i => i.rdv_id === rdvId);
    };

    // Vérifier si l'intervention est en cours ou terminée
    const getInterventionStatus = (rdvId) => {
        const intervention = interventions.find(i => i.rdv_id === rdvId);
        if (intervention) {
            return intervention.statut;
        }
        return null;
    };

    // Vérifier si le client peut annuler le rendez-vous
    const canCancel = (rdv) => {
        // Si le rendez-vous est déjà annulé, on ne peut pas l'annuler
        if (rdv.statut === 'annulé') return false;
        
        // Récupérer le statut de l'intervention associée
        const interventionStatus = getInterventionStatus(rdv.id);
        
        // Si l'intervention est en cours ou terminée, on ne peut pas annuler
        if (interventionStatus === 'en_cours' || interventionStatus === 'terminée') {
            return false;
        }
        
        return true;
    };

    // Obtenir le message d'information sur l'annulation
    const getCancelMessage = (rdv) => {
        const interventionStatus = getInterventionStatus(rdv.id);
        if (interventionStatus === 'en_cours') {
            return "Impossible d'annuler : l'intervention est déjà en cours";
        }
        if (interventionStatus === 'terminée') {
            return "Impossible d'annuler : l'intervention est déjà terminée";
        }
        return null;
    };

    const getStatusBadge = (statut, rdvId) => {
        const interventionStatus = getInterventionStatus(rdvId);
        
        if (interventionStatus === 'en_cours') {
            return <span className="badge badge-warning"><FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />Intervention en cours</span>;
        }
        if (interventionStatus === 'terminée') {
            return <span className="badge badge-success"><FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px' }} />Intervention terminée</span>;
        }
        
        switch(statut) {
            case 'confirmé':
                return <span className="badge badge-warning"><FontAwesomeIcon icon={faSpinner} style={{ marginRight: '5px' }} />Confirmé</span>;
            case 'annulé':
                return <span className="badge badge-danger"><FontAwesomeIcon icon={faTimes} style={{ marginRight: '5px' }} />Annulé</span>;
            default:
                return <span className="badge badge-info">{statut}</span>;
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <h1>
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
                    Mes rendez-vous
                </h1>
                <button onClick={() => setShowForm(!showForm)}>
                    <FontAwesomeIcon icon={showForm ? faTimes : faPlus} style={{ marginRight: '5px' }} />
                    {showForm ? 'Annuler' : 'Prendre rendez-vous'}
                </button>
            </div>

            {error && <p className="text-danger">{error}</p>}

            {showForm && (
                <div className="card mt-20">
                    <h3>Nouveau rendez-vous</h3>
                    <form onSubmit={handleSubmit}>
                        <select value={formData.vehicule_id} onChange={(e) => setFormData({ ...formData, vehicule_id: e.target.value })} required>
                            <option value="">Sélectionner un véhicule</option>
                            {vehicules.map(v => (
                                <option key={v.id} value={v.id}>{v.marque} {v.modele} - {v.immatriculation}</option>
                            ))}
                        </select>

                        <input type="date" value={formData.date} onChange={handleDateChange} required />

                        <select value={formData.heure} onChange={(e) => setFormData({ ...formData, heure: e.target.value })} required disabled={creneaux.length === 0}>
                            <option value="">Sélectionner un horaire</option>
                            {creneaux.map(creneau => (
                                <option key={creneau} value={creneau}>{creneau}</option>
                            ))}
                        </select>

                        <select value={formData.service_demande} onChange={(e) => setFormData({ ...formData, service_demande: e.target.value })} required>
                            <option value="">Type de prestation</option>
                            <option value="Vidange">Vidange</option>
                            <option value="Contrôle technique">Contrôle technique</option>
                            <option value="Réparation">Réparation</option>
                            <option value="Entretien courant">Entretien courant</option>
                            <option value="Pneumatiques">Pneumatiques</option>
                        </select>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Réservation...' : 'Confirmer le rendez-vous'}
                        </button>
                    </form>
                </div>
            )}

            <div style={{ marginTop: '30px', display: 'grid', gap: '20px' }}>
                {rdvs.length === 0 ? (
                    <div className="card text-center">
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
                        <p>Aucun rendez-vous</p>
                        <button onClick={() => setShowForm(true)} className="mt-20">Prendre un rendez-vous</button>
                    </div>
                ) : (
                    rdvs.map(r => (
                        <div key={r.id} className="card mb-20">
                            <div className="flex-between">
                                <div>
                                    <h3>
                                        <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                                        {r.service_demande}
                                    </h3>
                                    <p>
                                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                                        {new Date(r.date_heure).toLocaleString('fr-FR')}
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                                        {r.marque} {r.modele} - {r.immatriculation}
                                    </p>
                                    <p>
                                        Statut: {getStatusBadge(r.statut, r.id)}
                                    </p>
                                    {getCancelMessage(r) && (
                                        <p className="text-warning" style={{ fontSize: '12px', marginTop: '5px' }}>
                                            <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '5px' }} />
                                            {getCancelMessage(r)}
                                        </p>
                                    )}
                                </div>
                                {canCancel(r) && (
                                    <button onClick={() => handleAnnuler(r.id)} className="btn-accent">
                                        <FontAwesomeIcon icon={faTimes} style={{ marginRight: '5px' }} />
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Rdv;