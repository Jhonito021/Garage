// frontend/screens/depanneur/DepanneurMissionsScreen.jsx
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

export default function DepanneurMissionsScreen({ navigation }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMissions = async () => {
    try {
        const userData = await AsyncStorage.getItem('user');
        if (!userData) return;
        const user = JSON.parse(userData);
        
        // CORRECTION: Utiliser la bonne route avec user_id
        const response = await api.get(`/depannage/missions?user_id=${user.id}`);
        setMissions(response.data.data || []);
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    fetchMissions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMissions();
  };

  const accepterMission = async (missionId) => {
    Alert.alert(
      'Accepter',
      'Confirmez-vous l\'acceptation de cette mission ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: async () => {
            try {
              await api.put(`/depannage/missions/${missionId}/accepter`);
              fetchMissions();
              Alert.alert('Succès', 'Mission acceptée');
            } catch (err) {
              Alert.alert('Erreur', 'Impossible d\'accepter la mission');
            }
          }
        }
      ]
    );
  };

  const getStatusStyle = (statut) => {
    switch(statut) {
      case 'acceptee': return { bg: '#4caf50', text: 'Acceptée', icon: 'checkmark-circle' };
      case 'en_cours': return { bg: '#ff9800', text: 'En cours', icon: 'play-circle' };
      case 'terminee': return { bg: '#2196f3', text: 'Terminée', icon: 'checkmark-done-circle' };
      default: return { bg: '#ff9800', text: 'En attente', icon: 'time' };
    }
  };

  const renderMission = ({ item }) => {
    const status = getStatusStyle(item.statut);
    
    return (
      <View style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <Text style={styles.missionTitle}>{item.titre}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={12} color="#fff" />
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </View>
        
        <Text style={styles.missionDesc}>{item.description}</Text>
        
        <View style={styles.missionFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="location" size={14} color="#e94560" />
            <Text style={styles.footerText}>{item.localisation || 'Position non spécifiée'}</Text>
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
            onPress={() => accepterMission(item.id)}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Accepter la mission</Text>
          </TouchableOpacity>
        )}
        
        {item.statut === 'acceptee' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.mapButton]}
            onPress={() => navigation.navigate('DepanneurMap', { mission: item })}
          >
            <Ionicons name="map" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Voir sur la carte</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>Chargement des missions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={missions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMission}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle" size={50} color="#aaaaaa" />
            <Text style={styles.emptyText}>Aucune mission</Text>
            <Text style={styles.emptySubText}>Les missions apparaîtront ici</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaaaaa',
    marginTop: 10,
  },
  listContent: {
    padding: 15,
  },
  missionCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f5f5f5',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  missionDesc: {
    fontSize: 13,
    color: '#aaaaaa',
    marginBottom: 10,
  },
  missionFooter: {
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
    backgroundColor: '#4caf50',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mapButton: {
    backgroundColor: '#2196f3',
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