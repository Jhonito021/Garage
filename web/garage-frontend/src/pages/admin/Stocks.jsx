import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxes, faPlus, faEdit, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Stocks() {
    const [pieces, setPieces] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        reference: '',
        quantite_stock: '',
        seuil_alerte: '',
        prix_unitaire: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchPieces = async () => {
        try {
            const res = await api.get('/pieces');
            setPieces(res.data);
        } catch (err) {
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPieces();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            if (editingId) {
                await api.put(`/pieces/${editingId}`, formData);
                setSuccess('Pièce modifiée avec succès');
            } else {
                await api.post('/pieces', formData);
                setSuccess('Pièce ajoutée avec succès');
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ nom: '', reference: '', quantite_stock: '', seuil_alerte: '', prix_unitaire: '' });
            fetchPieces();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette pièce ?')) {
            try {
                await api.delete(`/pieces/${id}`);
                fetchPieces();
            } catch (err) {
                alert(err.response?.data?.error || 'Erreur');
            }
        }
    };

    const handleEdit = (piece) => {
        setFormData({
            nom: piece.nom,
            reference: piece.reference,
            quantite_stock: piece.quantite_stock,
            seuil_alerte: piece.seuil_alerte,
            prix_unitaire: piece.prix_unitaire
        });
        setEditingId(piece.id);
        setShowForm(true);
    };

    const stockAlertes = pieces.filter(p => p.quantite_stock <= p.seuil_alerte);

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
                        <FontAwesomeIcon icon={faBoxes} style={{ marginRight: '10px' }} />
                        Gestion des stocks
                    </h1>
                    <button onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({ nom: '', reference: '', quantite_stock: '', seuil_alerte: '', prix_unitaire: '' });
                    }}>
                        <FontAwesomeIcon icon={faPlus} style={{ marginRight: '5px' }} />
                        {showForm ? 'Annuler' : 'Ajouter une pièce'}
                    </button>
                </div>

                {stockAlertes.length > 0 && (
                    <div className="card mt-20" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', border: '1px solid var(--danger)' }}>
                        <h4>
                            <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '10px', color: 'var(--danger)' }} />
                            Alertes stock bas
                        </h4>
                        {stockAlertes.map(p => (
                            <p key={p.id}>⚠️ {p.nom} : plus que {p.quantite_stock} unités (seuil: {p.seuil_alerte})</p>
                        ))}
                    </div>
                )}

                {error && <p className="text-danger text-center">{error}</p>}
                {success && <p className="text-success text-center">{success}</p>}

                {showForm && (
                    <div className="card mt-20">
                        <h3>{editingId ? 'Modifier la pièce' : 'Ajouter une pièce'}</h3>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="nom">Nom de la pièce:</label><input type="text" name="nom" placeholder="Nom de la pièce" value={formData.nom} onChange={handleChange} required />
                            <label htmlFor="reference">Référence</label><input type="text" name="reference" placeholder="Référence" value={formData.reference} onChange={handleChange} required />
                            <label htmlFor="quantite_stock">Quantié stock</label><input type="number" name="quantite_stock" placeholder="Quantité en stock" value={formData.quantite_stock} onChange={handleChange} />
                            <label htmlFor="seuil_alerte">Seuil alerte</label><input type="number" name="seuil_alerte" placeholder="Seuil d'alerte" value={formData.seuil_alerte} onChange={handleChange} />
                            <label htmlFor="prix_unitaire">Prix unitaire</label><input type="number" step="0.01" name="prix_unitaire" placeholder="Prix unitaire (Ar)" value={formData.prix_unitaire} onChange={handleChange} required />
                            <button type="submit">Enregistrer</button>
                        </form>
                    </div>
                )}

                <div className="mt-30">
                    {pieces.length === 0 ? (
                        <div className="card text-center">
                            <p>Aucune pièce en stock</p>
                            <button onClick={() => setShowForm(true)}>Ajouter votre première pièce</button>
                        </div>
                    ) : (
                        pieces.map(p => (
                            <div key={p.id} className="card mb-20">
                                <div className="flex-between">
                                    <div>
                                        <h3>{p.nom}</h3>
                                        <p>Référence: {p.reference}</p>
                                        <p>Quantité: {p.quantite_stock} unités</p>
                                        <p>Seuil d'alerte: {p.seuil_alerte}</p>
                                        <p>Prix unitaire: {p.prix_unitaire} Ar</p>
                                        {p.quantite_stock <= p.seuil_alerte && (
                                            <p className="text-danger">⚠️ Stock bas !</p>
                                        )}
                                    </div>
                                    <div className="flex gap-10">
                                        <button onClick={() => handleEdit(p)} className="btn-accent">
                                            <FontAwesomeIcon icon={faEdit} style={{ marginRight: '5px' }} />
                                            Modifier
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="btn-accent">
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
        </div>
    );
}

export default Stocks;