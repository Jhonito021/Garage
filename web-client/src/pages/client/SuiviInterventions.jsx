import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWrench, 
  faCar, 
  faCalendarAlt, 
  faClock, 
  faCheckCircle, 
  faHourglassHalf, 
  faPlayCircle,
  faUser,
  faSearch,
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function SuiviInterventions() {
  const [interventions, setInterventions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    en_cours: 0,
    terminees: 0,
    prevues: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchInterventions = async () => {
    try {
      const [interventionsRes, statsRes] = await Promise.all([
        api.get('/suivi/interventions'),
        api.get('/suivi/interventions/stats')
      ]);
      
      console.log('Interventions reçues:', interventionsRes.data);
      console.log('Stats reçues:', statsRes.data);
      
      setInterventions(interventionsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Erreur:', err);
      console.error('Response:', err.response);
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
    fetchInterventions();
  };

  const getStatusIcon = (statut) => {
    switch(statut) {
      case 'terminée':
        return <FontAwesomeIcon icon={faCheckCircle} size={24} color="#4caf50" />;
      case 'en_cours':
        return <FontAwesomeIcon icon={faPlayCircle} size={24} color="#ff9800" />;
      case 'prévue':
        return <FontAwesomeIcon icon={faHourglassHalf} size={24} color="#2196f3" />;
      default:
        return <FontAwesomeIcon icon={faHourglassHalf} size={24} color="#aaaaaa" />;
    }
  };

  const getStatusText = (statut) => {
    switch(statut) {
      case 'terminée':
        return 'Terminée';
      case 'en_cours':
        return 'En cours';
      case 'prévue':
        return 'En attente';
      default:
        return statut || 'En attente';
    }
  };

  const getStatusColor = (statut) => {
    switch(statut) {
      case 'terminée':
        return '#4caf50';
      case 'en_cours':
        return '#ff9800';
      case 'prévue':
        return '#2196f3';
      default:
        return '#aaaaaa';
    }
  };

  const filteredInterventions = interventions.filter(i =>
    i.immatriculation?.toLowerCase().includes(filter.toLowerCase()) ||
    i.marque?.toLowerCase().includes(filter.toLowerCase()) ||
    i.modele?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container text-center" style={{ padding: '50px' }}>
        <div className="loading">Chargement de vos interventions...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: '30px', flexWrap: 'wrap' }}>
        <h1>
          <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
          Suivi des interventions
        </h1>
        <button onClick={handleRefresh} disabled={refreshing}>
          <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: '5px' }} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid-4" style={{ marginBottom: '30px' }}>
        <div className="card text-center">
          <div style={{ fontSize: '2rem', color: 'var(--secondary-color)' }}>
            <FontAwesomeIcon icon={faWrench} />
          </div>
          <h3>Total</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.total}</p>
          <p className="text-light">interventions</p>
        </div>
        <div className="card text-center">
          <div style={{ fontSize: '2rem', color: '#ff9800' }}>
            <FontAwesomeIcon icon={faPlayCircle} />
          </div>
          <h3>En cours</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ff9800' }}>{stats.en_cours}</p>
          <p className="text-light">intervention(s)</p>
        </div>
        <div className="card text-center">
          <div style={{ fontSize: '2rem', color: '#4caf50' }}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <h3>Terminées</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4caf50' }}>{stats.terminees}</p>
          <p className="text-light">intervention(s)</p>
        </div>
        <div className="card text-center">
          <div style={{ fontSize: '2rem', color: '#2196f3' }}>
            <FontAwesomeIcon icon={faHourglassHalf} />
          </div>
          <h3>En attente</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2196f3' }}>{stats.prevues}</p>
          <p className="text-light">intervention(s)</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="flex" style={{ alignItems: 'center', gap: '10px' }}>
          <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--text-light)' }} />
          <input 
            type="text" 
            placeholder="Rechercher par véhicule ou immatriculation..." 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ marginBottom: 0 }}
          />
        </div>
      </div>

      {/* Liste des interventions */}
      {filteredInterventions.length === 0 ? (
        <div className="card text-center">
          <FontAwesomeIcon icon={faWrench} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
          <p>Aucune intervention trouvée</p>
        </div>
      ) : (
        <div className="mt-20">
          {filteredInterventions.map(i => (
            <div 
              key={i.id} 
              className="card mb-20" 
              style={{ 
                borderLeft: `4px solid ${getStatusColor(i.statut)}`,
              }}
            >
              <div className="flex-between" style={{ flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div className="flex" style={{ alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    {getStatusIcon(i.statut)}
                    <h2 style={{ margin: 0, color: getStatusColor(i.statut) }}>
                      {getStatusText(i.statut)}
                    </h2>
                  </div>
                  
                  <h3>
                    <FontAwesomeIcon icon={faCar} style={{ marginRight: '10px' }} />
                    {i.marque} {i.modele} - {i.immatriculation}
                  </h3>
                  
                  <p>
                    <FontAwesomeIcon icon={faWrench} style={{ marginRight: '8px' }} />
                    {i.description || 'Intervention en cours'}
                  </p>
                  
                  <p>
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                    Début: {i.date_debut ? new Date(i.date_debut).toLocaleString('fr-FR') : 'Non démarrée'}
                  </p>
                  
                  {i.date_fin && (
                    <p>
                      <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px', color: '#4caf50' }} />
                      Fin: {new Date(i.date_fin).toLocaleString('fr-FR')}
                    </p>
                  )}
                  
                  {i.duree_totale && (
                    <p className="text-light">
                      <FontAwesomeIcon icon={faClock} style={{ marginRight: '8px' }} />
                      Durée totale: {i.duree_totale} minutes
                    </p>
                  )}
                  
                  {i.technicien_nom && (
                    <p className="text-light">
                      <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                      Technicien: {i.technicien_prenom} {i.technicien_nom}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SuiviInterventions;