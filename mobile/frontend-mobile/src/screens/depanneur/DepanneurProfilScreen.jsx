import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function DepanneurProfilScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr ?', [
      { text: 'Annuler', onPress: () => {} },
      {
        text: 'Déconnexion',
        onPress: async () => {
          await AsyncStorage.removeItem('user');
          navigation.replace('Home');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Ionicons name="person-circle" size={80} color="#e94560" />
        <Text style={styles.name}>{user?.nom || 'Dépanneur'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.infoItem}>
          <Ionicons name="mail" size={20} color="#e94560" />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="call" size={20} color="#e94560" />
          <Text style={styles.infoText}>{user?.telephone || 'Non renseigné'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.buttonText}>Déconnexion</Text>
      </TouchableOpacity>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 15,
    flex: 1,
  },
  button: {
    backgroundColor: '#e94560',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
});
