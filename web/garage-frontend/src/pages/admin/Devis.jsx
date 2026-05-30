import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faDownload, faCheck, faTimes, faEye, faPlus } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Devis() {
    const [devis, setDevis] = useState([]);
    const [vehicules, setVehicules] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        intervention_id: '',
        montant: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchDevis = async () => {
        try {
            const res = await api.get('/devis');
            setDevis(res.data);
        } catch (err) {
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicules = async () => {
        try {
            const res = await api.get('/vehicules');
            setVehicules(res.data);
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    useEffect(() => {
        fetchDevis();
        fetchVehicules();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/devis', formData);
            setSuccess('Devis créé avec succès');
            setShowForm(false);
            setFormData({ intervention_id: '', montant: '' });
            fetchDevis();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.put(`/devis/${id}/accepter`);
            fetchDevis();
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur');
        }
    };

    const handleRefuse = async (id) => {
        try {
            await api.put(`/devis/${id}/refuser`);
            fetchDevis();
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur');
        }
    };

    const handleDownload = async (id) => {
        try {
            const response = await api.get(`/devis/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `devis_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Erreur lors du téléchargement');
        }
    };

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
                <div className="flex-between">
                    <h1>
                        <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: '10px' }} />
                        Devis
                    </h1>
                    <button onClick={() => setShowForm(!showForm)}>
                        <FontAwesomeIcon icon={faPlus} style={{ marginRight: '5px' }} />
                        {showForm ? 'Annuler' : 'Nouveau devis'}
                    </button>
                </div>

                {error && <p className="text-danger text-center">{error}</p>}
                {success && <p className="text-success text-center">{success}</p>}

                {showForm && (
                    <div className="card mt-20">
                        <h3>Créer un devis</h3>
                        <form onSubmit={handleSubmit}>
                            <select name="intervention_id" value={formData.intervention_id} onChange={handleChange} required>
                                <option value="">Sélectionner une intervention</option>
                                {vehicules.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.marque} {v.modele} - {v.immatriculation}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                step="0.01"
                                name="montant"
                                placeholder="Montant (Ar)"
                                value={formData.montant}
                                onChange={handleChange}
                                required
                            />
                            <button type="submit">Créer le devis</button>
                        </form>
                    </div>
                )}

                <div className="mt-30">
                    {devis.length === 0 ? (
                        <div className="card text-center">
                            <p>Aucun devis</p>
                        </div>
                    ) : (
                        devis.map(d => (
                            <div key={d.id} className="card mb-20">
                                <div className="flex-between">
                                    <div>
                                        <h3>Devis #{d.id}</h3>
                                        <p>Date: {new Date(d.date_emission).toLocaleDateString('fr-FR')}</p>
                                        <p>Montant: {d.montant} Ar</p>
                                        <p>Véhicule: {d.marque} {d.modele} - {d.immatriculation}</p>
                                        <p>
                                            Statut: 
                                            <span className={`badge ${d.statut === 'accepté' ? 'badge-success' : d.statut === 'refusé' ? 'badge-danger' : 'badge-warning'}`}>
                                                {d.statut}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex gap-10">
                                        <button onClick={() => handleDownload(d.id)} className="btn-accent">
                                            <FontAwesomeIcon icon={faDownload} style={{ marginRight: '5px' }} />
                                            PDF
                                        </button>
                                        {d.statut === 'envoyé' && (
                                            <>
                                                <button onClick={() => handleAccept(d.id)} style={{ backgroundColor: 'var(--success)' }}>
                                                    <FontAwesomeIcon icon={faCheck} style={{ marginRight: '5px' }} />
                                                    Accepter
                                                </button>
                                                <button onClick={() => handleRefuse(d.id)} style={{ backgroundColor: 'var(--danger)' }}>
                                                    <FontAwesomeIcon icon={faTimes} style={{ marginRight: '5px' }} />
                                                    Refuser
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Devis;