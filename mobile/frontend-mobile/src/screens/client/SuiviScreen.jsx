// frontend-mobile/src/screens/client/SuiviScreen.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function SuiviScreen() {
  const [interventions, setInterventions] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [userId, setUserId] = useState(null);

  const fetchInterventions = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        console.log('Aucun utilisateur connecté');
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      setUserId(user.id);
      
      console.log('Fetching interventions for client:', user.id);
      
      // CORRECTION: Ajouter client_id en paramètre
      const response = await api.get(`/suivi/interventions?client_id=${user.id}`);
      console.log('Réponse:', response);
      
      if (response.status === 200 && Array.isArray(response.data)) {
        setInterventions(response.data);
        applyFilter(response.data, filter);
      } else {
        setInterventions([]);
        setFilteredInterventions([]);
      }
    } catch (err) {
      console.error('Erreur fetchInterventions:', err);
      setInterventions([]);
      setFilteredInterventions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  useEffect(() => {
    applyFilter(interventions, filter);
  }, [filter, interventions]);

  const applyFilter = (data, selectedFilter) => {
    if (selectedFilter === 'all') {
      setFilteredInterventions(data);
    } else if (selectedFilter === 'en_cours') {
      setFilteredInterventions(data.filter(i => i.statut === 'en_cours'));
    } else if (selectedFilter === 'en_attente') {
      setFilteredInterventions(data.filter(i => i.statut === 'prévue' || !i.statut));
    } else if (selectedFilter === 'terminee') {
      setFilteredInterventions(data.filter(i => i.statut === 'terminée'));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInterventions();
  };

  const getStats = () => {
    const total = interventions.length;
    const enCours = interventions.filter(i => i.statut === 'en_cours').length;
    const terminees = interventions.filter(i => i.statut === 'terminée').length;
    const enAttente = interventions.filter(i => i.statut === 'prévue' || !i.statut).length;
    return { total, enCours, terminees, enAttente };
  };

  const getStatusIcon = (statut) => {
    switch(statut) {
      case 'terminée':
        return <Ionicons name="checkmark-circle" size={20} color="#4caf50" />;
      case 'en_cours':
        return <Ionicons name="play-circle" size={20} color="#ff9800" />;
      case 'prévue':
        return <Ionicons name="hourglass" size={20} color="#2196f3" />;
      default:
        return <Ionicons name="hourglass" size={20} color="#aaaaaa" />;
    }
  };

  const getStatusText = (statut) => {
    switch(statut) {
      case 'terminée':
        return 'Terminée';
      case 'en_cours':
        return 'En cours';
      case 'prévue':
        return 'En attente';
      default:
        return statut || 'En attente';
    }
  };

  const getStatusColor = (statut) => {
    switch(statut) {
      case 'terminée':
        return '#4caf50';
      case 'en_cours':
        return '#ff9800';
      case 'prévue':
        return '#2196f3';
      default:
        return '#aaaaaa';
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#ff9800' }]}>{stats.enCours}</Text>
          <Text style={styles.statLabel}>En cours</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#2196f3' }]}>{stats.enAttente}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#4caf50' }]}>{stats.terminees}</Text>
          <Text style={styles.statLabel}>Terminées</Text>
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Toutes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'en_cours' && styles.filterActive]}
          onPress={() => setFilter('en_cours')}
        >
          <Text style={[styles.filterText, filter === 'en_cours' && styles.filterTextActive]}>En cours</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'en_attente' && styles.filterActive]}
          onPress={() => setFilter('en_attente')}
        >
          <Text style={[styles.filterText, filter === 'en_attente' && styles.filterTextActive]}>En attente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'terminee' && styles.filterActive]}
          onPress={() => setFilter('terminee')}
        >
          <Text style={[styles.filterText, filter === 'terminee' && styles.filterTextActive]}>Terminées</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des interventions filtrées */}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredInterventions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="map" size={50} color="#aaaaaa" />
            <Text style={styles.emptyText}>Aucune intervention trouvée</Text>
          </View>
        ) : (
          filteredInterventions.map((i) => (
            <View key={i.id} style={[styles.card, { borderLeftColor: getStatusColor(i.statut), borderLeftWidth: 4 }]}>
              <View style={styles.cardHeader}>
                {getStatusIcon(i.statut)}
                <Text style={[styles.statusText, { color: getStatusColor(i.statut) }]}>
                  {getStatusText(i.statut)}
                </Text>
              </View>
              
              <Text style={styles.vehicleName}>
                <Ionicons name="car" size={14} color="#aaaaaa" /> {i.marque} {i.modele} - {i.immatriculation}
              </Text>
              
              <Text style={styles.description}>
                <Ionicons name="build" size={14} color="#aaaaaa" /> {i.description || 'Intervention en cours'}
              </Text>
              
              <Text style={styles.date}>
                <Ionicons name="calendar" size={14} color="#aaaaaa" /> 
                Début: {i.date_debut ? new Date(i.date_debut).toLocaleString('fr-FR') : 'Non démarrée'}
              </Text>
              
              {i.date_fin && (
                <Text style={styles.date}>
                  <Ionicons name="checkmark-circle" size={14} color="#4caf50" /> 
                  Fin: {new Date(i.date_fin).toLocaleString('fr-FR')}
                </Text>
              )}
              
              {i.duree_totale && (
                <Text style={styles.duree}>
                  <Ionicons name="time" size={14} color="#aaaaaa" /> 
                  Durée: {i.duree_totale} minutes
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#aaaaaa',
    marginTop: 10,
  },
  content: {
    padding: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 10,
    paddingHorizontal: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e94560',
  },
  statLabel: {
    fontSize: 11,
    color: '#aaaaaa',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterActive: {
    backgroundColor: '#e94560',
  },
  filterText: {
    fontSize: 12,
    color: '#e94560',
  },
  filterTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  vehicleName: {
    color: '#f5f5f5',
    fontSize: 14,
    marginBottom: 8,
  },
  description: {
    color: '#aaaaaa',
    fontSize: 14,
    marginBottom: 8,
  },
  date: {
    color: '#aaaaaa',
    fontSize: 12,
    marginBottom: 4,
  },
  duree: {
    color: '#aaaaaa',
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#aaaaaa',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
});