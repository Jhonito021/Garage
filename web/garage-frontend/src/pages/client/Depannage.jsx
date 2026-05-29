// frontend/src/pages/client/Depannage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, 
  faArrowLeft, 
  faSpinner, 
  faLocationDot, 
  faCrosshairs, 
  faMapMarkerAlt,
  faPhone,
  faShieldAlt,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DepannageButton from '../../components/DepannageButton';
import { getCurrentPosition } from '../../services/geolocation';

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

// Icône personnalisée pour le client
const createClientIcon = () => new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Configuration du fond de carte
const TILE_LAYER = {
  url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  maxZoom: 19,
  minZoom: 5
};

// ==================== COMPOSANTS ====================

// Composant d'erreur de géolocalisation
const GeolocationError = ({ error, onRetry, onBack }) => (
  <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
    <div style={{
      width: '80px',
      height: '80px',
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 15px'
    }}>
      <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" color="#f44336" />
    </div>
    <h2 style={{ color: '#f44336', marginBottom: '10px' }}>Géolocalisation requise</h2>
    <p className="text-light">{error || "Nous n'avons pas pu accéder à votre position."}</p>
    <div style={{ marginTop: '20px' }}>
      <button onClick={onRetry} style={{ marginRight: '10px' }}>
        <FontAwesomeIcon icon={faCrosshairs} style={{ marginRight: '5px' }} />
        Réessayer
      </button>
      <Link to="/dashboard">
        <button className="btn-outline">Retour</button>
      </Link>
    </div>
  </div>
);

// Composant de chargement
const LoadingSpinner = () => (
  <div style={{ 
    textAlign: 'center', 
    padding: '60px 20px',
    backgroundColor: 'var(--card-bg)',
    borderRadius: '10px'
  }}>
    <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#e94560" />
    <h3 style={{ marginTop: '20px' }}>Récupération de votre position...</h3>
    <p className="text-light">Veuillez activer la géolocalisation</p>
  </div>
);

// Composant d'en-tête
const PageHeader = () => (
  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
    <div style={{
      width: '80px',
      height: '80px',
      backgroundColor: 'rgba(233, 69, 96, 0.1)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 15px'
    }}>
      <FontAwesomeIcon icon={faTruck} size="2x" color="#e94560" />
    </div>
    <h1>Dépannage d'urgence</h1>
    <p className="text-light">
      En panne ? Notre service de dépannage est disponible 24h/24, 7j/7.
    </p>
  </div>
);

// Composant d'avertissement
const WarningBox = () => (
  <div style={{ 
    backgroundColor: 'rgba(255, 152, 0, 0.1)', 
    border: '1px solid #ff9800',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px'
  }}>
    <h4 style={{ color: '#ff9800', marginBottom: '10px' }}>
      ⚠️ Avant de continuer
    </h4>
    <ul style={{ marginLeft: '20px', color: 'var(--text-light)' }}>
      <li>Assurez-vous d'être en sécurité</li>
      <li>Vérifiez que votre position GPS est correcte sur la carte</li>
      <li>Un dépanneur arrivera dans les plus brefs délais</li>
      <li>Service disponible 24h/24</li>
    </ul>
  </div>
);

// Composant de confirmation
const ConfirmationBox = ({ demandeId }) => (
  <div style={{ 
    backgroundColor: 'rgba(76, 175, 80, 0.1)', 
    border: '1px solid #4caf50',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    textAlign: 'center'
  }}>
    <FontAwesomeIcon icon={faTruck} style={{ color: '#4caf50', fontSize: '24px', marginBottom: '10px' }} />
    <h3 style={{ color: '#4caf50', marginBottom: '5px' }}>Demande envoyée !</h3>
    <p className="text-light">
      Une dépanneuse est en route vers votre position.<br/>
      Vous pouvez suivre son arrivée sur la carte ci-dessus.
    </p>
    <p className="text-light" style={{ fontSize: '12px', marginTop: '10px' }}>
      ID Demande: <strong>{demandeId}</strong>
    </p>
  </div>
);

// Composant des coordonnées
const CoordinatesDisplay = ({ lat, lng, accuracy }) => (
  <div style={{ 
    marginTop: '10px', 
    padding: '10px',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: '8px',
    fontSize: '12px'
  }}>
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <span>📍 Latitude: <strong>{lat.toFixed(6)}</strong></span>
      <span>📍 Longitude: <strong>{lng.toFixed(6)}</strong></span>
      {accuracy && (
        <span>🎯 Précision: <strong>±{Math.round(accuracy)} mètres</strong></span>
      )}
    </div>
  </div>
);

// Composant de contact
const ContactCard = () => (
  <div className="card" style={{ marginTop: '30px', textAlign: 'center' }}>
    <h3>📞 Besoin d'aide ?</h3>
    <p className="text-light">
      Contactez notre assistance 24h/24 au<br/>
      <strong style={{ fontSize: '20px', color: '#e94560' }}>038 51 014 00</strong>
    </p>
  </div>
);

// ==================== COMPOSANT PRINCIPAL ====================

function Depannage() {
  // États
  const [clientPosition, setClientPosition] = useState(null);
  const [demandeId, setDemandeId] = useState(null);
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  
  // Refs pour la carte
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  // Configuration initiale
  useEffect(() => {
    configureLeafletIcons();
  }, []);

  // Récupération de la position
  useEffect(() => {
    const getLocation = async () => {
      setLoading(true);
      setLocationError(null);
      
      try {
        const position = await getCurrentPosition();
        setClientPosition(position);
        setLocationPermission(true);
      } catch (error) {
        console.error('Erreur géolocalisation:', error);
        setLocationError(error.message);
        setLocationPermission(false);
      } finally {
        setLoading(false);
      }
    };
    
    getLocation();
  }, []);

  // Initialisation de la carte
  const initMap = (lat, lng) => {
    if (!mapRef.current) {
      mapRef.current = L.map('client-depannage-map').setView([lat, lng], 16);
      L.tileLayer(TILE_LAYER.url, {
        attribution: TILE_LAYER.attribution,
        subdomains: TILE_LAYER.subdomains,
        maxZoom: TILE_LAYER.maxZoom,
        minZoom: TILE_LAYER.minZoom
      }).addTo(mapRef.current);
    } else {
      mapRef.current.setView([lat, lng], 16);
    }
  };

  // Ajout du marqueur
  const addMarker = (lat, lng) => {
    const popupContent = `
      <div style="text-align:center">
        <strong>📍 Ma position</strong><br/>
        <small>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}</small>
        ${clientPosition?.accuracy ? `<br/><small>Précision: ±${Math.round(clientPosition.accuracy)}m</small>` : ''}
        ${demandeId ? `<br/><strong>Demande #${demandeId}</strong>` : ''}
      </div>
    `;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.bindPopup(popupContent);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: createClientIcon() })
        .addTo(mapRef.current)
        .bindPopup(popupContent)
        .openPopup();
    }
  };

  // Ajout du cercle de précision
  const addAccuracyCircle = (lat, lng, accuracy) => {
    if (!accuracy) return;

    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius(accuracy);
    } else {
      circleRef.current = L.circle([lat, lng], {
        radius: accuracy,
        color: '#e94560',
        fillColor: '#e94560',
        fillOpacity: 0.1,
        weight: 2
      }).addTo(mapRef.current);
    }
  };

  // Mise à jour complète de la carte
  const updateMap = (position) => {
    if (!position) return;

    const { lat, lng, accuracy } = position;
    
    initMap(lat, lng);
    addMarker(lat, lng);
    addAccuracyCircle(lat, lng, accuracy);
  };

  // Effet pour la carte
  useEffect(() => {
    if (clientPosition) {
      updateMap(clientPosition);
    }
  }, [clientPosition, demandeId]);

  // Rafraîchir la position
  const refreshLocation = async () => {
    setLoading(true);
    try {
      const position = await getCurrentPosition();
      setClientPosition(position);
    } catch (error) {
      setLocationError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Succès du dépannage
  const handleDepannageSuccess = (position, id) => {
    setClientPosition(position);
    setDemandeId(id);
    setDemandeEnvoyee(true);
  };

  // Rendu conditionnel
  if (loading) return <LoadingSpinner />;
  if (locationError || !locationPermission) {
    return (
      <div className="container">
        <Link to="/dashboard" style={{ color: 'var(--text-light)', fontSize: '14px', display: 'inline-block', marginBottom: '20px' }}>
          <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '5px' }} />
          Retour au tableau de bord
        </Link>
        <GeolocationError 
          error={locationError} 
          onRetry={refreshLocation} 
        />
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="container">
      {/* Fil d'Ariane */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-light)', fontSize: '14px' }}>
          <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '5px' }} />
          Retour au tableau de bord
        </Link>
      </div>

      {/* Contenu principal */}
      <div className="card">
        <PageHeader />

        {/* Section Carte */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '10px',
            flexWrap: 'wrap'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FontAwesomeIcon icon={faLocationDot} style={{ color: '#4caf50' }} />
              Votre position actuelle
            </h3>
            <button 
              onClick={refreshLocation}
              style={{ 
                backgroundColor: 'transparent', 
                padding: '5px 10px',
                fontSize: '12px',
                border: '1px solid var(--border-color)'
              }}
            >
              <FontAwesomeIcon icon={faCrosshairs} style={{ marginRight: '5px' }} />
              Rafraîchir
            </button>
          </div>
          
          {/* Conteneur de la carte */}
          <div 
            id="client-depannage-map" 
            style={{ 
              height: '400px', 
              width: '100%', 
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              backgroundColor: '#1a1a2e'
            }} 
          />
          
          {/* Affichage des coordonnées */}
          {clientPosition && (
            <CoordinatesDisplay 
              lat={clientPosition.lat}
              lng={clientPosition.lng}
              accuracy={clientPosition.accuracy}
            />
          )}
        </div>

        {/* Contenu selon l'état de la demande */}
        {!demandeEnvoyee ? (
          <>
            <WarningBox />
            <DepannageButton onSuccess={handleDepannageSuccess} />
          </>
        ) : (
          <>
            <ConfirmationBox demandeId={demandeId} />
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link to="/dashboard">
                <button className="btn-outline">
                  Retour au tableau de bord
                </button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Contact */}
      <ContactCard />
    </div>
  );
}

export default Depannage;