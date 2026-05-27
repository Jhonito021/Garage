// frontend/src/pages/admin/AdminDepannage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, 
  faSpinner, 
  faMapMarkerAlt, 
  faPhone, 
  faCheckCircle,
  faTimesCircle,
  faClock,
  faRoute,
  faRefresh,
  faBell,
  faEyeSlash,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';
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

const TILE_LAYER = {
  url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  maxZoom: 19,
  minZoom: 5
};

const GARAGE_POSITION = { lat: -18.912086, lng: 47.493216 };

// ==================== COMPOSANT CARTE ====================

const DepannageMap = ({ demande }) => {
  const mapRef = useRef(null);
  const [distance, setDistance] = useState(null);

  // Convertir les coordonnées en nombres
  const clientLat = parseFloat(demande.lat);
  const clientLng = parseFloat(demande.lng);

  useEffect(() => {
    if (!mapRef.current && demande && !isNaN(clientLat) && !isNaN(clientLng)) {
      configureLeafletIcons();
      
      mapRef.current = L.map('admin-depannage-map').setView([clientLat, clientLng], 13);
      
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
      L.marker([clientLat, clientLng], { icon: clientIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <b>👤 Client: ${demande.client_prenom} ${demande.client_nom}</b><br/>
          📞 ${demande.client_telephone || 'Pas de téléphone'}<br/>
          🆔 Demande #${demande.id}
        `)
        .openPopup();
      
      // Calculer et afficher le chemin
      const dist = calculateDistance(GARAGE_POSITION.lat, GARAGE_POSITION.lng, clientLat, clientLng);
      setDistance(dist);
      
      const points = [
        [GARAGE_POSITION.lat, GARAGE_POSITION.lng],
        [clientLat, clientLng]
      ];
      
      L.polyline(points, {
        color: '#e94560',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      }).addTo(mapRef.current);
      
      // Ajuster la vue pour voir les deux points
      const bounds = L.latLngBounds(points);
      mapRef.current.fitBounds(bounds);
    }
  }, [demande, clientLat, clientLng]);

  const eta = distance ? Math.round(distance / 30 * 60) : 0;

  if (!demande) return null;

  return (
    <div>
      <div 
        id="admin-depannage-map" 
        style={{ 
          height: '400px', 
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
          padding: '10px',
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
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== COMPOSANT PRINCIPAL ====================

function AdminDepannage() {
  const [demandes, setDemandes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const getStatusStyle = (statut) => {
    switch(statut) {
      case 'en_attente': return { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', text: 'En attente' };
      case 'acceptee': return { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', text: 'Acceptée' };
      case 'terminee': return { bg: 'rgba(33, 150, 243, 0.1)', color: '#2196f3', text: 'Terminée' };
      case 'refusee': return { bg: 'rgba(244, 67, 54, 0.1)', color: '#f44336', text: 'Refusée' };
      default: return { bg: 'rgba(158, 158, 158, 0.1)', color: '#9e9e9e', text: statut };
    }
  };

  // Fonction pour formater les coordonnées (safe)
  const formatCoordinate = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.0000' : num.toFixed(4);
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
                Gestion des dépannages
              </h1>
              <p className="text-light">Gérez les demandes de dépannage d'urgence</p>
            </div>
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
            >
              Toutes ({demandes.length})
            </button>
            <button 
              onClick={() => setFilter('en_attente')}
              className={filter === 'en_attente' ? 'btn-primary' : 'btn-outline'}
            >
              En attente ({stats.en_attente})
            </button>
            <button 
              onClick={() => setFilter('acceptee')}
              className={filter === 'acceptee' ? 'btn-primary' : 'btn-outline'}
            >
              Acceptées ({stats.acceptee})
            </button>
            <button 
              onClick={() => setFilter('terminee')}
              className={filter === 'terminee' ? 'btn-primary' : 'btn-outline'}
            >
              Terminées ({stats.terminee})
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
                  const status = getStatusStyle(demande.statut);
                  // Conversion sécurisée des coordonnées
                  const lat = parseFloat(demande.lat);
                  const lng = parseFloat(demande.lng);
                  const isValidCoord = !isNaN(lat) && !isNaN(lng);
                  
                  return (
                    <div 
                      key={demande.id} 
                      className="card"
                      style={{ 
                        cursor: 'pointer',
                        border: selectedDemande?.id === demande.id ? '2px solid #e94560' : undefined,
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => isValidCoord && setSelectedDemande(demande)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
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
                          {isValidCoord && (
                            <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                              <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: '5px' }} />
                              {formatCoordinate(demande.lat)}, {formatCoordinate(demande.lng)}
                            </p>
                          )}
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
                  Cliquez sur une demande dans la liste pour afficher la carte
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