import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faPlus, faTrash, faEdit, faTachometerAlt, faCalendar, faGasPump, faTimes } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

function Vehicles() {
    const [vehicules, setVehicules] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        immatriculation: '',
        marque: '',
        modele: '',
        annee: '',
        type_carburant: '',
        kilometrage_actuel: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchVehicules = async () => {
        try {
            const response = await api.get('/vehicules');
            console.log('Réponse API:', response.data);
            
            // Vérifier si la réponse est un tableau
            if (Array.isArray(response.data)) {
                setVehicules(response.data);
            } else if (response.data.vehicules && Array.isArray(response.data.vehicules)) {
                setVehicules(response.data.vehicules);
            } else {
                setVehicules([]);
            }
        } catch (err) {
            console.error('Erreur chargement:', err);
            setError('Impossible de charger les véhicules');
        }
    };

    useEffect(() => {
        fetchVehicules();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        
        try {
            let response;
            if (editingId) {
                response = await api.put(`/vehicules/${editingId}`, formData);
                console.log('Modification réponse:', response.data);
                setSuccess('Véhicule modifié avec succès');
            } else {
                response = await api.post('/vehicules', formData);
                console.log('Ajout réponse:', response.data);
                setSuccess('Véhicule ajouté avec succès');
            }
            
            setShowForm(false);
            setEditingId(null);
            setFormData({
                immatriculation: '',
                marque: '',
                modele: '',
                annee: '',
                type_carburant: '',
                kilometrage_actuel: ''
            });
            fetchVehicules();
            
            // Effacer le message après 3 secondes
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Erreur:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Erreur lors de l\'enregistrement';
            setError(errorMsg);
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce véhicule ?')) {
            try {
                await api.delete(`/vehicules/${id}`);
                setSuccess('Véhicule supprimé avec succès');
                fetchVehicules();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                const errorMsg = err.response?.data?.error || 'Erreur lors de la suppression';
                setError(errorMsg);
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleEdit = (vehicule) => {
        setFormData({
            immatriculation: vehicule.immatriculation || '',
            marque: vehicule.marque || '',
            modele: vehicule.modele || '',
            annee: vehicule.annee || '',
            type_carburant: vehicule.type_carburant || '',
            kilometrage_actuel: vehicule.kilometrage_actuel || ''
        });
        setEditingId(vehicule.id);
        setShowForm(true);
    };

    return (
        <div className="container">
            <div className="flex-between">
                <h1>
                    <FontAwesomeIcon icon={faCar} style={{ marginRight: '10px' }} />
                    Mes véhicules
                </h1>
                <button onClick={() => {
                    setShowForm(!showForm);
                    setEditingId(null);
                    setFormData({
                        immatriculation: '',
                        marque: '',
                        modele: '',
                        annee: '',
                        type_carburant: '',
                        kilometrage_actuel: ''
                    });
                    setError('');
                    setSuccess('');
                }}>
                    <FontAwesomeIcon icon={showForm ? faTimes : faPlus} style={{ marginRight: '5px' }} />
                    {showForm ? 'Annuler' : 'Ajouter un véhicule'}
                </button>
            </div>

            {error && <p className="text-danger text-center" style={{ padding: '10px', backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: '5px' }}>{error}</p>}
            {success && <p className="text-success text-center" style={{ padding: '10px', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '5px' }}>{success}</p>}

            {showForm && (
                <div className="card mt-20">
                    <h3>{editingId ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h3>
                    <form onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            name="immatriculation" 
                            placeholder="Immatriculation (ex: AA-123-BB)" 
                            value={formData.immatriculation} 
                            onChange={handleChange} 
                            required 
                        />
                        <input 
                            type="text" 
                            name="marque" 
                            placeholder="Marque" 
                            value={formData.marque} 
                            onChange={handleChange} 
                            required 
                        />
                        <input 
                            type="text" 
                            name="modele" 
                            placeholder="Modèle" 
                            value={formData.modele} 
                            onChange={handleChange} 
                            required 
                        />
                        <input 
                            type="number" 
                            name="annee" 
                            placeholder="Année" 
                            value={formData.annee} 
                            onChange={handleChange} 
                        />
                        <select name="type_carburant" value={formData.type_carburant} onChange={handleChange}>
                            <option value="">Type de carburant</option>
                            <option value="Essence">Essence</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Électrique">Électrique</option>
                            <option value="Hybride">Hybride</option>
                        </select>
                        <input 
                            type="number" 
                            name="kilometrage_actuel" 
                            placeholder="Kilométrage actuel" 
                            value={formData.kilometrage_actuel} 
                            onChange={handleChange} 
                        />
                        <button type="submit" disabled={loading}>
                            <FontAwesomeIcon icon={faEdit} style={{ marginRight: '5px' }} />
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </form>
                </div>
            )}

            <div className="mt-30">
                {vehicules.length === 0 ? (
                    <div className="card text-center">
                        <div style={{ fontSize: '3rem', marginBottom: '15px', color: 'var(--text-light)' }}>
                            <FontAwesomeIcon icon={faCar} />
                        </div>
                        <p>Aucun véhicule enregistré</p>
                        <button onClick={() => setShowForm(true)} className="mt-20">
                            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '5px' }} />
                            Ajouter mon premier véhicule
                        </button>
                    </div>
                ) : (
                    vehicules.map(v => (
                        <div key={v.id} className="card mb-20">
                            <div className="flex-between">
                                <div>
                                    <h3>{v.marque} {v.modele}</h3>
                                    <p>
                                        <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                                        {v.immatriculation}
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '8px' }} />
                                        {v.annee || 'Année non renseignée'}
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faGasPump} style={{ marginRight: '8px' }} />
                                        {v.type_carburant || 'Non spécifié'}
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '8px' }} />
                                        {v.kilometrage_actuel?.toLocaleString()} km
                                    </p>
                                </div>
                                <div className="flex gap-10">
                                    <button onClick={() => handleEdit(v)} className="btn-accent" type="button">
                                        <FontAwesomeIcon icon={faEdit} style={{ marginRight: '5px' }} />
                                        Modifier
                                    </button>
                                    <button onClick={() => handleDelete(v.id)} className="btn-accent" type="button">
                                        <FontAwesomeIcon icon={faTrash} style={{ marginRight: '5px' }} />
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Vehicles;