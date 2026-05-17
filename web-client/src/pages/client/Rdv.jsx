import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCar, faWrench, faCheck, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function Rdv() {
    const [vehicules, setVehicules] = useState([]);
    const [rdvs, setRdvs] = useState([]);
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
            const [vehiculesRes, rdvsRes] = await Promise.all([
                api.get('/vehicules'),
                api.get('/rdv')
            ]);
            setVehicules(vehiculesRes.data);
            setRdvs(rdvsRes.data);
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

    return (
        <div className="container">
            <div className="flex-between">
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

            <div className="mt-30">
                {rdvs.length === 0 ? (
                    <div className="card text-center">
                        <div style={{ fontSize: '3rem', marginBottom: '15px', color: 'var(--text-light)' }}>
                            <FontAwesomeIcon icon={faCalendarAlt} />
                        </div>
                        <p>Aucun rendez-vous</p>
                        <button onClick={() => setShowForm(true)} className="mt-20">
                            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '5px' }} />
                            Prendre un rendez-vous
                        </button>
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
                                        Statut: 
                                        <span className={`badge ${r.statut === 'confirmé' ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: '8px' }}>
                                            {r.statut === 'confirmé' ? <FontAwesomeIcon icon={faCheck} style={{ marginRight: '5px' }} /> : <FontAwesomeIcon icon={faTimes} style={{ marginRight: '5px' }} />}
                                            {r.statut}
                                        </span>
                                    </p>
                                </div>
                                {r.statut === 'confirmé' && (
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