// frontend/screens/technicien/TechnicienDashboardScreen.jsx
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

export default function TechnicienDashboardScreen({ navigation }) {
  const [interventions, setInterventions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    terminees: 0,
    en_cours: 0,
    a_venir: 0
  });

  const fetchData = async () => {
    try {
      // Récupérer l'utilisateur
      const userData = await AsyncStorage.getItem('user');
      console.log('User data from storage:', userData);
      
      if (!userData) {
        console.log('No user, redirecting to home');
        navigation.replace('Home');
        return;
      }
      
      const user = JSON.parse(userData);
      setUser(user);
      
      // Vérifier le rôle
      if (user.role !== 'technicien') {
        setError('Accès non autorisé');
        setLoading(false);
        return;
      }
      
      console.log('Fetching interventions for user_id:', user.id);
      
      // Appel API avec user_id en paramètre
      const response = await api.get(`/interventions?user_id=${user.id}`);
      console.log('API Response:', response);
      
      const data = response.data.data || [];
      setInterventions(data);
      
      // Calculer les stats
      const terminees = data.filter(i => i.statut === 'terminee').length;
      const enCours = data.filter(i => i.statut === 'en_cours').length;
      const aVenir = data.filter(i => i.statut === 'en_attente' || i.statut === 'acceptee').length;
      
      setStats({
        total: data.length,
        terminees,
        en_cours: enCours,
        a_venir: aVenir
      });
      
      setError('');
    } catch (error) {
      console.error('Erreur fetchData:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={50} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Technicien</Text>
        {user && <Text style={styles.welcome}>Bienvenue, {user.prenom} {user.nom}</Text>}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="wrench" size={30} color="#e94560" />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="play-circle" size={30} color="#ff9800" />
          <Text style={[styles.statValue, { color: '#ff9800' }]}>{stats.en_cours}</Text>
          <Text style={styles.statLabel}>En cours</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="hourglass" size={30} color="#2196f3" />
          <Text style={[styles.statValue, { color: '#2196f3' }]}>{stats.a_venir}</Text>
          <Text style={styles.statLabel}>À venir</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={30} color="#4caf50" />
          <Text style={[styles.statValue, { color: '#4caf50' }]}>{stats.terminees}</Text>
          <Text style={styles.statLabel}>Terminées</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interventions Récentes</Text>
        {interventions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="construct" size={50} color="#aaaaaa" />
            <Text style={styles.emptyText}>Aucune intervention pour le moment</Text>
          </View>
        ) : (
          interventions.slice(0, 5).map((intervention) => (
            <TouchableOpacity
              key={intervention.id}
              style={styles.interventionCard}
              onPress={() => navigation.navigate('Interventions', { user_id: user?.id })}
            >
              <View style={styles.interventionHeader}>
                <Text style={styles.interventionTitle}>{intervention.titre || 'Intervention'}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: 
                      intervention.statut === 'terminee' ? '#4caf50' :
                      intervention.statut === 'en_cours' ? '#ff9800' : '#2196f3'
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {intervention.statut === 'terminee' ? 'Terminée' :
                     intervention.statut === 'en_cours' ? 'En cours' : 'À venir'}
                  </Text>
                </View>
              </View>
              <Text style={styles.interventionDesc} numberOfLines={2}>
                {intervention.description || 'Aucune description'}
              </Text>
              <View style={styles.interventionFooter}>
                <Ionicons name="car" size={14} color="#e94560" />
                <Text style={styles.interventionType}>
                  {intervention.marque} {intervention.modele || 'Véhicule'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 15,
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
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
  },
  welcome: {
    fontSize: 14,
    color: '#aaaaaa',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 25,
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e94560',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#aaaaaa',
    marginTop: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 15,
  },
  interventionCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  interventionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 8,
  },
  interventionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interventionType: {
    fontSize: 12,
    color: '#e94560',
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#aaaaaa',
    fontSize: 14,
    marginTop: 10,
  },
});