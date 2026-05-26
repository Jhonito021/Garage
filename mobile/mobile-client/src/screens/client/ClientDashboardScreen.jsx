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

export default function ClientDashboardScreen({ navigation }) {
  const [vehicules, setVehicules] = useState([]);
  const [rdv, setRdv] = useState([]);
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
      
      const [vehiculesRes, rdvRes] = await Promise.all([
        api.get(`/vehicules?client_id=${user.id}`),
        api.get(`/rdv?client_id=${user.id}`)
      ]);
      
      setVehicules(Array.isArray(vehiculesRes.data) ? vehiculesRes.data : []);
      setRdv(Array.isArray(rdvRes.data) ? rdvRes.data : []);
    } catch (err) {
      setError('Erreur de chargement');
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.welcomeContainer}>
          <Ionicons name="speedometer" size={24} color="#e94560" />
          <Text style={styles.welcomeText}>Bonjour {user?.prenom} {user?.nom}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}><Ionicons name="car" size={16} color="#e94560" /> Mes véhicules</Text>
          {vehicules.length === 0 ? (
            <Text style={styles.emptyText}>Aucun véhicule</Text>
          ) : (
            vehicules.slice(0, 3).map((v) => (
              <View key={v.id} style={styles.vehicleItem}>
                <Text style={styles.vehicleName}>{v.marque} {v.modele} - {v.immatriculation}</Text>
                <Text style={styles.vehicleKm}>{v.kilometrage_actuel?.toLocaleString()} km</Text>
              </View>
            ))
          )}
          <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('Véhicules')}>
            <Ionicons name={vehicules.length === 0 ? "add" : "eye"} size={16} color="#fff" />
            <Text style={styles.cardButtonText}>{vehicules.length === 0 ? 'Ajouter' : 'Voir tous'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}><Ionicons name="calendar" size={16} color="#e94560" /> Prochains rendez-vous</Text>
          {rdv.length === 0 ? (
            <Text style={styles.emptyText}>Aucun rendez-vous</Text>
          ) : (
            rdv.slice(0, 3).map((r) => (
              <View key={r.id} style={styles.rdvItem}>
                <Text style={styles.rdvService}>{r.service_demande}</Text>
                <Text style={styles.rdvDate}>{new Date(r.date_heure).toLocaleString('fr-FR')}</Text>
              </View>
            ))
          )}
          <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('Rendez-vous')}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.cardButtonText}>Prendre rendez-vous</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}><Ionicons name="notifications" size={16} color="#e94560" /> Rappel vidange</Text>
          <View style={styles.reminderContainer}>
            <Ionicons name="car" size={40} color="#aaaaaa" />
            <Text style={styles.reminderText}>Consultez vos véhicules</Text>
            <TouchableOpacity style={styles.reminderButton} onPress={() => navigation.navigate('Véhicules')}>
              <Text style={styles.reminderButtonText}>Voir mes véhicules</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  scrollContent: {
    padding: 15,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  welcomeText: {
    color: '#f5f5f5',
    fontSize: 18,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 10,
  },
  vehicleItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 10,
  },
  vehicleName: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vehicleKm: {
    color: '#aaaaaa',
    fontSize: 12,
    marginTop: 4,
  },
  rdvItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 10,
  },
  rdvService: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rdvDate: {
    color: '#f5f5f5',
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    color: '#aaaaaa',
    textAlign: 'center',
    paddingVertical: 15,
  },
  cardButton: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reminderContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  reminderText: {
    color: '#aaaaaa',
    textAlign: 'center',
    marginTop: 10,
  },
  reminderButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e94560',
    borderRadius: 8,
    padding: 10,
    marginTop: 15,
  },
  reminderButtonText: {
    color: '#e94560',
    fontSize: 14,
  },
});