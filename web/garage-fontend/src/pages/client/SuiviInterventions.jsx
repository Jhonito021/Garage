import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faCar, 
  faWrench, 
  faCalendarAlt, 
  faClock, 
  faCheckCircle, 
  faHourglassHalf, 
  faPlayCircle,
  faFilter,
  faSearch,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function SuiviIntervention() {
  const [interventions, setInterventions] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const res = await api.get('/suivi/interventions');
        console.log('Interventions reçues:', res.data);
        setInterventions(res.data);
        setFilteredInterventions(res.data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterventions();
  }, []);

  useEffect(() => {
    let result = [...interventions];
    
    // Filtre par statut
    if (filter !== 'all') {
      if (filter === 'en_cours') {
        result = result.filter(i => i.statut === 'en_cours');
      } else if (filter === 'en_attente') {
        result = result.filter(i => i.statut === 'prévue' || !i.statut);
      } else if (filter === 'terminee') {
        result = result.filter(i => i.statut === 'terminée');
      }
    }
    
    // Filtre par recherche
    if (searchTerm) {
      result = result.filter(i => 
        i.immatriculation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.modele?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredInterventions(result);
  }, [filter, searchTerm, interventions]);

  const getStatusIcon = (statut) => {
    switch(statut) {
      case 'terminée':
        return <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#4caf50', marginRight: '8px' }} />;
      case 'en_cours':
        return <FontAwesomeIcon icon={faPlayCircle} style={{ color: '#ff9800', marginRight: '8px' }} />;
      case 'prévue':
        return <FontAwesomeIcon icon={faHourglassHalf} style={{ color: '#2196f3', marginRight: '8px' }} />;
      default:
        return <FontAwesomeIcon icon={faHourglassHalf} style={{ color: '#aaaaaa', marginRight: '8px' }} />;
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

  const getStats = () => {
    const total = interventions.length;
    const enCours = interventions.filter(i => i.statut === 'en_cours').length;
    const terminees = interventions.filter(i => i.statut === 'terminée').length;
    const enAttente = interventions.filter(i => i.statut === 'prévue' || !i.statut).length;
    return { total, enCours, terminees, enAttente };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="container text-center">
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement de vos interventions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: '30px', flexWrap: 'wrap' }}>
        <h1>
          <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '10px' }} />
          Suivi des interventions
        </h1>
      </div>

      {/* Statistiques */}
      <div className="grid-4" style={{ marginBottom: '30px' }}>
        <div className="card text-center">
          <div style={{ fontSize: '2rem', color: 'var(--secondary-color)' }}>
            <FontAwesomeIcon icon={faChartLine} />
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
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ff9800' }}>{stats.enCours}</p>
          <p className="text-light">intervention(s)</p>
        </div>
        <div className="card text-center">
          <div style={{ fontSize: '2rem', color: '#2196f3' }}>
            <FontAwesomeIcon icon={faHourglassHalf} />
          </div>
          <h3>En attente</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2196f3' }}>{stats.enAttente}</p>
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
      </div>

      {/* Barre de filtres */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '15px' }}>
          <div className="flex gap-10">
            <button 
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 15px' }}
            >
              <FontAwesomeIcon icon={faFilter} style={{ marginRight: '5px' }} />
              Toutes
            </button>
            <button 
              onClick={() => setFilter('en_cours')}
              className={filter === 'en_cours' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 15px' }}
            >
              <FontAwesomeIcon icon={faPlayCircle} style={{ marginRight: '5px' }} />
              En cours
            </button>
            <button 
              onClick={() => setFilter('en_attente')}
              className={filter === 'en_attente' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 15px' }}
            >
              <FontAwesomeIcon icon={faHourglassHalf} style={{ marginRight: '5px' }} />
              En attente
            </button>
            <button 
              onClick={() => setFilter('terminee')}
              className={filter === 'terminee' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 15px' }}
            >
              <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px' }} />
              Terminées
            </button>
          </div>
          <div style={{ width: '250px' }}>
            <div className="flex" style={{ alignItems: 'center', gap: '10px' }}>
              <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--text-light)' }} />
              <input 
                type="text" 
                placeholder="Rechercher par véhicule..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 0 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des interventions filtrées */}
      {filteredInterventions.length === 0 ? (
        <div className="card text-center">
          <FontAwesomeIcon icon={faChartLine} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
          <p>Aucune intervention trouvée</p>
        </div>
      ) : (
        <div className="mt-20">
          {filteredInterventions.map(i => (
            <div 
              key={i.id} 
              className="card mb-20" 
              style={{ 
                borderLeft: `4px solid ${getStatusColor(i.statut)}`
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

export default SuiviIntervention;