// frontend-mobile/src/screens/technicien/TechnicienInterventionsScreen.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function TechnicienInterventionsScreen({ navigation }) {
  const [interventions, setInterventions] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    terminees: 0,
    en_cours: 0,
    a_venir: 0
  });

  const fetchInterventions = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        console.log('Aucun utilisateur connecté');
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      console.log('Technicien connecté:', user.id);
      
      // Appel API comme dans la version web
      const response = await api.get(`/interventions?user_id=${user.id}`);
      console.log('Réponse API:', response);
      
      let data = [];
      if (response.data && response.data.data) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      setInterventions(data);
      applyFilter(data, filter);
      
      // Calculer les statistiques
      const terminees = data.filter(i => i.statut === 'terminee').length;
      const enCours = data.filter(i => i.statut === 'en_cours').length;
      const aVenir = data.filter(i => i.statut === 'en_attente' || i.statut === 'acceptee').length;
      
      setStats({
        total: data.length,
        terminees,
        en_cours: enCours,
        a_venir: aVenir
      });
      
    } catch (error) {
      console.error('Erreur fetchInterventions:', error);
      Alert.alert('Erreur', 'Impossible de charger les interventions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (data, selectedFilter) => {
    if (selectedFilter === 'all') {
      setFilteredInterventions(data);
    } else if (selectedFilter === 'en_cours') {
      setFilteredInterventions(data.filter(i => i.statut === 'en_cours'));
    } else if (selectedFilter === 'en_attente') {
      setFilteredInterventions(data.filter(i => i.statut === 'en_attente' || i.statut === 'acceptee'));
    } else if (selectedFilter === 'terminee') {
      setFilteredInterventions(data.filter(i => i.statut === 'terminee'));
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  useEffect(() => {
    applyFilter(interventions, filter);
  }, [filter, interventions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInterventions();
  };

  const handleStartIntervention = async (id) => {
    Alert.alert(
      'Démarrer',
      'Confirmez-vous le début de cette intervention ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Démarrer',
          onPress: async () => {
            try {
              const userData = await AsyncStorage.getItem('user');
              const user = JSON.parse(userData);
              await api.put(`/interventions/${id}/demarrer?user_id=${user.id}`);
              fetchInterventions();
              Alert.alert('Succès', 'Intervention démarrée');
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de démarrer');
            }
          }
        }
      ]
    );
  };

  const handleCompleteIntervention = async (id) => {
    Alert.alert(
      'Terminer',
      'Confirmez-vous la fin de cette intervention ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          onPress: async () => {
            try {
              const userData = await AsyncStorage.getItem('user');
              const user = JSON.parse(userData);
              await api.put(`/interventions/${id}/terminer?user_id=${user.id}`);
              fetchInterventions();
              Alert.alert('Succès', 'Intervention terminée');
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de terminer');
            }
          }
        }
      ]
    );
  };

  const getStatusIcon = (statut) => {
    switch(statut) {
      case 'terminee': 
        return <Ionicons name="checkmark-circle" size={20} color="#4caf50" />;
      case 'en_cours': 
        return <Ionicons name="play-circle" size={20} color="#ff9800" />;
      default: 
        return <Ionicons name="time" size={20} color="#2196f3" />;
    }
  };

  const getStatusText = (statut) => {
    switch(statut) {
      case 'terminee': return 'Terminée';
      case 'en_cours': return 'En cours';
      default: return 'À venir';
    }
  };

  const getStatusColor = (statut) => {
    switch(statut) {
      case 'terminee': return '#4caf50';
      case 'en_cours': return '#ff9800';
      default: return '#2196f3';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>Chargement des interventions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cartes statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#ff9800' }]}>{stats.en_cours}</Text>
          <Text style={styles.statLabel}>En cours</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#2196f3' }]}>{stats.a_venir}</Text>
          <Text style={styles.statLabel}>À venir</Text>
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
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Toutes ({interventions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'en_attente' && styles.filterActive]}
          onPress={() => setFilter('en_attente')}
        >
          <Text style={[styles.filterText, filter === 'en_attente' && styles.filterTextActive]}>
            À venir
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'en_cours' && styles.filterActive]}
          onPress={() => setFilter('en_cours')}
        >
          <Text style={[styles.filterText, filter === 'en_cours' && styles.filterTextActive]}>
            En cours
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'terminee' && styles.filterActive]}
          onPress={() => setFilter('terminee')}
        >
          <Text style={[styles.filterText, filter === 'terminee' && styles.filterTextActive]}>
            Terminées
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredInterventions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.interventionCard, { borderLeftColor: getStatusColor(item.statut), borderLeftWidth: 4 }]}>
            <View style={styles.interventionHeader}>
              <View style={styles.titleContainer}>
                {getStatusIcon(item.statut)}
                <Text style={styles.interventionTitle}>{item.titre || 'Intervention'}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.statut) }
              ]}>
                <Text style={styles.statusText}>{getStatusText(item.statut)}</Text>
              </View>
            </View>
            
            <Text style={styles.interventionDesc} numberOfLines={2}>
              {item.description || 'Aucune description'}
            </Text>
            
            <View style={styles.interventionFooter}>
              <View style={styles.footerItem}>
                <Ionicons name="car" size={14} color="#e94560" />
                <Text style={styles.footerText}>
                  {item.marque} {item.modele || 'Véhicule'}
                </Text>
              </View>
              <View style={styles.footerItem}>
                <Ionicons name="calendar" size={14} color="#e94560" />
                <Text style={styles.footerText}>
                  {new Date(item.date_creation).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </View>
            
            {item.statut === 'en_attente' && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleStartIntervention(item.id)}
              >
                <Text style={styles.actionButtonText}>Démarrer l'intervention</Text>
              </TouchableOpacity>
            )}
            
            {item.statut === 'en_cours' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleCompleteIntervention(item.id)}
              >
                <Text style={styles.actionButtonText}>Terminer l'intervention</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct" size={50} color="#aaaaaa" />
            <Text style={styles.emptyText}>Aucune intervention</Text>
            <Text style={styles.emptySubText}>Les interventions apparaîtront ici</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaaaaa',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
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
    padding: 15,
    gap: 10,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e1e1e',
  },
  filterActive: {
    backgroundColor: '#e94560',
  },
  filterText: {
    color: '#aaaaaa',
    fontSize: 12,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 15,
    paddingTop: 0,
  },
  interventionCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  interventionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  interventionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f5f5f5',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  interventionDesc: {
    fontSize: 13,
    color: '#aaaaaa',
    marginBottom: 10,
  },
  interventionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    color: '#e94560',
    fontSize: 12,
  },
  actionButton: {
    backgroundColor: '#2196f3',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    color: '#aaaaaa',
    fontSize: 16,
    marginTop: 15,
  },
  emptySubText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
});