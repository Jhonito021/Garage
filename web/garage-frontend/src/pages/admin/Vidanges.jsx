import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faOilCan, 
  faCog, 
  faCalendarAlt, 
  faCar, 
  faTachometerAlt,
  faSearch,
  faSyncAlt,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faUsers,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Vidanges() {
  const [echeances, setEcheances] = useState([]);
  const [filteredEcheances, setFilteredEcheances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [config, setConfig] = useState({
    intervalle_vidange_defaut: '8000',
    seuil_relance_vidange: '2000'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEcheances = async () => {
    try {
      const res = await api.get('/statistiques/echeances-vidange');
      console.log('Échéances reçues:', res.data);
      setEcheances(res.data);
      setFilteredEcheances(res.data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des échéances');
    }
  };

  const fetchConfig = async () => {
    try {
      const [intervalle, seuil] = await Promise.all([
        api.get('/configurations/intervalle_vidange_defaut'),
        api.get('/configurations/seuil_relance_vidange')
      ]);
      setConfig({
        intervalle_vidange_defaut: intervalle.data?.valeur || '8000',
        seuil_relance_vidange: seuil.data?.valeur || '2000'
      });
    } catch (err) {
      console.error('Erreur config:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEcheances(), fetchConfig()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = echeances.filter(e => 
        e.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.immatriculation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.marque?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEcheances(filtered);
    } else {
      setFilteredEcheances(echeances);
    }
  }, [searchTerm, echeances]);

  const handleConfigChange = async (key, value) => {
    try {
      await api.put('/configurations', { cle: key, valeur: value });
      setConfig(prev => ({ ...prev, [key]: value }));
      setSuccess('Configuration mise à jour');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRefresh = () => {
    fetchEcheances();
    fetchConfig();
  };

  const getStatutVidange = (kmParcourus, intervalle) => {
    const pourcentage = (kmParcourus / intervalle) * 100;
    if (pourcentage >= 100) {
      return { text: 'Vidange due', color: 'danger', icon: faExclamationTriangle };
    } else if (pourcentage >= 80) {
      return { text: 'Urgent', color: 'warning', icon: faExclamationTriangle };
    } else if (pourcentage >= 50) {
      return { text: 'À prévoir', color: 'info', icon: faClock };
    } else {
      return { text: 'OK', color: 'success', icon: faCheckCircle };
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="admin-content">
          <div className="loading">Chargement...</div>
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
            <FontAwesomeIcon icon={faOilCan} style={{ marginRight: '10px' }} />
            Suivi des vidanges
          </h1>
          <button onClick={handleRefresh} className="btn-outline">
            <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: '5px' }} />
            Actualiser
          </button>
        </div>

        {error && <p className="text-danger text-center">{error}</p>}
        {success && <p className="text-success text-center">{success}</p>}

        <div className="grid-2" style={{ marginTop: '30px' }}>
          {/* Configuration */}
          <div className="card">
            <h2>
              <FontAwesomeIcon icon={faCog} style={{ marginRight: '10px' }} />
              Configuration
            </h2>
            <div className="form-group">
              <label>Intervalle vidange (km)</label>
              <input
                type="number"
                value={config.intervalle_vidange_defaut}
                onChange={(e) => handleConfigChange('intervalle_vidange_defaut', e.target.value)}
              />
              <small className="text-light">Nombre de kilomètres entre deux vidanges</small>
            </div>
            <div className="form-group">
              <label>Seuil de relance (km avant échéance)</label>
              <input
                type="number"
                value={config.seuil_relance_vidange}
                onChange={(e) => handleConfigChange('seuil_relance_vidange', e.target.value)}
              />
              <small className="text-light">Déclencher l'alerte X km avant la vidange</small>
            </div>
          </div>

          {/* Résumé */}
          <div className="card">
            <h2>
              <FontAwesomeIcon icon={faUsers} style={{ marginRight: '10px' }} />
              Résumé
            </h2>
            <div className="stats-summary">
              <div className="summary-item">
                <div className="summary-value">{echeances.length}</div>
                <div className="summary-label">Clients suivis</div>
              </div>
              <div className="summary-item">
                <div className="summary-value" style={{ color: 'var(--danger)' }}>
                  {echeances.filter(e => e.km_parcourus >= config.intervalle_vidange_defaut).length}
                </div>
                <div className="summary-label">Vidanges dues</div>
              </div>
              <div className="summary-item">
                <div className="summary-value" style={{ color: 'var(--warning)' }}>
                  {echeances.filter(e => e.km_parcourus >= config.intervalle_vidange_defaut - config.seuil_relance_vidange && e.km_parcourus < config.intervalle_vidange_defaut).length}
                </div>
                <div className="summary-label">Vidanges proches</div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="card mt-20">
          <div className="flex" style={{ alignItems: 'center', gap: '10px' }}>
            <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Rechercher par client, véhicule ou immatriculation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>

        {/* Liste des échéances */}
        <div className="mt-30">
          <h2>Clients à échéance</h2>
          {filteredEcheances.length === 0 ? (
            <div className="card text-center mt-20">
              <FontAwesomeIcon icon={faOilCan} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
              <p>Aucune échéance de vidange</p>
              <p className="text-light">Ajoutez des vidanges pour voir les clients à échéance</p>
            </div>
          ) : (
            filteredEcheances.map(c => {
              const statut = getStatutVidange(c.km_parcourus, config.intervalle_vidange_defaut);
              return (
                <div key={c.vehicule_id} className="card mb-20">
                  <div className="flex-between" style={{ flexWrap: 'wrap' }}>
                    <div>
                      <h3>
                        <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                        {c.prenom} {c.nom}
                      </h3>
                      <p>
                        <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                        {c.marque} {c.modele} - {c.immatriculation}
                      </p>
                      <p>
                        <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '8px' }} />
                        Kilométrage actuel: {c.kilometrage_actuel?.toLocaleString()} km
                      </p>
                      <p>
                        <FontAwesomeIcon icon={faOilCan} style={{ marginRight: '8px' }} />
                        Dernière vidange: {c.dernier_km?.toLocaleString()} km
                      </p>
                      <p>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                        Km parcourus depuis vidange: <strong>{c.km_parcourus?.toLocaleString()} km</strong>
                      </p>
                      <div className="mt-10">
                        <span className={`badge badge-${statut.color}`}>
                          <FontAwesomeIcon icon={statut.icon} style={{ marginRight: '5px' }} />
                          {statut.text}
                        </span>
                      </div>
                    </div>
                    <div className="progress-container" style={{ minWidth: '250px', marginTop: '15px' }}>
                      <div className="progress-label">Progression vers prochaine vidange</div>
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill progress-fill-${statut.color}`}
                          style={{ width: `${Math.min(100, (c.km_parcourus / config.intervalle_vidange_defaut) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="progress-values">
                        <span>0 km</span>
                        <span>{Math.round(c.km_parcourus / config.intervalle_vidange_defaut * 100)}%</span>
                        <span>{config.intervalle_vidange_defaut} km</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Vidanges;