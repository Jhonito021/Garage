// frontend/src/pages/depanneur/DepanneurMissions.jsx
// Version où le dépanneur ne peut PAS accepter lui-même
// Il voit uniquement les missions qui lui ont été assignées par l'admin

import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, 
  faSpinner, 
  faMapMarkerAlt, 
  faPhone, 
  faCheckCircle,
  faClock,
  faLocationDot,
  faUser,
  faCalendarAlt,
  faStop
} from '@fortawesome/free-solid-svg-icons';
import DepanneurSidebar from '../../components/DepanneurSidebar';
import { getTechnicienDemandes, terminerMission } from '../../services/depannageApi';

function DepanneurMissions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Récupérer les missions assignées au dépanneur
  const fetchMissions = useCallback(async () => {
    try {
      const data = await getTechnicienDemandes();
      setMissions(data);
      setError('');
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des missions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
    const interval = setInterval(fetchMissions, 10000);
    return () => clearInterval(interval);
  }, [fetchMissions]);

  // Terminer une mission (seule action possible pour le dépanneur)
  const handleTerminer = async (missionId) => {
    if (window.confirm('Confirmez-vous la fin de cette mission ?')) {
      setActionLoading(missionId);
      try {
        await terminerMission(missionId);
        await fetchMissions();
        alert('Mission terminée !');
      } catch (err) {
        alert(err.response?.data?.error || 'Erreur lors de la fin de mission');
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Missions en cours (acceptées par l'admin)
  const missionsEnCours = missions.filter(m => m.statut === 'acceptee');
  const missionsTerminees = missions.filter(m => m.statut === 'terminee');

  if (loading) {
    return (
      <div className="admin-container">
        <DepanneurSidebar />
        <div className="admin-content">
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#4caf50" />
            <h3>Chargement des missions...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <DepanneurSidebar />
      <div className="admin-content">
        <h1 style={{ marginBottom: '20px' }}>
          <FontAwesomeIcon icon={faTruck} style={{ marginRight: '10px', color: '#4caf50' }} />
          Mes missions
        </h1>

        {error && (
          <div className="card" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', marginBottom: '20px' }}>
            <p className="text-danger">{error}</p>
          </div>
        )}

        {/* Missions en cours (assignées par l'admin) */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4caf50' }}>
            <FontAwesomeIcon icon={faTruck} style={{ marginRight: '10px' }} />
            Missions en cours ({missionsEnCours.length})
          </h2>
          
          {missionsEnCours.length === 0 ? (
            <p className="text-light text-center" style={{ padding: '20px' }}>
              Aucune mission assignée pour le moment
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {missionsEnCours.map(mission => (
                <div key={mission.id} className="card" style={{ backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: '10px' }}>
                        <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                        {mission.client_prenom} {mission.client_nom}
                      </h3>
                      <p style={{ fontSize: '13px', marginBottom: '5px' }}>
                        <FontAwesomeIcon icon={faPhone} style={{ marginRight: '8px' }} />
                        {mission.client_telephone || 'Pas de téléphone'}
                      </p>
                      <p style={{ fontSize: '13px', marginBottom: '5px' }}>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                        Demandé le: {new Date(mission.date_demande).toLocaleString()}
                      </p>
                      <p style={{ fontSize: '13px', marginBottom: '5px' }}>
                        <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: '8px' }} />
                        Position: {parseFloat(mission.lat).toFixed(4)}, {parseFloat(mission.lng).toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleTerminer(mission.id)}
                        disabled={actionLoading === mission.id}
                        style={{ backgroundColor: '#2196f3', padding: '10px 20px' }}
                      >
                        {actionLoading === mission.id ? (
                          <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                          <FontAwesomeIcon icon={faStop} style={{ marginRight: '5px' }} />
                        )}
                        Terminer la mission
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Missions terminées */}
        {missionsTerminees.length > 0 && (
          <div className="card">
            <h2 style={{ color: '#2196f3' }}>
              <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '10px' }} />
              Missions terminées ({missionsTerminees.length})
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {missionsTerminees.slice(0, 5).map(mission => (
                <div key={mission.id} style={{ 
                  padding: '10px', 
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <strong>{mission.client_prenom} {mission.client_nom}</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      {new Date(mission.date_arrivee || mission.date_traitement).toLocaleString()}
                    </p>
                  </div>
                  <span className="badge badge-info">Terminée</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepanneurMissions;