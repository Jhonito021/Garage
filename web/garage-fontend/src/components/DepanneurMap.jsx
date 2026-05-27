// frontend/src/components/DepanneurMap.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTruck, 
    faRoute, 
    faPlay, 
    faStop, 
    faCheckCircle, 
    faSpinner, 
    faPhone, 
    faLocationDot,
    faClock,
    faMapPin
} from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateOptimalPath, estimateETA, formatDistance, formatTime } from '../services/dijkstra';
import { accepterMission, terminerMission, mettreAJourPosition } from '../services/depannageApi';

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icône client (rouge)
const clientIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Icône dépanneuse (verte)
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
    const [distance, setDistance] = useState(null);
    const [eta, setEta] = useState(null);
    const [pathLayer, setPathLayer] = useState(null);
    const [depanneuseMarker, setDepanneuseMarker] = useState(null);
    const [missionActive, setMissionActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [trackingActive, setTrackingActive] = useState(false);
    const watchIdRef = useRef(null);

    const clientLat = parseFloat(demande.lat);
    const clientLng = parseFloat(demande.lng);
    const isMissionAcceptee = demande.statut === 'acceptee';
    const isMissionTerminee = demande.statut === 'terminee';

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
            
            // Marqueur client
            L.marker([clientLat, clientLng], { icon: clientIcon })
                .addTo(mapRef.current)
                .bindPopup(`
                    <div style="text-align:center; min-width:150px;">
                        <strong>👤 Client</strong><br/>
                        <b>${demande.client_prenom} ${demande.client_nom}</b><br/>
                        📞 ${demande.client_telephone || 'Pas de téléphone'}<br/>
                        🆔 Demande #${demande.id}<br/>
                        📍 ${clientLat.toFixed(4)}, ${clientLng.toFixed(4)}
                    </div>
                `)
                .openPopup();
        }
    }, [demande, clientLat, clientLng]);

    // Calculer et afficher le chemin avec Dijkstra
    const calculerEtAfficherChemin = useCallback(async (startPos, endPos) => {
        if (!mapRef.current) return;

        try {
            const result = calculateOptimalPath(startPos, endPos);
            setDistance(result.distance);
            setEta(estimateETA(result.distance));

            // Supprimer l'ancien chemin
            if (pathLayer) {
                mapRef.current.removeLayer(pathLayer);
            }

            // Tracer le nouveau chemin
            const leafletPoints = result.pathCoordinates.map(coord => [coord.lat, coord.lng]);
            const newPath = L.polyline(leafletPoints, {
                color: '#e94560',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10'
            }).addTo(mapRef.current);

            setPathLayer(newPath);

            // Ajuster la vue
            const bounds = newPath.getBounds();
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds);
            }

            return result;
        } catch (error) {
            console.error("Erreur calcul chemin:", error);
            // Fallback: ligne droite
            const points = [[startPos.lat, startPos.lng], [endPos.lat, endPos.lng]];
            const fallbackPath = L.polyline(points, { 
                color: '#e94560', 
                weight: 4,
                opacity: 0.8
            }).addTo(mapRef.current);
            setPathLayer(fallbackPath);
            return null;
        }
    }, [pathLayer]);

    // Mettre à jour la position de la dépanneuse
    const updateDepanneusePosition = useCallback(async (position) => {
        if (!mapRef.current) return;

        setDepanneusePos(position);

        if (depanneuseMarker) {
            depanneuseMarker.setLatLng([position.lat, position.lng]);
            depanneuseMarker.getPopup().setContent(`
                <div style="text-align:center">
                    <strong>🚛 Ma position</strong><br/>
                    📍 ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}<br/>
                    🎯 Distance: ${distance ? distance.toFixed(2) : '?'} km<br/>
                    ⏱️ ETA: ${eta ? eta : '?'} min
                </div>
            `);
        } else {
            const marker = L.marker([position.lat, position.lng], { icon: depanneuseIcon })
                .addTo(mapRef.current)
                .bindPopup(`
                    <div style="text-align:center">
                        <strong>🚛 Ma position</strong><br/>
                        📍 ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}
                    </div>
                `);
            setDepanneuseMarker(marker);
        }

        // Recalculer le chemin depuis la nouvelle position
        await calculerEtAfficherChemin(position, { lat: clientLat, lng: clientLng });

        // Envoyer la position au serveur
        if (missionActive && demande.id) {
            try {
                await mettreAJourPosition(demande.id, position.lat, position.lng);
            } catch (err) {
                console.error("Erreur envoi position:", err);
            }
        }
    }, [depanneuseMarker, calculerEtAfficherChemin, clientLat, clientLng, missionActive, demande.id, distance, eta]);

    // Démarrer le suivi GPS en temps réel
    const demarrerSuiviGPS = useCallback(() => {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur");
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
                if (error.code === 1) message = "Permission refusée. Activez la géolocalisation.";
                if (error.code === 2) message = "Position non disponible.";
                if (error.code === 3) message = "Délai d'attente dépassé.";
                alert(message);
                setTrackingActive(false);
            },
            { 
                enableHighAccuracy: true, 
                maximumAge: 0, 
                timeout: 5000 
            }
        );
    }, [updateDepanneusePosition]);

    // Arrêter le suivi GPS
    const arreterSuiviGPS = useCallback(() => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setTrackingActive(false);
    }, []);

    // Obtenir la position initiale
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

    // Accepter la mission
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
            console.error(err);
            alert("Erreur lors de l'acceptation: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Terminer la mission
    const handleTerminerMission = async () => {
        if (window.confirm('Confirmez-vous la fin de cette mission ?\n\nLe client sera notifié.')) {
            setLoading(true);
            try {
                await terminerMission(demande.id);
                arreterSuiviGPS();
                setMissionActive(false);
                if (onMissionUpdate) onMissionUpdate();
                alert("Mission terminée avec succès !");
            } catch (err) {
                console.error(err);
                alert("Erreur lors de la fin de mission: " + (err.response?.data?.error || err.message));
            } finally {
                setLoading(false);
            }
        }
    };

    // Nettoyage au démontage
    useEffect(() => {
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // Activer le suivi si la mission est déjà acceptée
    useEffect(() => {
        if (isMissionAcceptee && !missionActive) {
            setMissionActive(true);
            demarrerSuiviGPS();
        }
    }, [isMissionAcceptee, missionActive, demarrerSuiviGPS]);

    // Calculer l'ETA estimé
    const etaMinutes = eta ? eta : (distance ? Math.round(distance / 30 * 60) : 0);

    return (
        <div className="card">
            {/* En-tête de la mission */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <div>
                    <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faUser} style={{ color: '#e94560' }} />
                        {demande.client_prenom} {demande.client_nom}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>
                        <FontAwesomeIcon icon={faPhone} style={{ marginRight: '8px' }} />
                        {demande.client_telephone || 'Pas de téléphone'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '5px' }}>
                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '8px' }} />
                        Demandé le: {new Date(demande.date_demande).toLocaleString()}
                    </p>
                </div>
                <div>
                    {!isMissionAcceptee && !isMissionTerminee && (
                        <button 
                            onClick={handleAccepterMission}
                            disabled={loading}
                            style={{ 
                                backgroundColor: '#4caf50',
                                padding: '12px 24px',
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? (
                                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                            ) : (
                                <FontAwesomeIcon icon={faPlay} style={{ marginRight: '8px' }} />
                            )}
                            Accepter la mission
                        </button>
                    )}
                    {isMissionAcceptee && !isMissionTerminee && (
                        <button 
                            onClick={handleTerminerMission}
                            disabled={loading}
                            style={{ 
                                backgroundColor: '#2196f3',
                                padding: '12px 24px',
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? (
                                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                            ) : (
                                <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px' }} />
                            )}
                            Mission terminée
                        </button>
                    )}
                    {isMissionTerminee && (
                        <span style={{ 
                            backgroundColor: '#4caf50', 
                            padding: '10px 20px',
                            borderRadius: '8px',
                            color: 'white',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.9rem'
                        }}>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Mission terminée
                        </span>
                    )}
                </div>
            </div>

            {/* Contrôles GPS */}
            {isMissionAcceptee && !isMissionTerminee && (
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button 
                            onClick={demarrerSuiviGPS}
                            disabled={trackingActive}
                            style={{ 
                                backgroundColor: '#4caf50', 
                                padding: '8px 16px', 
                                fontSize: '13px',
                                opacity: trackingActive ? 0.6 : 1
                            }}
                        >
                            <FontAwesomeIcon icon={faPlay} style={{ marginRight: '6px' }} />
                            {trackingActive ? 'Suivi activé' : 'Démarrer suivi GPS'}
                        </button>
                        <button 
                            onClick={arreterSuiviGPS}
                            disabled={!trackingActive}
                            style={{ 
                                backgroundColor: '#f44336', 
                                padding: '8px 16px', 
                                fontSize: '13px',
                                opacity: !trackingActive ? 0.6 : 1
                            }}
                        >
                            <FontAwesomeIcon icon={faStop} style={{ marginRight: '6px' }} />
                            Arrêter suivi
                        </button>
                        <button 
                            onClick={() => {
                                if (depanneusePos) {
                                    calculerEtAfficherChemin(depanneusePos, { lat: clientLat, lng: clientLng });
                                }
                            }}
                            style={{ backgroundColor: '#2196f3', padding: '8px 16px', fontSize: '13px' }}
                        >
                            <FontAwesomeIcon icon={faRoute} style={{ marginRight: '6px' }} />
                            Recalculer le trajet (Dijkstra)
                        </button>
                    </div>
                    <p className="text-light" style={{ fontSize: '11px', marginTop: '8px' }}>
                        <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: '4px' }} />
                        Activez le suivi GPS pour mettre à jour votre position en temps réel
                    </p>
                </div>
            )}

            {/* Carte */}
            <div 
                id="depanneur-map" 
                style={{ 
                    height: '450px', 
                    width: '100%', 
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#1a1a2e'
                }} 
            />

            {/* Informations de trajet */}
            {(distance || eta) && (
                <div style={{ 
                    marginTop: '15px', 
                    padding: '15px',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {distance && (
                            <div>
                                <strong style={{ color: 'var(--text-light)' }}>📍 Distance optimale:</strong>
                                <span style={{ color: '#e94560', marginLeft: '8px', fontWeight: 'bold' }}>
                                    {formatDistance(distance)}
                                </span>
                            </div>
                        )}
                        {eta && (
                            <div>
                                <strong style={{ color: 'var(--text-light)' }}>⏱️ ETA estimé:</strong>
                                <span style={{ color: '#4caf50', marginLeft: '8px', fontWeight: 'bold' }}>
                                    {formatTime(eta)}
                                </span>
                            </div>
                        )}
                        {depanneusePos && (
                            <div>
                                <strong style={{ color: 'var(--text-light)' }}>🚛 Ma position:</strong>
                                <span style={{ color: '#ff9800', marginLeft: '8px', fontSize: '12px' }}>
                                    {depanneusePos.lat.toFixed(4)}, {depanneusePos.lng.toFixed(4)}
                                </span>
                            </div>
                        )}
                        <div>
                            <strong style={{ color: 'var(--text-light)' }}>🔬 Algorithme:</strong>
                            <span style={{ color: '#2196f3', marginLeft: '8px' }}>
                                Dijkstra - Plus court chemin
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Ajout de l'import manquant
import { faUser } from '@fortawesome/free-solid-svg-icons';

export default DepanneurMap;