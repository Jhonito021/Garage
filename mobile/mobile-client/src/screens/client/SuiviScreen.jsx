import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function SuiviScreen() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInterventions = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const { data, status } = await api.get(`/suivi/interventions?client_id=${user.id}`);
      
      if (status === 200 && Array.isArray(data)) {
        setInterventions(data);
      } else {
        setInterventions([]);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setInterventions([]);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {interventions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="map" size={50} color="#aaaaaa" />
            <Text style={styles.emptyText}>Aucune intervention en cours</Text>
          </View>
        ) : (
          interventions.map((i) => (
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
  content: {
    padding: 15,
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