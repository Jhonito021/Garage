// frontend/screens/technicien/TechnicienInterventionsScreen.jsx
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

export default function TechnicienInterventionsScreen({ navigation, route }) {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [userId, setUserId] = useState(null);

  const fetchInterventions = async () => {
    try {
      // Récupérer l'utilisateur
      let user_id = route.params?.user_id;
      
      if (!user_id) {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user_id = user.id;
        }
      }
      
      if (!user_id) {
        Alert.alert('Erreur', 'Utilisateur non identifié');
        navigation.goBack();
        return;
      }
      
      setUserId(user_id);
      console.log('Fetching interventions for user_id:', user_id);
      
      // Appel API avec user_id
      const response = await api.get(`/interventions?user_id=${user_id}`);
      console.log('API Response:', response);
      
      setInterventions(response.data.data || []);
    } catch (error) {
      console.error('Erreur fetchInterventions:', error);
      Alert.alert('Erreur', 'Impossible de charger les interventions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInterventions();
  };

  const getFilteredInterventions = () => {
    if (filter === 'all') return interventions;
    if (filter === 'en_cours') return interventions.filter(i => i.statut === 'en_cours');
    if (filter === 'terminee') return interventions.filter(i => i.statut === 'terminee');
    if (filter === 'a_venir') return interventions.filter(i => i.statut === 'en_attente' || i.statut === 'acceptee');
    return interventions;
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
              await api.put(`/interventions/${id}/demarrer?user_id=${userId}`);
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
              await api.put(`/interventions/${id}/terminer?user_id=${userId}`);
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
      case 'terminee': return <Ionicons name="checkmark-circle" size={20} color="#4caf50" />;
      case 'en_cours': return <Ionicons name="play-circle" size={20} color="#ff9800" />;
      default: return <Ionicons name="time" size={20} color="#2196f3" />;
    }
  };

  const getStatusText = (statut) => {
    switch(statut) {
      case 'terminee': return 'Terminée';
      case 'en_cours': return 'En cours';
      default: return 'À venir';
    }
  };

  const renderIntervention = ({ item }) => (
    <View style={styles.interventionCard}>
      <View style={styles.interventionHeader}>
        <View style={styles.titleContainer}>
          {getStatusIcon(item.statut)}
          <Text style={styles.interventionTitle}>{item.titre || 'Intervention'}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.statut === 'terminee' ? '#4caf50' : 
                           item.statut === 'en_cours' ? '#ff9800' : '#2196f3' }
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
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const filteredInterventions = getFilteredInterventions();

  return (
    <View style={styles.container}>
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
          style={[styles.filterButton, filter === 'a_venir' && styles.filterActive]}
          onPress={() => setFilter('a_venir')}
        >
          <Text style={[styles.filterText, filter === 'a_venir' && styles.filterTextActive]}>
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
        renderItem={renderIntervention}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct" size={50} color="#aaaaaa" />
            <Text style={styles.emptyText}>Aucune intervention</Text>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
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
    fontSize: 14,
    marginTop: 10,
  },
});