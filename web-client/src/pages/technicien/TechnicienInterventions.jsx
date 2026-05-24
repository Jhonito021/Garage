import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWrench, 
  faCar, 
  faUser, 
  faCalendarAlt, 
  faPlay, 
  faCheck, 
  faOilCan, 
  faCheckCircle, 
  faClock, 
  faHourglassHalf, 
  faExclamationTriangle, 
  faSyncAlt,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function TechnicienInterventions() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showVidangeModal, setShowVidangeModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [vidangeData, setVidangeData] = useState({
    kilometrage: '',
    type_huile: 'synthétique'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchInterventions = async () => {
    try {
      const res = await api.get('/interventions/technicien');
      console.log('Mes interventions:', res.data);
      setInterventions(res.data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des interventions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setError('');
    setSuccess('');
    fetchInterventions();
  };

  const handleStart = async (id) => {
    try {
      await api.put(`/interventions/${id}/debut`);
      setInterventions(interventions.map(i => 
        i.id === id ? { ...i, statut: 'en_cours', date_debut: new Date().toISOString() } : i
      ));
      setSuccess('Intervention démarrée avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du démarrage');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEnd = async (id) => {
    try {
      await api.put(`/interventions/${id}/fin`);
      setInterventions(interventions.map(i => 
        i.id === id ? { ...i, statut: 'terminée', date_fin: new Date().toISOString() } : i
      ));
      setSuccess('Intervention terminée avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la fin');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openVidangeModal = (intervention) => {
    setSelectedIntervention(intervention);
    setVidangeData({ kilometrage: '', type_huile: 'synthétique' });
    setShowVidangeModal(true);
  };

  const handleVidangeChange = (e) => {
    setVidangeData({ ...vidangeData, [e.target.name]: e.target.value });
  };

  const submitVidange = async () => {
    if (!vidangeData.kilometrage) {
      setError('Veuillez saisir le kilométrage');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await api.post('/vidange', {
        vehicule_id: selectedIntervention.vehicule_id,
        intervention_id: selectedIntervention.id,
        kilometrage: vidangeData.kilometrage,
        type_huile: vidangeData.type_huile
      });
      setSuccess('Vidange enregistrée avec succès');
      setShowVidangeModal(false);
      fetchInterventions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement de la vidange');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (statut) => {
    switch(statut) {
      case 'terminée':
        return <span className="badge badge-success"><FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px' }} />Terminée</span>;
      case 'en_cours':
        return <span className="badge badge-warning"><FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />En cours</span>;
      case 'prévue':
        return <span className="badge badge-info"><FontAwesomeIcon icon={faHourglassHalf} style={{ marginRight: '5px' }} />Prévue</span>;
      default:
        return <span className="badge badge-info">{statut}</span>;
    }
  };

  const getTypePrestationBadge = (type) => {
    const colors = {
      'Vidange': 'badge-info',
      'Contrôle technique': 'badge-warning',
      'Réparation': 'badge-danger',
      'Entretien courant': 'badge-success',
      'Pneumatiques': 'badge-info'
    };
    return <span className={`badge ${colors[type] || 'badge-info'}`}>{type || 'Intervention'}</span>;
  };

  const canStart = (intervention) => {
    if (intervention.statut !== 'prévue') return false;
    const datePrevue = intervention.rdv_date ? new Date(intervention.rdv_date) : null;
    if (!datePrevue) return true;
    const dateActuelle = new Date();
    const diffTime = Math.abs(dateActuelle - datePrevue);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  };

  const getStartWarning = (intervention) => {
    if (intervention.statut !== 'prévue') return null;
    const datePrevue = intervention.rdv_date ? new Date(intervention.rdv_date) : null;
    if (!datePrevue) return null;
    const dateActuelle = new Date();
    const diffTime = Math.abs(dateActuelle - datePrevue);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      if (dateActuelle < datePrevue) {
        return `Intervention prévue pour le ${datePrevue.toLocaleDateString('fr-FR')} (dans ${diffDays} jours)`;
      } else {
        return `Intervention en retard de ${diffDays} jours (prévue le ${datePrevue.toLocaleDateString('fr-FR')})`;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="admin-content">
          <div className="loading">Chargement de vos interventions...</div>
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
            <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
            Mes interventions
          </h1>
          <button onClick={handleRefresh} disabled={refreshing}>
            <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: '5px' }} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>

        {error && (
          <div className="card text-center" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', borderColor: 'var(--danger)', marginBottom: '20px' }}>
            <p className="text-danger">{error}</p>
          </div>
        )}

        {success && (
          <div className="card text-center" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: 'var(--success)', marginBottom: '20px' }}>
            <p className="text-success">{success}</p>
          </div>
        )}

        {interventions.length === 0 ? (
          <div className="card text-center mt-30">
            <FontAwesomeIcon icon={faWrench} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
            <p>Aucune intervention pour le moment</p>
          </div>
        ) : (
          <div className="mt-30">
            {interventions.map(i => (
              <div key={i.id} className="card mb-20">
                <div className="flex-between" style={{ flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div className="flex" style={{ alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0 }}>
                        <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                        Intervention #{i.id}
                      </h3>
                      {getTypePrestationBadge(i.type_prestation)}
                    </div>
                    <p>
                      <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                      {i.marque} {i.modele} - {i.immatriculation}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                      Client: {i.prenom} {i.nom}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faTag} style={{ marginRight: '8px' }} />
                      Prestation: <strong>{i.type_prestation || i.description || 'Non spécifié'}</strong>
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                      Date prévue: {i.rdv_date ? new Date(i.rdv_date).toLocaleString('fr-FR') : 'Non planifiée'}
                    </p>
                    {i.date_debut && (
                      <p>
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '8px' }} />
                        Début: {new Date(i.date_debut).toLocaleString('fr-FR')}
                      </p>
                    )}
                    {i.date_fin && (
                      <p>
                        <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px' }} />
                        Fin: {new Date(i.date_fin).toLocaleString('fr-FR')}
                      </p>
                    )}
                    {i.duree_totale && (
                      <p className="text-light">Durée: {i.duree_totale} minutes</p>
                    )}
                    <p style={{ marginTop: '10px' }}>
                      Statut: {getStatusBadge(i.statut)}
                    </p>
                    
                    {getStartWarning(i) && (
                      <p className="text-danger mt-10" style={{ fontSize: '12px', padding: '8px', backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: '5px' }}>
                        <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '8px' }} />
                        {getStartWarning(i)}
                      </p>
                    )}
                  </div>
                  
                  {/* Boutons d'action - uniquement si non terminée */}
                  {i.statut !== 'terminée' && (
                    <div className="flex gap-10" style={{ marginTop: '10px', flexWrap: 'wrap' }}>
                      {i.statut === 'prévue' && (
                        <button 
                          onClick={() => handleStart(i.id)}
                          disabled={!canStart(i)}
                          style={{ 
                            opacity: !canStart(i) ? 0.5 : 1,
                            cursor: !canStart(i) ? 'not-allowed' : 'pointer'
                          }}
                          title={!canStart(i) ? "Intervention non disponible à la date actuelle" : ""}
                        >
                          <FontAwesomeIcon icon={faPlay} style={{ marginRight: '5px' }} />
                          Démarrer
                        </button>
                      )}
                      {i.statut === 'en_cours' && (
                        <>
                          <button onClick={() => handleEnd(i.id)}>
                            <FontAwesomeIcon icon={faCheck} style={{ marginRight: '5px' }} />
                            Terminer
                          </button>
                          <button onClick={() => openVidangeModal(i)} className="btn-accent">
                            <FontAwesomeIcon icon={faOilCan} style={{ marginRight: '5px' }} />
                            Enregistrer vidange
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Message pour intervention terminée */}
                  {i.statut === 'terminée' && (
                    <div className="text-center" style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '5px', minWidth: '200px' }}>
                      <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px', color: '#4caf50' }} />
                      <span className="text-success">Intervention terminée</span>
                      <br />
                      <span className="text-light" style={{ fontSize: '12px' }}>Aucune action possible</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'enregistrement de vidange */}
      {showVidangeModal && selectedIntervention && (
        <div className="modal-overlay" onClick={() => setShowVidangeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>
                <FontAwesomeIcon icon={faOilCan} style={{ marginRight: '10px' }} />
                Enregistrer la vidange
              </h3>
              <span className="modal-close" onClick={() => setShowVidangeModal(false)}>&times;</span>
            </div>
            <div>
              <p><strong>Véhicule:</strong> {selectedIntervention.marque} {selectedIntervention.modele} - {selectedIntervention.immatriculation}</p>
              <p><strong>Client:</strong> {selectedIntervention.prenom} {selectedIntervention.nom}</p>
              <p><strong>Prestation:</strong> {selectedIntervention.type_prestation || selectedIntervention.description}</p>
              <hr style={{ borderColor: '#333', margin: '15px 0' }} />
              <div className="form-group">
                <label>Kilométrage actuel *</label>
                <input
                  type="number"
                  name="kilometrage"
                  value={vidangeData.kilometrage}
                  onChange={handleVidangeChange}
                  placeholder="km"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type d'huile</label>
                <select name="type_huile" value={vidangeData.type_huile} onChange={handleVidangeChange}>
                  <option value="synthétique">Synthétique</option>
                  <option value="semi_synthétique">Semi-synthétique</option>
                  <option value="minérale">Minérale</option>
                </select>
              </div>
              <div className="flex gap-10" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={() => setShowVidangeModal(false)} className="btn-outline">Annuler</button>
                <button onClick={submitVidange}>Enregistrer la vidange</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TechnicienInterventions;