// frontend/src/pages/admin/AdminDepannage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, 
  faArrowLeft, 
  faSpinner, 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faRoute,
  faCrosshairs,
  faRefresh,
  faBell,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from '../../components/Sidebar';
import { getDemandesDepannage, accepterDemande, refuserDemande } from '../../services/depannageApi';
import { calculateDistance } from '../../services/geolocation';

// ==================== CONFIGURATION LEAFLET ====================

// Configuration des icônes Leaflet
const configureLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

// Icônes personnalisées
const clientIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const garageIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const depanneuseIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const TILE_LAYER = {
  url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  maxZoom: 19,
  minZoom: 5
};

// Position du garage (à adapter selon votre adresse)
const GARAGE_POSITION = { lat: 48.8566, lng: 2.3522 }; // Paris

// ==================== COMPOSANTS ====================

// Composant de carte pour le suivi
const DepannageMap = ({ demande, onPositionUpdate }) => {
  const mapRef = useRef(null);
  const [depanneusePos, setDepanneusePos] = useState(GARAGE_POSITION);
  const [pathLayer, setPathLayer] = useState(null);
  const [distance, setDistance] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(demande);
  const depanneuseMarkerRef = useRef(null);
  const intervalRef = useRef(null);

  // Calcul du chemin approximatif
  const calculerCheminApproximatif = (start, end) => {
    const points = [];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push([
        start.lat + (end.lat - start.lat) * t,
        start.lng + (end.lng - start.lng) * t
      ]);
    }
    return points;
  };

  // Affichage du chemin
  const afficherChemin = (start, end) => {
    if (!mapRef.current) return;
    
    const dist = calculateDistance(start.lat, start.lng, end.lat, end.lng);
    setDistance(dist);
    
    if (pathLayer) {
      mapRef.current.removeLayer(pathLayer);
    }
    
    const cheminPoints = calculerCheminApproximatif(start, end);
    const newPath = L.polyline(cheminPoints, {
      color: '#e94560',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10'
    }).addTo(mapRef.current);
    
    setPathLayer(newPath);
    
    const bounds = newPath.getBounds();
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds);
    }
  };

  // Initialisation de la carte
  useEffect(() => {
    if (!mapRef.current && selectedDemande) {
      configureLeafletIcons();
      
      mapRef.current = L.map('admin-depannage-map').setView(
        [selectedDemande.lat, selectedDemande.lng], 13
      );
      
      L.tileLayer(TILE_LAYER.url, {
        attribution: TILE_LAYER.attribution,
        subdomains: TILE_LAYER.subdomains,
        maxZoom: TILE_LAYER.maxZoom,
        minZoom: TILE_LAYER.minZoom
      }).addTo(mapRef.current);
      
      // Marqueur garage
      L.marker([GARAGE_POSITION.lat, GARAGE_POSITION.lng], { icon: garageIcon })
        .addTo(mapRef.current)
        .bindPopup('<b>🏠 Garage Pro</b><br/>Point de départ');
      
      // Marqueur client
      L.marker([selectedDemande.lat, selectedDemande.lng], { icon: clientIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <b>👤 Client: ${selectedDemande.client_prenom} ${selectedDemande.client_nom}</b><br/>
          📞 ${selectedDemande.client_telephone || 'Pas de téléphone'}<br/>
          🆔 Demande #${selectedDemande.id}<br/>
          📅 ${new Date(selectedDemande.date_demande).toLocaleString()}
        `)
        .openPopup();
    }
  }, [selectedDemande]);

  // Mise à jour de la carte quand la demande change
  useEffect(() => {
    if (selectedDemande && mapRef.current) {
      setDepanneusePos(GARAGE_POSITION);
      if (pathLayer) {
        mapRef.current.removeLayer(pathLayer);
        setPathLayer(null);
      }
      afficherChemin(GARAGE_POSITION, { lat: selectedDemande.lat, lng: selectedDemande.lng });
    }
  }, [selectedDemande]);

  // Démarrer la simulation
  const demarrerSimulation = () => {
    if (simulationActive) return;
    
    let currentPos = { ...GARAGE_POSITION };
    setDepanneusePos(currentPos);
    setSimulationActive(true);
    
    // Créer ou mettre à jour le marqueur
    if (depanneuseMarkerRef.current) {
      mapRef.current.removeLayer(depanneuseMarkerRef.current);
    }
    
    depanneuseMarkerRef.current = L.marker([currentPos.lat, currentPos.lng], { icon: depanneuseIcon })
      .addTo(mapRef.current)
      .bindPopup('🚛 Dépanneuse en route');
    
    afficherChemin(currentPos, { lat: selectedDemande.lat, lng: selectedDemande.lng });
    
    // Simulation du déplacement
    intervalRef.current = setInterval(() => {
      if (!currentPos) return;
      
      const newLat = currentPos.lat + (selectedDemande.lat - currentPos.lat) * 0.1;
      const newLng = currentPos.lng + (selectedDemande.lng - currentPos.lng) * 0.1;
      
      currentPos = { lat: newLat, lng: newLng };
      depanneuseMarkerRef.current.setLatLng([currentPos.lat, currentPos.lng]);
      setDepanneusePos(currentPos);
      
      afficherChemin(currentPos, { lat: selectedDemande.lat, lng: selectedDemande.lng });
      
      if (onPositionUpdate) {
        onPositionUpdate(currentPos);
      }
      
      const distRestante = calculateDistance(currentPos.lat, currentPos.lng, selectedDemande.lat, selectedDemande.lng);
      if (distRestante < 0.1) {
        clearInterval(intervalRef.current);
        setSimulationActive(false);
        depanneuseMarkerRef.current.bindPopup('🚛 Dépanneuse arrivée !').openPopup();
        alert('✅ La dépanneuse est arrivée chez le client !');
      }
    }, 2000);
  };

  // Arrêter la simulation
  const arreterSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setSimulationActive(false);
    }
  };

  const eta = distance ? Math.round(distance / 30 * 60) : 0;

  if (!selectedDemande) return null;

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '15px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={demarrerSimulation}
          disabled={simulationActive}
          style={{ backgroundColor: '#4caf50' }}
        >
          <FontAwesomeIcon icon={faTruck} style={{ marginRight: '5px' }} />
          {simulationActive ? 'Dépanneuse en route...' : 'Démarrer suivi'}
        </button>
        <button 
          onClick={arreterSimulation}
          disabled={!simulationActive}
          style={{ backgroundColor: '#f44336' }}
        >
          <FontAwesomeIcon icon={faTimesCircle} style={{ marginRight: '5px' }} />
          Arrêter
        </button>
        <button 
          onClick={() => afficherChemin(depanneusePos, { lat: selectedDemande.lat, lng: selectedDemande.lng })}
          style={{ backgroundColor: '#2196f3' }}
        >
          <FontAwesomeIcon icon={faRoute} style={{ marginRight: '5px' }} />
          Recalculer le trajet
        </button>
      </div>
      
      <div 
        id="admin-depannage-map" 
        style={{ 
          height: '450px', 
          width: '100%', 
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          backgroundColor: '#1a1a2e'
        }} 
      />
      
      {distance && (
        <div style={{ 
          marginTop: '15px', 
          padding: '15px',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <strong>📍 Distance:</strong> 
              <span style={{ color: '#e94560', marginLeft: '8px' }}>
                {distance.toFixed(2)} km
              </span>
            </div>
            <div>
              <strong>⏱️ ETA estimé:</strong>
              <span style={{ color: '#4caf50', marginLeft: '8px' }}>
                {eta} minutes
              </span>
            </div>
            <div>
              <strong>🚛 Position dépanneuse:</strong>
              <span style={{ color: '#ff9800', marginLeft: '8px', fontSize: '12px' }}>
                {depanneusePos.lat.toFixed(4)}, {depanneusePos.lng.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant de carte miniature pour la liste
const MiniMap = ({ demande }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current && demande) {
      configureLeafletIcons();
      
      mapRef.current = L.map(`mini-map-${demande.id}`).setView([demande.lat, demande.lng], 12);
      
      L.tileLayer(TILE_LAYER.url, {
        attribution: TILE_LAYER.attribution,
        subdomains: TILE_LAYER.subdomains,
        maxZoom: TILE_LAYER.maxZoom,
        minZoom: TILE_LAYER.minZoom
      }).addTo(mapRef.current);
      
      L.marker([demande.lat, demande.lng], { icon: clientIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b>${demande.client_prenom} ${demande.client_nom}</b>`);
    }
  }, [demande]);

  return (
    <div 
      id={`mini-map-${demande.id}`} 
      style={{ 
        height: '80px', 
        width: '120px', 
        borderRadius: '5px',
        overflow: 'hidden'
      }} 
    />
  );
};

// ==================== COMPOSANT PRINCIPAL ====================

function AdminDepannage() {
  const [demandes, setDemandes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Récupérer les demandes
  const fetchDemandes = async () => {
    try {
      const data = await getDemandesDepannage();
      setDemandes(data);
      setError('');
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
    
    // Auto-refresh toutes les 10 secondes
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDemandes, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Filtrer les demandes
  const filteredDemandes = demandes.filter(d => {
    if (filter === 'all') return true;
    return d.statut === filter;
  });

  // Accepter une demande
  const handleAccepter = async (demande) => {
    try {
      await accepterDemande(demande.id);
      await fetchDemandes();
      setSelectedDemande(demande);
    } catch (err) {
      alert('Erreur lors de l\'acceptation');
    }
  };

  // Refuser une demande
  const handleRefuser = async (demandeId) => {
    if (window.confirm('Confirmez-vous le refus de cette demande ?')) {
      try {
        await refuserDemande(demandeId);
        await fetchDemandes();
        if (selectedDemande?.id === demandeId) {
          setSelectedDemande(null);
        }
      } catch (err) {
        alert('Erreur lors du refus');
      }
    }
  };

  // Statistiques
  const stats = {
    en_attente: demandes.filter(d => d.statut === 'en_attente').length,
    acceptee: demandes.filter(d => d.statut === 'acceptee').length,
    terminee: demandes.filter(d => d.statut === 'terminee').length,
    refusee: demandes.filter(d => d.statut === 'refusee').length
  };

  // Obtenir la couleur du statut
  const getStatusColor = (statut) => {
    switch(statut) {
      case 'en_attente': return { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', text: 'En attente' };
      case 'acceptee': return { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', text: 'Acceptée' };
      case 'terminee': return { bg: 'rgba(33, 150, 243, 0.1)', color: '#2196f3', text: 'Terminée' };
      case 'refusee': return { bg: 'rgba(244, 67, 54, 0.1)', color: '#f44336', text: 'Refusée' };
      default: return { bg: 'rgba(158, 158, 158, 0.1)', color: '#9e9e9e', text: statut };
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="admin-content">
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#e94560" />
            <h3>Chargement des demandes...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-content">
        {/* En-tête */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h1>
                <FontAwesomeIcon icon={faTruck} style={{ marginRight: '10px' }} />
                Dépannage - Gestion des demandes
              </h1>
              <p className="text-light">Gérez les demandes de dépannage d'urgence</p>
            </div>
            <div>
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                style={{ 
                  backgroundColor: autoRefresh ? '#4caf50' : 'transparent',
                  border: '1px solid var(--border-color)'
                }}
              >
                <FontAwesomeIcon icon={faRefresh} style={{ marginRight: '5px' }} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Cartes statistiques */}
          <div className="grid-4" style={{ marginTop: '20px' }}>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: '#ff9800' }}>{stats.en_attente}</div>
              <div className="stat-card-label">En attente</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: '#4caf50' }}>{stats.acceptee}</div>
              <div className="stat-card-label">Acceptées</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: '#2196f3' }}>{stats.terminee}</div>
              <div className="stat-card-label">Terminées</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: '#f44336' }}>{stats.refusee}</div>
              <div className="stat-card-label">Refusées</div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 20px' }}
            >
              Toutes
            </button>
            <button 
              onClick={() => setFilter('en_attente')}
              className={filter === 'en_attente' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 20px', backgroundColor: filter === 'en_attente' ? '#ff9800' : undefined }}
            >
              En attente
            </button>
            <button 
              onClick={() => setFilter('acceptee')}
              className={filter === 'acceptee' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 20px', backgroundColor: filter === 'acceptee' ? '#4caf50' : undefined }}
            >
              Acceptées
            </button>
            <button 
              onClick={() => setFilter('terminee')}
              className={filter === 'terminee' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 20px', backgroundColor: filter === 'terminee' ? '#2196f3' : undefined }}
            >
              Terminées
            </button>
          </div>
        </div>

        {error && (
          <div className="card" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', borderColor: '#f44336', marginBottom: '20px' }}>
            <p className="text-danger">{error}</p>
          </div>
        )}

        <div className="grid-2" style={{ gap: '30px' }}>
          {/* Liste des demandes */}
          <div>
            <h2>
              <FontAwesomeIcon icon={faBell} style={{ marginRight: '10px' }} />
              Demandes ({filteredDemandes.length})
            </h2>
            
            {filteredDemandes.length === 0 ? (
              <div className="card text-center">
                <p>Aucune demande trouvée</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {filteredDemandes.map(demande => {
                  const status = getStatusColor(demande.statut);
                  return (
                    <div 
                      key={demande.id} 
                      className="card"
                      style={{ 
                        cursor: 'pointer',
                        border: selectedDemande?.id === demande.id ? '2px solid #e94560' : undefined,
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setSelectedDemande(demande)}
                    >
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <MiniMap demande={demande} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                            <h3 style={{ marginBottom: '5px' }}>
                              {demande.client_prenom} {demande.client_nom}
                            </h3>
                            <span style={{ 
                              backgroundColor: status.bg, 
                              color: status.color,
                              padding: '2px 8px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}>
                              {status.text}
                            </span>
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '5px' }}>
                            <FontAwesomeIcon icon={faPhone} style={{ marginRight: '5px' }} />
                            {demande.client_telephone || 'Pas de téléphone'}
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                            <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                            {new Date(demande.date_demande).toLocaleString()}
                          </p>
                          <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                            📍 {demande.lat.toFixed(4)}, {demande.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      
                      {demande.statut === 'en_attente' && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleAccepter(demande); }}
                            style={{ backgroundColor: '#4caf50', padding: '5px 15px' }}
                          >
                            <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px' }} />
                            Accepter
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRefuser(demande.id); }}
                            style={{ backgroundColor: '#f44336', padding: '5px 15px' }}
                          >
                            <FontAwesomeIcon icon={faTimesCircle} style={{ marginRight: '5px' }} />
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Carte de suivi */}
          <div>
            <h2>
              <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '10px' }} />
              Suivi du dépannage
            </h2>
            
            {selectedDemande ? (
              <div className="card">
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <div>
                    <h3 style={{ marginBottom: '5px' }}>
                      {selectedDemande.client_prenom} {selectedDemande.client_nom}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                      <FontAwesomeIcon icon={faPhone} style={{ marginRight: '5px' }} />
                      {selectedDemande.client_telephone || 'Pas de téléphone'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedDemande(null)}
                    className="btn-outline"
                    style={{ padding: '5px 10px' }}
                  >
                    <FontAwesomeIcon icon={faEyeSlash} style={{ marginRight: '5px' }} />
                    Masquer
                  </button>
                </div>
                
                <DepannageMap demande={selectedDemande} />
              </div>
            ) : (
              <div className="card text-center" style={{ padding: '60px 20px' }}>
                <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" style={{ color: 'var(--text-light)', marginBottom: '15px' }} />
                <p>Sélectionnez une demande pour suivre le dépannage</p>
                <p className="text-light" style={{ fontSize: '13px' }}>
                  Cliquez sur une demande dans la liste pour afficher la carte et suivre la dépanneuse
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDepannage;