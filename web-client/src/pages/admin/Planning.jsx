import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faCar, 
  faUser, 
  faFilter, 
  faWrench, 
  faClock, 
  faCheck, 
  faTimes, 
  faSpinner, 
  faPlusCircle,
  faUserCheck,
  faUserSlash,
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Planning() {
  const [rdvs, setRdvs] = useState([]);
  const [filteredRdvs, setFilteredRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [creating, setCreating] = useState(false);
  const [techniciens, setTechniciens] = useState([]);
  const [assignedRdvs, setAssignedRdvs] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Filtrer les rendez-vous par période
  const filterByPeriod = (data, period) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = selectedDate;
    
    if (period === 'today') {
      return data.filter(r => {
        const rdvDate = new Date(r.date_heure);
        const rdvDateStr = rdvDate.toISOString().split('T')[0];
        return rdvDateStr === todayStr;
      });
    }
    
    if (period === 'last7') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      return data.filter(r => {
        const date = new Date(r.date_heure);
        return date >= sevenDaysAgo && date <= today;
      });
    }
    
    if (period === 'last30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return data.filter(r => {
        const date = new Date(r.date_heure);
        return date >= thirtyDaysAgo && date <= today;
      });
    }
    
    return data;
  };

  // Récupérer les rendez-vous
  const fetchRdvs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rdv');
      console.log('RDV reçus:', res.data);
      const sortedRdvs = res.data.sort((a, b) => new Date(b.date_heure) - new Date(a.date_heure));
      setRdvs(sortedRdvs);
      const filtered = filterByPeriod(sortedRdvs, filterPeriod);
      setFilteredRdvs(filtered);
    } catch (err) {
      console.error('Erreur chargement rendez-vous:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Récupérer les techniciens
  const fetchTechniciens = async () => {
    try {
      const res = await api.get('/utilisateurs?role=technicien');
      setTechniciens(res.data);
    } catch (err) {
      console.error('Erreur chargement techniciens:', err);
    }
  };

  // Récupérer les interventions pour voir quels RDV sont déjà assignés
  const fetchAssignedRdvs = async () => {
    try {
      const res = await api.get('/interventions/all');
      const assigned = {};
      res.data.forEach(interv => {
        if (interv.rdv_id) {
          assigned[interv.rdv_id] = {
            assigned: true,
            technicien_id: interv.technicien_id,
            technicien_nom: interv.technicien_prenom + ' ' + interv.technicien_nom
          };
        }
      });
      setAssignedRdvs(assigned);
    } catch (err) {
      console.error('Erreur chargement interventions:', err);
    }
  };

  // Vérifier la disponibilité d'un technicien
  const checkDisponibilite = async (technicienId, dateHeure) => {
    try {
      const response = await api.get(`/interventions/check-disponibilite?technicien_id=${technicienId}&date_heure=${encodeURIComponent(dateHeure)}`);
      return response.data.disponible;
    } catch (err) {
      console.error('Erreur vérification disponibilité:', err);
      return false;
    }
  };

  // Créer une intervention à partir du rendez-vous avec vérification de disponibilité
  const createIntervention = async (rdvId, technicienId, dateHeure) => {
    if (!technicienId) {
      alert('Veuillez sélectionner un technicien');
      return;
    }
    
    setCreating(true);
    try {
      // Vérifier d'abord la disponibilité du technicien
      const disponible = await checkDisponibilite(technicienId, dateHeure);
      
      if (!disponible) {
        alert('Ce technicien est déjà assigné à une autre intervention sur ce créneau');
        setCreating(false);
        return;
      }
      
      const response = await api.post('/interventions', {
        rdv_id: rdvId,
        technicien_id: parseInt(technicienId)
      });
      
      console.log('Réponse:', response.data);
      alert('Intervention créée avec succès');
      
      // Mettre à jour la liste des RDV assignés
      await fetchAssignedRdvs();
      
    } catch (err) {
      console.error('Erreur:', err);
      let errorMessage = 'Erreur lors de la création';
      
      if (err.response?.status === 409) {
        errorMessage = err.response.data.error || 'Ce technicien est déjà occupé sur ce créneau';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  // Rafraîchir toutes les données
  const handleRefresh = () => {
    setRefreshing(true);
    fetchRdvs();
    fetchTechniciens();
    fetchAssignedRdvs();
  };

  useEffect(() => {
    fetchRdvs();
    fetchTechniciens();
    fetchAssignedRdvs();
  }, []);

  useEffect(() => {
    const filtered = filterByPeriod(rdvs, filterPeriod);
    setFilteredRdvs(filtered);
  }, [filterPeriod, selectedDate, rdvs]);

  const handlePeriodChange = (period) => {
    setFilterPeriod(period);
  };

  const getPeriodLabel = () => {
    switch(filterPeriod) {
      case 'today': return "Aujourd'hui";
      case 'last7': return "7 derniers jours";
      case 'last30': return "30 derniers jours";
      case 'all': return "Tous les rendez-vous";
      default: return "Tous les rendez-vous";
    }
  };

  const getStatusBadge = (statut) => {
    switch(statut) {
      case 'terminé':
        return <span className="badge badge-success"><FontAwesomeIcon icon={faCheck} style={{ marginRight: '5px' }} />Terminé</span>;
      case 'confirmé':
        return <span className="badge badge-warning"><FontAwesomeIcon icon={faSpinner} style={{ marginRight: '5px' }} />Confirmé</span>;
      case 'annulé':
        return <span className="badge badge-danger"><FontAwesomeIcon icon={faTimes} style={{ marginRight: '5px' }} />Annulé</span>;
      default:
        return <span className="badge badge-info">{statut}</span>;
    }
  };

  // Vérifier si un RDV peut être assigné (uniquement confirmé et non déjà assigné)
  const canAssign = (rdv) => {
    return rdv.statut === 'confirmé' && !assignedRdvs[rdv.id];
  };

  // Vérifier si un RDV est déjà assigné
  const isAssigned = (rdv) => {
    return assignedRdvs[rdv.id]?.assigned;
  };

  // Obtenir le nom du technicien assigné
  const getAssignedTechnicienName = (rdv) => {
    return assignedRdvs[rdv.id]?.technicien_nom || '';
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="admin-content">
          <div className="loading">Chargement des rendez-vous...</div>
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
            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
            Planning - Rendez-vous clients
          </h1>
          <div className="flex gap-10">
            <button onClick={handleRefresh} disabled={refreshing} style={{ padding: '8px 15px' }}>
              <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: '5px' }} />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </button>
            <button 
              onClick={() => handlePeriodChange('all')}
              className={filterPeriod === 'all' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 15px' }}
            >
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px' }} />
              Tous
            </button>
            <button 
              onClick={() => handlePeriodChange('today')}
              className={filterPeriod === 'today' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 15px' }}
            >
              <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
              Aujourd'hui
            </button>
            <button 
              onClick={() => handlePeriodChange('last7')}
              className={filterPeriod === 'last7' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 15px' }}
            >
              7 jours
            </button>
            <button 
              onClick={() => handlePeriodChange('last30')}
              className={filterPeriod === 'last30' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 15px' }}
            >
              30 jours
            </button>
          </div>
        </div>

        {filterPeriod === 'today' && (
          <div className="card mt-20">
            <div className="flex-between">
              <label style={{ marginBottom: 0 }}>Sélectionner une date :</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: 'auto', marginBottom: 0 }}
              />
            </div>
          </div>
        )}

        <div className="card mt-20" style={{ backgroundColor: 'var(--accent-color)' }}>
          <div className="flex-between">
            <div>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
              <strong>Période : {getPeriodLabel()}</strong>
            </div>
            <div>
              <strong>{filteredRdvs.length}</strong> rendez-vous
            </div>
          </div>
        </div>

        {filteredRdvs.length === 0 ? (
          <div className="card text-center mt-30">
            <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
            <p>Aucun rendez-vous trouvé pour cette période</p>
          </div>
        ) : (
          <div className="mt-30">
            {filteredRdvs.map(r => (
              <div key={r.id} className="card mb-20">
                <div className="flex-between">
                  <div style={{ flex: 1 }}>
                    <h3>
                      <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                      {r.service_demande}
                    </h3>
                    <p>
                      <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                      {r.marque} {r.modele} - {r.immatriculation}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                      Client: {r.client_nom || r.nom} {r.client_prenom || r.prenom}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                      {new Date(r.date_heure).toLocaleString('fr-FR')}
                    </p>
                    <p>
                      Statut: {getStatusBadge(r.statut)}
                    </p>
                    
                    {/* Afficher le technicien assigné si déjà fait */}
                    {isAssigned(r) && (
                      <p style={{ marginTop: '10px', color: 'var(--success)' }}>
                        <FontAwesomeIcon icon={faUserCheck} style={{ marginRight: '8px' }} />
                        Technicien assigné: {getAssignedTechnicienName(r)}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ minWidth: '220px', textAlign: 'right' }}>
                    {r.statut === 'annulé' ? (
                      <div style={{ padding: '10px', backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: '8px' }}>
                        <FontAwesomeIcon icon={faUserSlash} style={{ marginRight: '8px', color: 'var(--danger)' }} />
                        <span style={{ color: 'var(--danger)' }}>Rendez-vous annulé</span>
                        <br />
                        <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Impossible d'assigner un technicien</span>
                      </div>
                    ) : isAssigned(r) ? (
                      <div style={{ padding: '10px', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px' }}>
                        <FontAwesomeIcon icon={faUserCheck} style={{ marginRight: '8px', color: 'var(--success)' }} />
                        <span style={{ color: 'var(--success)' }}>Intervention créée</span>
                        <br />
                        <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                          Technicien: {getAssignedTechnicienName(r)}
                        </span>
                      </div>
                    ) : (
                      <>
                        <select 
                          id={`technicien-${r.id}`}
                          className="form-control"
                          style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
                          defaultValue=""
                        >
                          <option value="">Choisir un technicien</option>
                          {techniciens.map(t => (
                            <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
                          ))}
                        </select>
                        <button 
                          className="btn-success"
                          onClick={() => {
                            const select = document.getElementById(`technicien-${r.id}`);
                            const technicienId = select.value;
                            createIntervention(r.id, technicienId, r.date_heure);
                          }}
                          disabled={creating}
                          style={{ width: '100%' }}
                        >
                          <FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: '5px' }} />
                          Assigner et créer intervention
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Planning;