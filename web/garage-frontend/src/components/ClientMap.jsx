// frontend/src/components/ClientMap.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ClientMap({ position, demandeId }) {
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (!position) return;

        if (!mapRef.current) {
            mapRef.current = L.map('client-map').setView([position.lat, position.lng], 15);
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            }).addTo(mapRef.current);
        } else {
            mapRef.current.setView([position.lat, position.lng], 15);
        }

        if (markerRef.current) {
            markerRef.current.setLatLng([position.lat, position.lng]);
        } else {
            markerRef.current = L.marker([position.lat, position.lng])
                .addTo(mapRef.current)
                .bindPopup(`
                    <b>📍 Votre position</b><br/>
                    Lat: ${position.lat.toFixed(6)}<br/>
                    Lng: ${position.lng.toFixed(6)}<br/>
                    ${demandeId ? `Demande #${demandeId}` : ''}
                `)
                .openPopup();
        }

        if (position.accuracy) {
            L.circle([position.lat, position.lng], {
                radius: position.accuracy,
                color: '#e94560',
                fillColor: '#e94560',
                fillOpacity: 0.1
            }).addTo(mapRef.current);
        }

    }, [position, demandeId]);

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>📍 Votre position GPS</h3>
            <div 
                id="client-map" 
                style={{ 
                    height: '350px', 
                    width: '100%', 
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)'
                }} 
            />
            {position && (
                <p className="text-light" style={{ marginTop: '10px', fontSize: '12px' }}>
                    Latitude: {position.lat.toFixed(6)} | Longitude: {position.lng.toFixed(6)}
                    {position.accuracy && ` | Précision: ±${Math.round(position.accuracy)}m`}
                </p>
            )}
        </div>
    );
}

export default ClientMap;