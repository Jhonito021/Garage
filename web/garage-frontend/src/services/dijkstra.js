// frontend/src/services/dijkstra.js
import { fetchRoadsForDijkstra } from './overpassService';

//Graphe pour l'algorithme de Dijkstra
class Graph {
    constructor() {
        this.nodes = new Map();
    }

    addNode(id, lat, lng) {
        if (!this.nodes.has(id)) {
            this.nodes.set(id, {
                id: id,
                lat: lat,
                lng: lng,
                neighbors: new Map()
            });
        }
    }

    addEdge(node1Id, node2Id, distance, roadType = null, roadName = null) {
        if (!this.nodes.has(node1Id) || !this.nodes.has(node2Id)) {
            return;
        }
        
        const edgeData = { distance, roadType, roadName };
        this.nodes.get(node1Id).neighbors.set(node2Id, edgeData);
        this.nodes.get(node2Id).neighbors.set(node1Id, edgeData);
    }

    //Algorithme de Dijkstra
    dijkstra(startId, endId) {
        if (!this.nodes.has(startId) || !this.nodes.has(endId)) {
            return { distance: Infinity, path: [], success: false };
        }

        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();
        
        for (const nodeId of this.nodes.keys()) {
            distances.set(nodeId, Infinity);
            previous.set(nodeId, null);
            unvisited.add(nodeId);
        }
        distances.set(startId, 0);

        while (unvisited.size > 0) {
            let currentId = null;
            let minDistance = Infinity;

            for (const nodeId of unvisited) {
                const dist = distances.get(nodeId);
                if (dist < minDistance) {
                    minDistance = dist;
                    currentId = nodeId;
                }
            }

            if (currentId === null || currentId === endId) break;
            
            unvisited.delete(currentId);

            // Mettre à jour les distances des voisins
            const neighbors = this.nodes.get(currentId).neighbors;
            for (const [neighborId, edgeData] of neighbors) {
                if (unvisited.has(neighborId)) {
                    const newDistance = distances.get(currentId) + edgeData.distance;
                    if (newDistance < distances.get(neighborId)) {
                        distances.set(neighborId, newDistance);
                        previous.set(neighborId, { node: currentId, roadInfo: edgeData });
                    }
                }
            }
        }

        // Reconstruire le chemin
        const path = [];
        const roadInfos = [];
        let current = endId;
        
        while (current !== null && current !== undefined) {
            path.unshift(current);
            const prev = previous.get(current);
            if (prev) {
                roadInfos.unshift(prev.roadInfo);
                current = prev.node;
            } else {
                current = null;
            }
        }

        const pathCoordinates = path.map(nodeId => {
            const node = this.nodes.get(nodeId);
            return { lat: node.lat, lng: node.lng };
        });

        return {
            distance: distances.get(endId),
            path: path,
            pathCoordinates: pathCoordinates,
            roadInfos: roadInfos,
            nodesCount: path.length,
            success: distances.get(endId) !== Infinity
        };
    } // Algorithme de Dijkstra (Algo Avancé)

    findNearestNode(lat, lng) {
        let nearestId = null;
        let minDistance = Infinity;
        let nearestNode = null;

        for (const [nodeId, nodeData] of this.nodes) {
            const distance = this.haversineDistance(lat, lng, nodeData.lat, nodeData.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearestId = nodeId;
                nearestNode = nodeData;
            }
        }

        return { nodeId: nearestId, distance: minDistance, node: nearestNode };
    }

    haversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
}

/**
 * Crée un graphe à partir des données Overpass
 */
export const createGraphFromRoads = async (centerLat, centerLng, radius = 3000) => {
    console.log('Creating graph from Overpass data...');
    const roadData = await fetchRoadsForDijkstra(centerLat, centerLng, radius);
    
    if (!roadData) {
        console.log('No data from Overpass, using fallback graph');
        return createFallbackGraph();
    }
    
    const graph = new Graph();
    
    // Ajouter les nœuds
    roadData.nodes.forEach(node => {
        graph.addNode(node.id, node.lat, node.lng);
    });
    
    // Ajouter les arêtes
    roadData.edges.forEach(edge => {
        graph.addEdge(edge.from, edge.to, edge.distance, edge.roadType, edge.roadName);
    });
    
    console.log(`Graph created: ${graph.nodes.size} nodes, ${roadData.edges.length} edges`);
    return graph;
};

/**
 * Graphe de secours (si Overpass échoue)
 */
const createFallbackGraph = () => {
    const graph = new Graph();
    
    // Nœuds simulés
    const nodes = [
        { id: 'garage', lat: 48.8566, lng: 2.3522 },
        { id: 'node1', lat: 48.8600, lng: 2.3550 },
        { id: 'node2', lat: 48.8620, lng: 2.3480 },
        { id: 'node3', lat: 48.8550, lng: 2.3450 },
        { id: 'node4', lat: 48.8500, lng: 2.3580 },
        { id: 'node5', lat: 48.8650, lng: 2.3650 },
    ];
    
    nodes.forEach(node => {
        graph.addNode(node.id, node.lat, node.lng);
    });
    
    // Connexions
    graph.addEdge('garage', 'node1', graph.haversineDistance(48.8566, 2.3522, 48.8600, 2.3550));
    graph.addEdge('garage', 'node2', graph.haversineDistance(48.8566, 2.3522, 48.8620, 2.3480));
    graph.addEdge('node1', 'node3', graph.haversineDistance(48.8600, 2.3550, 48.8550, 2.3450));
    graph.addEdge('node2', 'node3', graph.haversineDistance(48.8620, 2.3480, 48.8550, 2.3450));
    graph.addEdge('node3', 'node4', graph.haversineDistance(48.8550, 2.3450, 48.8500, 2.3580));
    graph.addEdge('node4', 'node5', graph.haversineDistance(48.8500, 2.3580, 48.8650, 2.3650));
    graph.addEdge('node1', 'node5', graph.haversineDistance(48.8600, 2.3550, 48.8650, 2.3650));
    
    return graph;
};

/**
 * Calcule le chemin optimal avec données réelles Overpass
 */
export const calculateOptimalPathWithRealRoads = async (startPos, endPos, radius = 5000) => {
    const centerLat = (startPos.lat + endPos.lat) / 2;
    const centerLng = (startPos.lng + endPos.lng) / 2;
    
    const graph = await createGraphFromRoads(centerLat, centerLng, radius);
    
    const startNode = graph.findNearestNode(startPos.lat, startPos.lng);
    const endNode = graph.findNearestNode(endPos.lat, endPos.lng);
    
    if (!startNode.nodeId || !endNode.nodeId) {
        return null;
    }
    
    const result = graph.dijkstra(startNode.nodeId, endNode.nodeId);
    
    return {
        distance: result.distance,
        path: result.pathCoordinates,
        roadInfos: result.roadInfos,
        nodesCount: result.nodesCount,
        success: result.success,
        startNodeDistance: startNode.distance,
        endNodeDistance: endNode.distance
    };
};

/**
 * Fonction de compatibilité avec l'existant
 */
export const calculateOptimalPath = (startPos, endPos) => {
    // Version fallback pour compatibilité
    const graph = createFallbackGraph();
    const startNode = graph.findNearestNode(startPos.lat, startPos.lng);
    const endNode = graph.findNearestNode(endPos.lat, endPos.lng);
    const result = graph.dijkstra(startNode.nodeId, endNode.nodeId);
    
    return {
        distance: result.distance,
        pathCoordinates: result.pathCoordinates,
        nodesCount: result.nodesCount,
        success: result.success
    };
};

export const estimateETA = (distance, speed = 30) => {
    const hours = distance / speed;
    return Math.round(hours * 60);
};

export const formatDistance = (distance) => {
    if (distance < 1) {
        return `${(distance * 1000).toFixed(0)} m`;
    }
    return `${distance.toFixed(2)} km`;
};

export const formatTime = (minutes) => {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
};