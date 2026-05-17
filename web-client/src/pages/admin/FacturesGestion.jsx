import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faDownload, faEuroSign, faCheckCircle, faHourglassHalf, faPlus } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function FacturesGestion() {
    const [factures, setFactures] = useState([]);
    const [vehicules, setVehicules] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        intervention_id: '',
        montant_total: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchFactures = async () => {
        try {
            const res = await api.get('/factures');
            setFactures(res.data);
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
        fetchFactures();
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
            await api.post('/factures', formData);
            setSuccess('Facture créée avec succès');
            setShowForm(false);
            setFormData({ intervention_id: '', montant_total: '' });
            fetchFactures();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handlePayer = async (id) => {
        try {
            await api.put(`/factures/${id}/payer`);
            fetchFactures();
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur');
        }
    };

    const handleDownload = async (id) => {
        try {
            const response = await api.get(`/factures/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `facture_${id}.pdf`);
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
                        Factures
                    </h1>
                    <button onClick={() => setShowForm(!showForm)}>
                        <FontAwesomeIcon icon={faPlus} style={{ marginRight: '5px' }} />
                        {showForm ? 'Annuler' : 'Nouvelle facture'}
                    </button>
                </div>

                {error && <p className="text-danger text-center">{error}</p>}
                {success && <p className="text-success text-center">{success}</p>}

                {showForm && (
                    <div className="card mt-20">
                        <h3>Créer une facture</h3>
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
                                name="montant_total"
                                placeholder="Montant (€)"
                                value={formData.montant_total}
                                onChange={handleChange}
                                required
                            />
                            <button type="submit">Créer la facture</button>
                        </form>
                    </div>
                )}

                <div className="mt-30">
                    {factures.length === 0 ? (
                        <div className="card text-center">
                            <p>Aucune facture</p>
                        </div>
                    ) : (
                        factures.map(f => (
                            <div key={f.id} className="card mb-20">
                                <div className="flex-between">
                                    <div>
                                        <h3>Facture #{f.id}</h3>
                                        <p>Date: {new Date(f.date_emission).toLocaleDateString('fr-FR')}</p>
                                        <p>Montant: {f.montant_total} €</p>
                                        <p>Véhicule: {f.marque} {f.modele} - {f.immatriculation}</p>
                                        <p>
                                            Statut: 
                                            <span className={`badge ${f.statut_paiement === 'payé' ? 'badge-success' : 'badge-danger'}`}>
                                                {f.statut_paiement === 'payé' ? 'Payée' : 'Impayée'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex gap-10">
                                        <button onClick={() => handleDownload(f.id)} className="btn-accent">
                                            <FontAwesomeIcon icon={faDownload} style={{ marginRight: '5px' }} />
                                            PDF
                                        </button>
                                        {f.statut_paiement === 'impayé' && (
                                            <button onClick={() => handlePayer(f.id)} style={{ backgroundColor: 'var(--success)' }}>
                                                <FontAwesomeIcon icon={faEuroSign} style={{ marginRight: '5px' }} />
                                                Marquer payée
                                            </button>
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

export default FacturesGestion;