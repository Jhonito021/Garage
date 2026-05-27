import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCar, 
  faPlus, 
  faEdit, 
  faTrash, 
  faTimes,
  faTachometerAlt,
  faCalendar,
  faGasPump,
  faCheckCircle,
  faExclamationTriangle,
  faSearch,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function Vehicles() {
  const [vehicules, setVehicules] = useState([]);
  const [filteredVehicules, setFilteredVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const fetchVehicules = async () => {
    try {
      const res = await api.get('/vehicules');
      setVehicules(res.data);
      setFilteredVehicules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = vehicules.filter(v => 
        v.immatriculation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modele?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVehicules(filtered);
    } else {
      setFilteredVehicules(vehicules);
    }
  }, [searchTerm, vehicules]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.immatriculation || !formData.marque || !formData.modele) {
      setError('Immatriculation, marque et modèle sont requis');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/vehicules/${editingId}`, formData);
        setSuccess('Véhicule modifié avec succès');
      } else {
        await api.post('/vehicules', formData);
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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
      setTimeout(() => setError(''), 3000);
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
        setError(err.response?.data?.error || 'Erreur');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleEdit = (vehicule) => {
    setFormData({
      immatriculation: vehicule.immatriculation,
      marque: vehicule.marque,
      modele: vehicule.modele,
      annee: vehicule.annee || '',
      type_carburant: vehicule.type_carburant || '',
      kilometrage_actuel: vehicule.kilometrage_actuel || ''
    });
    setEditingId(vehicule.id);
    setShowForm(true);
  };

  const getKilometrageStatus = (km) => {
    if (!km) return { text: 'Non renseigné', color: '#aaaaaa' };
    if (km > 200000) return { text: 'Kilométrage élevé', color: '#f44336' };
    if (km > 100000) return { text: 'Kilométrage modéré', color: '#ff9800' };
    return { text: 'Kilométrage faible', color: '#4caf50' };
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="loading">Chargement de vos véhicules...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: '30px', flexWrap: 'wrap' }}>
        <h1>
          <FontAwesomeIcon icon={faCar} style={{ marginRight: '10px' }} />
          Mes véhicules
        </h1>
        <div className="flex gap-10">
          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '10px', top: '12px', color: '#aaaaaa' }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '35px', width: '250px' }}
            />
          </div>
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
          }}>
            <FontAwesomeIcon icon={showForm ? faTimes : faPlus} style={{ marginRight: '5px' }} />
            {showForm ? 'Annuler' : 'Ajouter un véhicule'}
          </button>
        </div>
      </div>

      {error && <div className="card text-center" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', borderColor: '#f44336', marginBottom: '20px' }}><p className="text-danger">{error}</p></div>}
      {success && <div className="card text-center" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: '#4caf50', marginBottom: '20px' }}><p className="text-success">{success}</p></div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>{editingId ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h3>
          <form onSubmit={handleSubmit} className="grid-2" style={{ gap: '20px' }}>
            <div className="form-group">
              <label>Immatriculation *</label>
              <input type="text" name="immatriculation" placeholder="AA-123-BB" value={formData.immatriculation} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Marque *</label>
              <input type="text" name="marque" placeholder="Renault" value={formData.marque} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Modèle *</label>
              <input type="text" name="modele" placeholder="Clio" value={formData.modele} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Année</label>
              <input type="number" name="annee" placeholder="2020" value={formData.annee} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Type de carburant</label>
              <select name="type_carburant" value={formData.type_carburant} onChange={handleChange}>
                <option value="">Sélectionner</option>
                <option value="Essence">Essence</option>
                <option value="Diesel">Diesel</option>
                <option value="Électrique">Électrique</option>
                <option value="Hybride">Hybride</option>
              </select>
            </div>
            <div className="form-group">
              <label>Kilométrage</label>
              <input type="number" name="kilometrage_actuel" placeholder="0" value={formData.kilometrage_actuel} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <button type="submit">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {filteredVehicules.length === 0 ? (
        <div className="card text-center">
          <FontAwesomeIcon icon={faCar} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
          <p>Aucun véhicule trouvé</p>
          <button onClick={() => setShowForm(true)} className="mt-20">Ajouter mon premier véhicule</button>
        </div>
      ) : (
        <div className="grid-2">
          {filteredVehicules.map(v => {
            const kmStatus = getKilometrageStatus(v.kilometrage_actuel);
            return (
              <div key={v.id} className="card">
                <div className="flex-between" style={{ marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: 'var(--secondary-color)' }}>
                    <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                    {v.marque} {v.modele}
                  </h3>
                  <div className="flex gap-10">
                    <button onClick={() => handleEdit(v)} className="btn-accent" style={{ padding: '5px 10px' }}>
                      <FontAwesomeIcon icon={faEdit} /> Modifier
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="btn-accent" style={{ padding: '5px 10px', backgroundColor: 'var(--danger)' }}>
                      <FontAwesomeIcon icon={faTrash} /> Supprimer
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <p><FontAwesomeIcon icon={faIdCard} style={{ marginRight: '8px', color: 'var(--secondary-color)' }} /><strong>Immatriculation:</strong> {v.immatriculation}</p>
                  <p><FontAwesomeIcon icon={faCalendar} style={{ marginRight: '8px', color: 'var(--secondary-color)' }} /><strong>Année:</strong> {v.annee || '-'}</p>
                  <p><FontAwesomeIcon icon={faGasPump} style={{ marginRight: '8px', color: 'var(--secondary-color)' }} /><strong>Carburant:</strong> {v.type_carburant || '-'}</p>
                  <p><FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '8px', color: 'var(--secondary-color)' }} /><strong>Kilométrage:</strong> {v.kilometrage_actuel?.toLocaleString() || 0} km</p>
                </div>
                <div className="mt-10" style={{ paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ color: kmStatus.color }}>
                    <FontAwesomeIcon icon={kmStatus.text === 'Kilométrage faible' ? faCheckCircle : faExclamationTriangle} style={{ marginRight: '5px' }} />
                    {kmStatus.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Vehicles;