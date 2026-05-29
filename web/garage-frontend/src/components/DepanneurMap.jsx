// frontend/src/components/DepanneurMap.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTruck, faRoute, faPlay, faStop, faCheckCircle, faSpinner, 
    faPhone, faLocationDot, faClock, faMapPin, faRoad, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateOptimalPathWithRealRoads, estimateETA, formatDistance, formatTime } from '../services/dijkstra';
import { accepterMission, terminerMission, mettreAJourPosition } from '../services/depannageApi';
import { fetchNearbyGarages } from '../services/overpassService';

// Configuration Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icônes personnalisées
const clientIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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

function DepanneurMap({ demande, onMissionUpdate }) {
    const mapRef = useRef(null);
    const [depanneusePos, setDepanneusePos] = useState(null);
    const [pathCoordinates, setPathCoordinates] = useState([]);
    const [distance, setDistance] = useState(null);
    const [eta, setEta] = useState(null);
    const [pathLayer, setPathLayer] = useState(null);
    const [depanneuseMarker, setDepanneuseMarker] = useState(null);
    const [missionActive, setMissionActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [trackingActive, setTrackingActive] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [nearbyGarages, setNearbyGarages] = useState([]);
    const watchIdRef = useRef(null);

    const clientLat = parseFloat(demande.lat);
    const clientLng = parseFloat(demande.lng);
    const isMissionAcceptee = demande.statut === 'acceptee';
    const isMissionTerminee = demande.statut === 'terminee';

    const garagePosition = { lat: 48.8566, lng: 2.3522 };

    // Initialiser la carte
    useEffect(() => {
        if (!mapRef.current && !isNaN(clientLat) && !isNaN(clientLng)) {
            mapRef.current = L.map('depanneur-map').setView([clientLat, clientLng], 13);
            L.tileLayer(TILE_LAYER.url, {
                attribution: TILE_LAYER.attribution,
                subdomains: TILE_LAYER.subdomains,
                maxZoom: TILE_LAYER.maxZoom,
                minZoom: TILE_LAYER.minZoom
            }).addTo(mapRef.current);
            
            L.marker([clientLat, clientLng], { icon: clientIcon })
                .addTo(mapRef.current)
                .bindPopup(`
                    <b>👤 Client: ${demande.client_prenom} ${demande.client_nom}</b><br/>
                    📞 ${demande.client_telephone || 'Pas de téléphone'}<br/>
                    🆔 Demande #${demande.id}
                `)
                .openPopup();
        }
    }, [demande, clientLat, clientLng]);

    // Calculer et afficher le chemin avec Dijkstra + Overpass
    const calculerEtAfficherChemin = useCallback(async (startPos, endPos) => {
        if (!mapRef.current) return;
        
        setCalculating(true);
        
        try {
            // Utiliser Overpass pour des routes réelles
            const result = await calculateOptimalPathWithRealRoads(startPos, endPos, 5000);
            
            if (result && result.success && result.path.length > 0) {
                setDistance(result.distance);
                setEta(estimateETA(result.distance));
                setPathCoordinates(result.path);

                if (pathLayer) {
                    mapRef.current.removeLayer(pathLayer);
                }

                const leafletPoints = result.path.map(coord => [coord.lat, coord.lng]);
                const newPath = L.polyline(leafletPoints, {
                    color: '#e94560',
                    weight: 5,
                    opacity: 0.9,
                    dashArray: '10, 10'
                }).addTo(mapRef.current);

                setPathLayer(newPath);

                const bounds = newPath.getBounds();
                if (bounds.isValid()) {
                    mapRef.current.fitBounds(bounds);
                }
                
                console.log(`Chemin trouvé: ${result.distance.toFixed(2)} km, ${result.path.length} points`);
            } else {
                console.log('No path found from Overpass, using fallback');
                // Fallback: ligne droite
                const points = [[startPos.lat, startPos.lng], [endPos.lat, endPos.lng]];
                const fallbackPath = L.polyline(points, { 
                    color: '#e94560', 
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '5, 10'
                }).addTo(mapRef.current);
                setPathLayer(fallbackPath);
                
                const dist = calculateHaversineDistance(startPos.lat, startPos.lng, endPos.lat, endPos.lng);
                setDistance(dist);
                setEta(estimateETA(dist));
            }
        } catch (error) {
            console.error("Erreur calcul chemin:", error);
            const points = [[startPos.lat, startPos.lng], [endPos.lat, endPos.lng]];
            const fallbackPath = L.polyline(points, { color: '#e94560', weight: 4 }).addTo(mapRef.current);
            setPathLayer(fallbackPath);
        } finally {
            setCalculating(false);
        }
    }, [pathLayer]);

    // Calculer distance Haversine
    const calculateHaversineDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    };

    // Mettre à jour position dépanneuse
    const updateDepanneusePosition = useCallback(async (position) => {
        if (!mapRef.current) return;

        setDepanneusePos(position);

        if (depanneuseMarker) {
            depanneuseMarker.setLatLng([position.lat, position.lng]);
        } else {
            const marker = L.marker([position.lat, position.lng], { icon: depanneuseIcon })
                .addTo(mapRef.current)
                .bindPopup('🚛 Ma position');
            setDepanneuseMarker(marker);
        }

        await calculerEtAfficherChemin(position, { lat: clientLat, lng: clientLng });

        if (missionActive && demande.id) {
            try {
                await mettreAJourPosition(demande.id, position.lat, position.lng);
            } catch (err) {
                console.error("Erreur envoi position:", err);
            }
        }
    }, [depanneuseMarker, calculerEtAfficherChemin, clientLat, clientLng, missionActive, demande.id]);

    // Démarrer suivi GPS
    const demarrerSuiviGPS = useCallback(() => {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée");
            return;
        }

        setTrackingActive(true);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const newPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateDepanneusePosition(newPos);
            },
            (error) => {
                console.error("Erreur GPS:", error);
                let message = "Erreur de géolocalisation";
                if (error.code === 1) message = "Permission refusée";
                if (error.code === 2) message = "Position non disponible";
                if (error.code === 3) message = "Délai d'attente dépassé";
                alert(message);
                setTrackingActive(false);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
    }, [updateDepanneusePosition]);

    // Arrêter suivi GPS
    const arreterSuiviGPS = useCallback(() => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setTrackingActive(false);
    }, []);

    // Récupérer position initiale
    const getInitialPosition = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Géolocalisation non supportée"));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    }, []);

    // Rechercher garages à proximité
    const searchNearbyGarages = async () => {
        if (!depanneusePos && !garagePosition) return;
        
        const center = depanneusePos || garagePosition;
        const garages = await fetchNearbyGarages(center.lat, center.lng, 5000);
        setNearbyGarages(garages);
        
        // Ajouter les marqueurs des garages sur la carte
        garages.forEach(garage => {
            L.marker([garage.lat, garage.lng])
                .addTo(mapRef.current)
                .bindPopup(`
                    <b>🔧 ${garage.name}</b><br/>
                    📞 ${garage.phone || 'Non renseigné'}<br/>
                    🕐 ${garage.openingHours || 'Horaires non disponibles'}
                `);
        });
    };

    // Accepter mission
    const handleAccepterMission = async () => {
        setLoading(true);
        try {
            await accepterMission(demande.id);
            setMissionActive(true);
            
            const position = await getInitialPosition();
            await updateDepanneusePosition(position);
            demarrerSuiviGPS();
            
            if (onMissionUpdate) onMissionUpdate();
            alert("Mission acceptée ! Le suivi GPS est activé.");
        } catch (err) {
            alert("Erreur: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Terminer mission
    const handleTerminerMission = async () => {
        if (window.confirm('Confirmez-vous la fin de cette mission ?')) {
            setLoading(true);
            try {
                await terminerMission(demande.id);
                arreterSuiviGPS();
                setMissionActive(false);
                if (onMissionUpdate) onMissionUpdate();
                alert("Mission terminée avec succès !");
            } catch (err) {
                alert("Erreur: " + err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // Nettoyage
    useEffect(() => {
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // Activer suivi si mission déjà acceptée
    useEffect(() => {
        if (isMissionAcceptee && !missionActive) {
            setMissionActive(true);
            demarrerSuiviGPS();
        }
    }, [isMissionAcceptee, missionActive, demarrerSuiviGPS]);

    return (
        <div className="card">
            {/* En-tête */}
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
                        <FontAwesomeIcon icon={faTruck} style={{ marginRight: '8px', color: '#e94560' }} />
                        {demande.client_prenom} {demande.client_nom}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                        <FontAwesomeIcon icon={faPhone} style={{ marginRight: '5px' }} />
                        {demande.client_telephone || 'Pas de téléphone'}
                    </p>
                </div>
                <div>
                    {!isMissionAcceptee && !isMissionTerminee && (
                        <button onClick={handleAccepterMission} disabled={loading} style={{ backgroundColor: '#4caf50' }}>
                            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlay} />}
                            Accepter la mission
                        </button>
                    )}
                    {isMissionAcceptee && !isMissionTerminee && (
                        <button onClick={handleTerminerMission} disabled={loading} style={{ backgroundColor: '#2196f3' }}>
                            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />}
                            Mission terminée
                        </button>
                    )}
                    {isMissionTerminee && (
                        <span style={{ backgroundColor: '#4caf50', padding: '8px 15px', borderRadius: '8px', color: 'white' }}>
                            <FontAwesomeIcon icon={faCheckCircle} /> Mission terminée
                        </span>
                    )}
                </div>
            </div>

            {/* Contrôles */}
            {isMissionAcceptee && !isMissionTerminee && (
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={demarrerSuiviGPS} disabled={trackingActive} style={{ backgroundColor: '#4caf50', padding: '6px 12px', fontSize: '12px' }}>
                            <FontAwesomeIcon icon={faPlay} /> Démarrer suivi
                        </button>
                        <button onClick={arreterSuiviGPS} disabled={!trackingActive} style={{ backgroundColor: '#f44336', padding: '6px 12px', fontSize: '12px' }}>
                            <FontAwesomeIcon icon={faStop} /> Arrêter suivi
                        </button>
                        <button onClick={searchNearbyGarages} style={{ backgroundColor: '#ff9800', padding: '6px 12px', fontSize: '12px' }}>
                            <FontAwesomeIcon icon={faMapPin} /> Garages à proximité
                        </button>
                        <button 
                            onClick={() => depanneusePos && calculerEtAfficherChemin(depanneusePos, { lat: clientLat, lng: clientLng })} 
                            style={{ backgroundColor: '#2196f3', padding: '6px 12px', fontSize: '12px' }}
                            disabled={calculating}
                        >
                            {calculating ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faRoute} />}
                            {calculating ? 'Calcul...' : 'Recalculer (Dijkstra + OSM)'}
                        </button>
                    </div>
                    <p className="text-light" style={{ fontSize: '11px', marginTop: '8px' }}>
                        <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '4px' }} />
                        Utilisation des données routières OpenStreetMap (Overpass API) pour un trajet optimal
                    </p>
                </div>
            )}

            {/* Carte */}
            <div id="depanneur-map" style={{ height: '400px', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }} />

            {/* Informations trajet */}
            {(distance || eta) && (
                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'var(--card-bg)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {distance && (
                            <div>
                                <strong>📍 Distance optimale:</strong> 
                                <span style={{ color: '#e94560', marginLeft: '8px' }}>{formatDistance(distance)}</span>
                            </div>
                        )}
                        {eta && (
                            <div>
                                <strong>⏱️ ETA estimé:</strong>
                                <span style={{ color: '#4caf50', marginLeft: '8px' }}>{formatTime(eta)}</span>
                            </div>
                        )}
                        {depanneusePos && (
                            <div>
                                <strong>🚛 Ma position:</strong>
                                <span style={{ color: '#ff9800', marginLeft: '8px' }}>{depanneusePos.lat.toFixed(4)}, {depanneusePos.lng.toFixed(4)}</span>
                            </div>
                        )}
                        <div>
                            <strong>🗺️ Source:</strong>
                            <span style={{ color: '#2196f3', marginLeft: '8px' }}>
                                <FontAwesomeIcon icon={faRoad} /> OpenStreetMap + Overpass API
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Garages à proximité */}
            {nearbyGarages.length > 0 && (
                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '10px' }}>
                        <FontAwesomeIcon icon={faMapPin} style={{ marginRight: '8px' }} />
                        Garages à proximité ({nearbyGarages.length})
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {nearbyGarages.slice(0, 5).map(garage => (
                            <div key={garage.id} style={{ fontSize: '12px', padding: '5px 10px', backgroundColor: 'white', borderRadius: '5px' }}>
                                <strong>{garage.name}</strong>
                                <br />
                                {garage.phone && <span>📞 {garage.phone}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DepanneurMap;