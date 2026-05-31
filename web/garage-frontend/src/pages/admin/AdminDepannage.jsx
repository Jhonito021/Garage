// frontend/src/pages/admin/AdminDepannage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';  // ← Ajout de useRef
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
  faLocationDot,
  faUserCheck,
  faUserPlus,
  faEnvelope,
  faCalendarAlt,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import { 
  getDemandesDepannage, 
  accepterDemande, 
  refuserDemande,
  getTechniciens,
  assignerTechnicien
} from '../../services/depannageApi';
import { calculateDistance } from '../../services/geolocation';

// ==================== CONFIGURATION LEAFLET ====================
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

const depanneurIcon = new L.Icon({
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

const GARAGE_POSITION = { lat: 48.8566, lng: 2.3522 };

// ==================== COMPOSANT CARTE ====================

const DepannageMap = ({ demande }) => {
  const mapRef = useRef(null);
  const [distance, setDistance] = useState(null);
  const [depanneurInfo, setDepanneurInfo] = useState(null);

  const clientLat = parseFloat(demande.lat);
  const clientLng = parseFloat(demande.lng);
  const depanneurLat = demande.technicien_lat ? parseFloat(demande.technicien_lat) : null;
  const depanneurLng = demande.technicien_lng ? parseFloat(demande.technicien_lng) : null;

  useEffect(() => {
    if (!mapRef.current && !isNaN(clientLat) && !isNaN(clientLng)) {
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
      
      // Calculer distance garage -> client
      const dist = calculateDistance(GARAGE_POSITION.lat, GARAGE_POSITION.lng, clientLat, clientLng);
      setDistance(dist);
      
      // Tracer le chemin garage -> client
      const points = [[GARAGE_POSITION.lat, GARAGE_POSITION.lng], [clientLat, clientLng]];
      
      L.polyline(points, {
        color: '#e94560',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      }).addTo(mapRef.current);
      
      // Ajuster la vue
      const bounds = L.latLngBounds(points);
      mapRef.current.fitBounds(bounds);
    }
  }, [demande, clientLat, clientLng]);

  // Ajouter le marqueur du dépanneur s'il a une position
  useEffect(() => {
    if (mapRef.current && depanneurLat && depanneurLng && !isNaN(depanneurLat) && !isNaN(depanneurLng)) {
      // Supprimer l'ancien marqueur s'il existe
      if (window.depanneurMarker) {
        mapRef.current.removeLayer(window.depanneurMarker);
      }
      
      window.depanneurMarker = L.marker([depanneurLat, depanneurLng], { icon: depanneurIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <b>🚛 Dépanneur: ${demande.technicien_prenom || ''} ${demande.technicien_nom || ''}</b><br/>
          📍 Position en temps réel
        `);
      
      // Recalculer la distance depuis le dépanneur
      const distFromDep = calculateDistance(depanneurLat, depanneurLng, clientLat, clientLng);
      setDepanneurInfo({ distance: distFromDep });
    }
  }, [depanneurLat, depanneurLng, clientLat, clientLng, demande]);

  const eta = distance ? Math.round(distance / 30 * 60) : 0;
  const etaDep = depanneurInfo?.distance ? Math.round(depanneurInfo.distance / 30 * 60) : 0;

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
      
      <div style={{ 
        marginTop: '15px', 
        padding: '15px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <strong>📍 Distance Garage → Client:</strong> 
            <span style={{ color: '#e94560', marginLeft: '8px' }}>
              {distance ? `${distance.toFixed(2)} km` : 'Calcul...'}
            </span>
          </div>
          <div>
            <strong>⏱️ ETA estimé:</strong>
            <span style={{ color: '#4caf50', marginLeft: '8px' }}>
              {eta} minutes
            </span>
          </div>
          {depanneurInfo && (
            <>
              <div>
                <strong>🚛 Distance Dépanneur → Client:</strong>
                <span style={{ color: '#ff9800', marginLeft: '8px' }}>
                  {depanneurInfo.distance.toFixed(2)} km
                </span>
              </div>
              <div>
                <strong>⏱️ ETA dépanneur:</strong>
                <span style={{ color: '#2196f3', marginLeft: '8px' }}>
                  {etaDep} minutes
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== COMPOSANT PRINCIPAL ====================

function AdminDepannage() {
  const [demandes, setDemandes] = useState([]);
  const [depanneurs, setDepanneurs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // États pour le modal d'assignation
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDemandeForAssign, setSelectedDemandeForAssign] = useState(null);
  const [selectedDepanneurId, setSelectedDepanneurId] = useState('');
  const [assigning, setAssigning] = useState(false);

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

  // Récupérer les dépanneurs (techniciens)
  const fetchDepanneurs = async () => {
    try {
      const data = await getTechniciens();
      setDepanneurs(data);
    } catch (err) {
      console.error('Erreur chargement dépanneurs:', err);
    }
  };

  useEffect(() => {
    fetchDemandes();
    fetchDepanneurs();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDemandes();
        fetchDepanneurs();
      }, 10000);
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

  // Accepter une demande (assignation directe)
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

  // Ouvrir le modal d'assignation
  const openAssignModal = (demande) => {
    setSelectedDemandeForAssign(demande);
    setSelectedDepanneurId('');
    setShowAssignModal(true);
  };

  // Assigner un dépanneur
  const handleAssigner = async () => {
    if (!selectedDepanneurId) {
      alert('Veuillez sélectionner un dépanneur');
      return;
    }
    
    setAssigning(true);
    try {
      await assignerTechnicien(selectedDemandeForAssign.id, selectedDepanneurId);
      alert('Dépanneur assigné avec succès');
      setShowAssignModal(false);
      fetchDemandes(); // Rafraîchir la liste
      
      // Mettre à jour la demande sélectionnée si c'est la même
      if (selectedDemande?.id === selectedDemandeForAssign.id) {
        setSelectedDemande(null);
      }
    } catch (err) {
      alert('Erreur lors de l\'assignation');
    } finally {
      setAssigning(false);
    }
  };

  // Statistiques
  const stats = {
    en_attente: demandes.filter(d => d.statut === 'en_attente').length,
    acceptee: demandes.filter(d => d.statut === 'acceptee').length,
    terminee: demandes.filter(d => d.statut === 'terminee').length,
    refusee: demandes.filter(d => d.statut === 'refusee').length,
    total: demandes.length
  };

  // Obtenir la couleur du statut
  const getStatusStyle = (statut) => {
    switch(statut) {
      case 'en_attente': 
        return { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', text: 'En attente', icon: faClock };
      case 'acceptee': 
        return { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', text: 'En cours', icon: faTruck };
      case 'terminee': 
        return { bg: 'rgba(33, 150, 243, 0.1)', color: '#2196f3', text: 'Terminée', icon: faCheckCircle };
      case 'refusee': 
        return { bg: 'rgba(244, 67, 54, 0.1)', color: '#f44336', text: 'Refusée', icon: faTimesCircle };
      default: 
        return { bg: 'rgba(158, 158, 158, 0.1)', color: '#9e9e9e', text: statut, icon: faClock };
    }
  };

  // Formater les coordonnées
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
              <p className="text-light">Gérez les demandes de dépannage d'urgence et assignez les dépanneurs</p>
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
          <div className="grid-5" style={{ marginTop: '20px' }}>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: '#e94560' }}>{stats.total}</div>
              <div className="stat-card-label">Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: '#ff9800' }}>{stats.en_attente}</div>
              <div className="stat-card-label">En attente</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: '#4caf50' }}>{stats.acceptee}</div>
              <div className="stat-card-label">En cours</div>
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
              Toutes ({stats.total})
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
              En cours ({stats.acceptee})
            </button>
            <button 
              onClick={() => setFilter('terminee')}
              className={filter === 'terminee' ? 'btn-primary' : 'btn-outline'}
            >
              Terminées ({stats.terminee})
            </button>
            <button 
              onClick={() => setFilter('refusee')}
              className={filter === 'refusee' ? 'btn-primary' : 'btn-outline'}
            >
              Refusées ({stats.refusee})
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
                <FontAwesomeIcon icon={faTruck} size="2x" style={{ color: 'var(--text-light)', marginBottom: '15px' }} />
                <p>Aucune demande trouvée</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '600px', overflowY: 'auto' }}>
                {filteredDemandes.map(demande => {
                  const status = getStatusStyle(demande.statut);
                  const lat = parseFloat(demande.lat);
                  const lng = parseFloat(demande.lng);
                  const isValidCoord = !isNaN(lat) && !isNaN(lng);
                  
                  return (
                    <div 
                      key={demande.id} 
                      className="card"
                      style={{ 
                        cursor: 'pointer',
                        border: selectedDemande?.id === demande.id ? `2px solid ${status.color}` : '1px solid var(--border-color)',
                        transition: 'all 0.3s ease',
                        backgroundColor: selectedDemande?.id === demande.id ? `${status.bg}` : undefined
                      }}
                      onClick={() => isValidCoord && setSelectedDemande(demande)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <h3 style={{ marginBottom: '5px', fontSize: '1rem' }}>
                              {demande.client_prenom} {demande.client_nom}
                            </h3>
                            <span style={{ 
                              backgroundColor: status.bg, 
                              color: status.color,
                              padding: '2px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              <FontAwesomeIcon icon={status.icon} />
                              {status.text}
                            </span>
                          </div>
                          
                          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '5px' }}>
                            <FontAwesomeIcon icon={faPhone} style={{ marginRight: '5px', width: '14px' }} />
                            {demande.client_telephone || 'Pas de téléphone'}
                          </p>
                          
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px', width: '14px' }} />
                            {new Date(demande.date_demande).toLocaleString()}
                          </p>
                          
                          {isValidCoord && (
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 0 }}>
                              <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: '5px', width: '14px' }} />
                              {formatCoordinate(demande.lat)}, {formatCoordinate(demande.lng)}
                            </p>
                          )}
                          
                          {demande.technicien_nom && (
                            <p style={{ fontSize: '11px', color: '#4caf50', marginTop: '5px' }}>
                              <FontAwesomeIcon icon={faUserCheck} style={{ marginRight: '5px' }} />
                              Dépanneur: {demande.technicien_prenom} {demande.technicien_nom}
                            </p>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedDemande(demande); }} 
                            style={{ 
                              backgroundColor: 'transparent',
                              border: `1px solid ${status.color}`,
                              padding: '5px 12px',
                              fontSize: '11px',
                              color: status.color
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} style={{ marginRight: '5px' }} />
                            Voir
                          </button>
                        </div>
                      </div>
                      
                      {demande.statut === 'en_attente' && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openAssignModal(demande); }}
                            style={{ backgroundColor: '#4caf50', padding: '6px 15px', fontSize: '12px' }}
                          >
                            <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '5px' }} />
                            Assigner un dépanneur
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRefuser(demande.id); }}
                            style={{ backgroundColor: '#f44336', padding: '6px 15px', fontSize: '12px' }}
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
                  borderBottom: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <h3 style={{ marginBottom: '5px' }}>
                      {selectedDemande.client_prenom} {selectedDemande.client_nom}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                      <FontAwesomeIcon icon={faPhone} style={{ marginRight: '5px' }} />
                      {selectedDemande.client_telephone || 'Pas de téléphone'}
                    </p>
                    {selectedDemande.technicien_nom && (
                      <p style={{ fontSize: '12px', color: '#4caf50', marginTop: '5px' }}>
                        <FontAwesomeIcon icon={faUserCheck} style={{ marginRight: '5px' }} />
                        Dépanneur assigné: {selectedDemande.technicien_prenom} {selectedDemande.technicien_nom}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {selectedDemande.statut === 'en_attente' && (
                      <button 
                        onClick={() => openAssignModal(selectedDemande)}
                        style={{ backgroundColor: '#4caf50', padding: '8px 16px', fontSize: '13px' }}
                      >
                        <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '5px' }} />
                        Assigner
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedDemande(null)}
                      className="btn-outline"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      <FontAwesomeIcon icon={faEyeSlash} style={{ marginRight: '5px' }} />
                      Masquer
                    </button>
                  </div>
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

      {/* Modal d'assignation des dépanneurs */}
      {showAssignModal && selectedDemandeForAssign && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>
                <FontAwesomeIcon icon={faTruck} style={{ marginRight: '10px' }} />
                Assigner un dépanneur
              </h3>
              <span className="modal-close" onClick={() => setShowAssignModal(false)}>&times;</span>
            </div>
            
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--card-bg)', borderRadius: '8px' }}>
              <p><strong>👤 Client:</strong> {selectedDemandeForAssign.client_prenom} {selectedDemandeForAssign.client_nom}</p>
              <p><strong>📞 Téléphone:</strong> {selectedDemandeForAssign.client_telephone || 'Non renseigné'}</p>
              <p><strong>📍 Position:</strong> {formatCoordinate(selectedDemandeForAssign.lat)}, {formatCoordinate(selectedDemandeForAssign.lng)}</p>
              <p><strong>📅 Date:</strong> {new Date(selectedDemandeForAssign.date_demande).toLocaleString()}</p>
            </div>
            
            <div className="form-group">
              <label>Choisir un dépanneur</label>
              <select 
                value={selectedDepanneurId} 
                onChange={(e) => setSelectedDepanneurId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
              >
                <option value="">-- Sélectionner un dépanneur --</option>
                {depanneurs.map(dep => (
                  <option key={dep.id} value={dep.id}>
                    {dep.prenom} {dep.nom} {dep.specialite ? `- ${dep.specialite}` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            {depanneurs.length === 0 && (
              <div style={{ padding: '12px', backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: '8px', marginBottom: '15px' }}>
                <p className="text-danger" style={{ fontSize: '13px', margin: 0 }}>
                  <FontAwesomeIcon icon={faTimesCircle} style={{ marginRight: '8px' }} />
                  Aucun dépanneur disponible. Veuillez d'abord créer un compte technicien.
                </p>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowAssignModal(false)} className="btn-outline">
                Annuler
              </button>
              <button 
                onClick={handleAssigner} 
                disabled={assigning || !selectedDepanneurId || depanneurs.length === 0}
                style={{ backgroundColor: '#4caf50' }}
              >
                {assigning ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                    Assignation...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUserCheck} style={{ marginRight: '8px' }} />
                    Assigner le dépanneur
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDepannage;