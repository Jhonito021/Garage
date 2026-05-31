import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function DepanneurDashboardScreen({ navigation }) {
  const [missions, setMissions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
        const userData = await AsyncStorage.getItem('user');
        if (!userData) return;
        const user = JSON.parse(userData);
        setUser(user);
        
        // CORRECTION: Utiliser la bonne route avec user_id
        const response = await api.get(`/depannage?user_id=${user.id}`);
        console.log('Réponse API:', response);
        
        setMissions(response.data.data || []);
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Dépanneur</Text>
        {user && <Text style={styles.welcome}>Bienvenue, {user.nom}</Text>}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="list" size={30} color="#e94560" />
          <Text style={styles.statValue}>{missions.length}</Text>
          <Text style={styles.statLabel}>Missions</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Missions Récentes</Text>
        {missions.length === 0 ? (
          <Text style={styles.emptyText}>Aucune mission disponible</Text>
        ) : (
          missions.slice(0, 5).map((mission) => (
            <TouchableOpacity
              key={mission.id}
              style={styles.missionCard}
              onPress={() => navigation.navigate('Missions')}
            >
              <View>
                <Text style={styles.missionTitle}>{mission.titre}</Text>
                <Text style={styles.missionText}>{mission.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#e94560" />
            </TouchableOpacity>
          ))
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 25,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  welcome: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  missionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  missionText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  error: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 10,
  },
});
