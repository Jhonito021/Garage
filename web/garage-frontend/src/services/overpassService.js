// frontend/src/services/overpassService.js

const OVERPASS_URL = 'https://overpass.kumi.systems/api/interpreter';

/**
 * Récupère les données routières autour d'un point GPS
 * @param {number} lat - Latitude du centre
 * @param {number} lng - Longitude du centre
 * @param {number} radius - Rayon en mètres (défaut: 3000m)
 * @returns {Promise<Object>} - Nœuds et arêtes du graphe routier
 */
export const fetchRoadsForDijkstra = async (lat, lng, radius = 3000) => {
    const query = `
        [out:json];
        (
            way(around:${radius}, ${lat}, ${lng})["highway"];
            node(w);
        );
        (._;>;);
        out body;
    `;
    
    try {
        console.log('Fetching roads from Overpass...');
        const response = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Roads fetched: ${data.elements.length} elements`);
        return parseOSMToGraph(data);
        
    } catch (error) {
        console.error('Erreur Overpass API:', error);
        return null;
    }
};

/**
 * Parse les données OSM en graphe utilisable par Dijkstra
 */
const parseOSMToGraph = (osmData) => {
    const nodes = new Map();
    const edges = [];
    
    // Extraire les nœuds
    osmData.elements.forEach(element => {
        if (element.type === 'node') {
            nodes.set(element.id, {
                id: element.id,
                lat: element.lat,
                lng: element.lon
            });
        }
    });
    
    // Extraire les connexions (ways)
    osmData.elements.forEach(element => {
        if (element.type === 'way' && element.nodes && element.tags && element.tags.highway) {
            const roadType = element.tags.highway;
            const roadName = element.tags.name || 'Route sans nom';
            
            for (let i = 0; i < element.nodes.length - 1; i++) {
                const node1 = nodes.get(element.nodes[i]);
                const node2 = nodes.get(element.nodes[i + 1]);
                
                if (node1 && node2) {
                    const distance = calculateHaversineDistance(node1.lat, node1.lng, node2.lat, node2.lng);
                    edges.push({
                        from: node1.id,
                        to: node2.id,
                        fromLat: node1.lat,
                        fromLng: node1.lng,
                        toLat: node2.lat,
                        toLng: node2.lng,
                        distance: distance,
                        roadType: roadType,
                        roadName: roadName
                    });
                }
            }
        }
    });
    
    console.log(`Parsed: ${nodes.size} nodes, ${edges.length} edges`);
    
    return { 
        nodes: Array.from(nodes.values()), 
        edges: edges,
        nodeCount: nodes.size,
        edgeCount: edges.length
    };
};

/**
 * Calcule la distance Haversine entre deux points
 */
const calculateHaversineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

/**
 * Recherche les garages à proximité
 */
export const fetchNearbyGarages = async (lat, lng, radius = 5000) => {
    const query = `
        [out:json];
        (
            node(around:${radius}, ${lat}, ${lng})["amenity"="garage"];
            way(around:${radius}, ${lat}, ${lng})["amenity"="garage"];
        );
        out body;
    `;
    
    try {
        const response = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        return data.elements.map(element => ({
            id: element.id,
            lat: element.lat,
            lng: element.lon,
            name: element.tags?.name || 'Garage',
            phone: element.tags?.phone || null,
            openingHours: element.tags?.opening_hours || null
        }));
    } catch (error) {
        console.error('Erreur recherche garages:', error);
        return [];
    }
};

/**
 * Récupère les informations détaillées d'une route
 */
export const getRoadDetails = async (wayId) => {
    const query = `
        [out:json];
        way(${wayId});
        out body;
        >;
        out skel;
    `;
    
    try {
        const response = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur récupération route:', error);
        return null;
    }
};