// frontend/src/services/dijkstra.js

/**
 * Implémentation de l'algorithme de Dijkstra pour trouver le chemin le plus court
 * dans un graphe routier entre la dépanneuse et le client
 */

/**
 * Classe représentant un graphe pour l'algorithme de Dijkstra
 */
class Graph {
    constructor() {
        this.nodes = new Map(); // Stocke les nœuds du graphe
    }

    /**
     * Ajoute un nœud au graphe
     * @param {string} id - Identifiant unique du nœud
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     */
    addNode(id, lat, lng) {
        if (!this.nodes.has(id)) {
            this.nodes.set(id, {
                id: id,
                lat: lat,
                lng: lng,
                neighbors: new Map() // { nodeId: distance }
            });
        }
    }

    /**
     * Ajoute une arête (connexion) entre deux nœuds
     * @param {string} node1Id - Premier nœud
     * @param {string} node2Id - Second nœud
     * @param {number} distance - Distance en kilomètres
     */
    addEdge(node1Id, node2Id, distance) {
        // Vérifier que les nœuds existent
        if (!this.nodes.has(node1Id)) {
            throw new Error(`Nœud ${node1Id} inexistant`);
        }
        if (!this.nodes.has(node2Id)) {
            throw new Error(`Nœud ${node2Id} inexistant`);
        }

        // Ajouter la connexion dans les deux sens (graphe non orienté)
        this.nodes.get(node1Id).neighbors.set(node2Id, distance);
        this.nodes.get(node2Id).neighbors.set(node1Id, distance);
    }

    /**
     * Algorithme de Dijkstra - Trouve le plus court chemin
     * @param {string} startId - Identifiant du nœud de départ
     * @param {string} endId - Identifiant du nœud d'arrivée
     * @returns {Object} - { distance, path, nodes }
     */
    dijkstra(startId, endId) {
        // Vérifier que les nœuds existent
        if (!this.nodes.has(startId)) {
            throw new Error(`Nœud de départ ${startId} inexistant`);
        }
        if (!this.nodes.has(endId)) {
            throw new Error(`Nœud d'arrivée ${endId} inexistant`);
        }

        // Initialisation
        const distances = new Map();      // Distance minimale connue pour chaque nœud
        const previous = new Map();       // Nœud précédent dans le chemin optimal
        const unvisited = new Set();      // Ensemble des nœuds non visités

        // Initialiser tous les nœuds avec une distance infinie
        for (const nodeId of this.nodes.keys()) {
            distances.set(nodeId, Infinity);
            previous.set(nodeId, null);
            unvisited.add(nodeId);
        }

        // Distance du nœud de départ = 0
        distances.set(startId, 0);

        while (unvisited.size > 0) {
            // Trouver le nœud non visité avec la plus petite distance
            let currentId = null;
            let minDistance = Infinity;

            for (const nodeId of unvisited) {
                const dist = distances.get(nodeId);
                if (dist < minDistance) {
                    minDistance = dist;
                    currentId = nodeId;
                }
            }

            // Si on a atteint le nœud d'arrivée ou plus de nœuds accessibles
            if (currentId === null || currentId === endId) {
                break;
            }

            // Retirer le nœud courant de l'ensemble des non-visités
            unvisited.delete(currentId);

            // Mettre à jour les distances des voisins
            const currentNode = this.nodes.get(currentId);
            const neighbors = currentNode.neighbors;

            for (const [neighborId, weight] of neighbors) {
                if (unvisited.has(neighborId)) {
                    const newDistance = distances.get(currentId) + weight;
                    if (newDistance < distances.get(neighborId)) {
                        distances.set(neighborId, newDistance);
                        previous.set(neighborId, currentId);
                    }
                }
            }
        }

        // Reconstruire le chemin
        const path = [];
        let current = endId;
        
        while (current !== null && current !== undefined) {
            path.unshift(current);
            current = previous.get(current);
        }

        // Récupérer les coordonnées du chemin
        const pathCoordinates = path.map(nodeId => {
            const node = this.nodes.get(nodeId);
            return { lat: node.lat, lng: node.lng };
        });

        return {
            distance: distances.get(endId),
            path: path,
            pathCoordinates: pathCoordinates,
            nodesCount: path.length,
            success: distances.get(endId) !== Infinity
        };
    }

    /**
     * Calcule la distance Haversine entre deux points
     * @param {number} lat1 - Latitude point 1
     * @param {number} lng1 - Longitude point 1
     * @param {number} lat2 - Latitude point 2
     * @param {number} lng2 - Longitude point 2
     * @returns {number} Distance en kilomètres
     */
    static haversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Trouve le nœud le plus proche d'une position GPS
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Object} - { nodeId, distance, node }
     */
    findNearestNode(lat, lng) {
        let nearestNodeId = null;
        let minDistance = Infinity;
        let nearestNodeData = null;

        for (const [nodeId, nodeData] of this.nodes) {
            const distance = Graph.haversineDistance(lat, lng, nodeData.lat, nodeData.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearestNodeId = nodeId;
                nearestNodeData = nodeData;
            }
        }

        return {
            nodeId: nearestNodeId,
            distance: minDistance,
            node: nearestNodeData
        };
    }

    /**
     * Affiche les informations du graphe (debug)
     */
    display() {
        console.log("=== GRA PHE ROUTIER ===");
        for (const [nodeId, nodeData] of this.nodes) {
            console.log(`Nœud ${nodeId} (${nodeData.lat}, ${nodeData.lng})`);
            console.log(`  Connexions:`);
            for (const [neighborId, distance] of nodeData.neighbors) {
                console.log(`    → ${neighborId}: ${distance.toFixed(2)} km`);
            }
        }
    }
}

/**
 * Crée le graphe routier de la zone du garage
 * @returns {Graph} - Graphe initialisé avec les routes
 */
export const createRoadGraph = () => {
    const graph = new Graph();

    // Définition des nœuds (points d'intérêt / intersections)
    // Coordonnées approximatives de Paris (garage)
    const nodes = [
        { id: 'garage', lat: 48.8566, lng: 2.3522, name: 'Garage Pro' },
        { id: 'node_1', lat: 48.8600, lng: 2.3550, name: 'Carrefour A' },
        { id: 'node_2', lat: 48.8620, lng: 2.3480, name: 'Carrefour B' },
        { id: 'node_3', lat: 48.8550, lng: 2.3450, name: 'Carrefour C' },
        { id: 'node_4', lat: 48.8500, lng: 2.3580, name: 'Carrefour D' },
        { id: 'node_5', lat: 48.8650, lng: 2.3650, name: 'Carrefour E' },
        { id: 'node_6', lat: 48.8580, lng: 2.3400, name: 'Carrefour F' },
        { id: 'node_7', lat: 48.8520, lng: 2.3620, name: 'Carrefour G' },
        { id: 'node_8', lat: 48.8680, lng: 2.3580, name: 'Carrefour H' }
    ];

    // Ajouter tous les nœuds
    nodes.forEach(node => {
        graph.addNode(node.id, node.lat, node.lng);
    });

    // Ajouter les connexions (routes)
    // Format: (node1, node2, distance_en_km)
    const edges = [
        ['garage', 'node_1', Graph.haversineDistance(48.8566, 2.3522, 48.8600, 2.3550)],
        ['garage', 'node_2', Graph.haversineDistance(48.8566, 2.3522, 48.8620, 2.3480)],
        ['garage', 'node_3', Graph.haversineDistance(48.8566, 2.3522, 48.8550, 2.3450)],
        ['node_1', 'node_2', Graph.haversineDistance(48.8600, 2.3550, 48.8620, 2.3480)],
        ['node_1', 'node_5', Graph.haversineDistance(48.8600, 2.3550, 48.8650, 2.3650)],
        ['node_2', 'node_3', Graph.haversineDistance(48.8620, 2.3480, 48.8550, 2.3450)],
        ['node_2', 'node_6', Graph.haversineDistance(48.8620, 2.3480, 48.8580, 2.3400)],
        ['node_3', 'node_4', Graph.haversineDistance(48.8550, 2.3450, 48.8500, 2.3580)],
        ['node_3', 'node_6', Graph.haversineDistance(48.8550, 2.3450, 48.8580, 2.3400)],
        ['node_4', 'node_5', Graph.haversineDistance(48.8500, 2.3580, 48.8650, 2.3650)],
        ['node_4', 'node_7', Graph.haversineDistance(48.8500, 2.3580, 48.8520, 2.3620)],
        ['node_5', 'node_8', Graph.haversineDistance(48.8650, 2.3650, 48.8680, 2.3580)],
        ['node_6', 'node_7', Graph.haversineDistance(48.8580, 2.3400, 48.8520, 2.3620)],
        ['node_7', 'node_8', Graph.haversineDistance(48.8520, 2.3620, 48.8680, 2.3580)]
    ];

    edges.forEach(edge => {
        graph.addEdge(edge[0], edge[1], edge[2]);
    });

    return graph;
};

/**
 * Calcule le chemin optimal entre la dépanneuse et le client
 * @param {Object} depanneusePos - Position de la dépanneuse {lat, lng}
 * @param {Object} clientPos - Position du client {lat, lng}
 * @returns {Object} - Résultat du chemin optimal
 */
export const calculateOptimalPath = (depanneusePos, clientPos) => {
    const graph = createRoadGraph();
    
    // Trouver les nœuds les plus proches
    const startNode = graph.findNearestNode(depanneusePos.lat, depanneusePos.lng);
    const endNode = graph.findNearestNode(clientPos.lat, clientPos.lng);
    
    console.log('Départ le plus proche:', startNode.nodeId, `(${startNode.distance.toFixed(2)} km)`);
    console.log('Arrivée la plus proche:', endNode.nodeId, `(${endNode.distance.toFixed(2)} km)`);
    
    // Si les nœuds sont les mêmes, distance directe
    if (startNode.nodeId === endNode.nodeId) {
        const directDistance = Graph.haversineDistance(
            depanneusePos.lat, depanneusePos.lng,
            clientPos.lat, clientPos.lng
        );
        
        return {
            distance: directDistance,
            path: [startNode.nodeId],
            pathCoordinates: [
                { lat: depanneusePos.lat, lng: depanneusePos.lng },
                { lat: clientPos.lat, lng: clientPos.lng }
            ],
            nodesCount: 2,
            success: true,
            startNodeDistance: startNode.distance,
            endNodeDistance: endNode.distance,
            isDirect: true
        };
    }
    
    // Exécuter Dijkstra sur le graphe routier
    const result = graph.dijkstra(startNode.nodeId, endNode.nodeId);
    
    if (!result.success) {
        console.warn('Aucun chemin trouvé dans le graphe, utilisation de la ligne droite');
        const directDistance = Graph.haversineDistance(
            depanneusePos.lat, depanneusePos.lng,
            clientPos.lat, clientPos.lng
        );
        
        return {
            distance: directDistance,
            path: [],
            pathCoordinates: [
                { lat: depanneusePos.lat, lng: depanneusePos.lng },
                { lat: clientPos.lat, lng: clientPos.lng }
            ],
            nodesCount: 2,
            success: true,
            isFallback: true
        };
    }
    
    return {
        distance: result.distance,
        path: result.path,
        pathCoordinates: result.pathCoordinates,
        nodesCount: result.nodesCount,
        success: true,
        startNodeDistance: startNode.distance,
        endNodeDistance: endNode.distance,
        isDirect: false
    };
};

/**
 * Calcule le chemin avec points intermédiaires pour l'affichage Leaflet
 * @param {Object} depanneusePos - Position de la dépanneuse
 * @param {Object} clientPos - Position du client
 * @returns {Array} - Tableau de points [lat, lng] pour le tracé Leaflet
 */
export const getPathForLeaflet = (depanneusePos, clientPos) => {
    const result = calculateOptimalPath(depanneusePos, clientPos);
    
    // Convertir les coordonnées au format Leaflet [lat, lng]
    const leafletPath = result.pathCoordinates.map(coord => [coord.lat, coord.lng]);
    
    return {
        path: leafletPath,
        distance: result.distance,
        details: result
    };
};

/**
 * Estime le temps d'arrivée en fonction de la distance
 * @param {number} distance - Distance en kilomètres
 * @param {number} speed - Vitesse moyenne en km/h (défaut: 30 km/h en ville)
 * @returns {number} - Temps en minutes
 */
export const estimateETA = (distance, speed = 30) => {
    const hours = distance / speed;
    const minutes = Math.round(hours * 60);
    return minutes;
};

/**
 * Formate la distance pour l'affichage
 * @param {number} distance - Distance en kilomètres
 * @returns {string} - Distance formatée
 */
export const formatDistance = (distance) => {
    if (distance < 1) {
        return `${(distance * 1000).toFixed(0)} m`;
    }
    return `${distance.toFixed(2)} km`;
};

/**
 * Formate le temps pour l'affichage
 * @param {number} minutes - Temps en minutes
 * @returns {string} - Temps formaté
 */
export const formatTime = (minutes) => {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
};

// Export de la classe Graph pour utilisation avancée
export { Graph };

// Export par défaut des fonctions principales
export default {
    createRoadGraph,
    calculateOptimalPath,
    getPathForLeaflet,
    estimateETA,
    formatDistance,
    formatTime,
    Graph
};