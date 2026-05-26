import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  useEffect(() => {
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        navigation.replace('Client');
      }
    };
    checkLogin();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Ionicons name="car" size={50} color="#e94560" />
        <Text style={styles.title}>Garage Pro</Text>
        <Text style={styles.subtitle}>
          Gérez vos véhicules, prenez rendez-vous et suivez vos interventions
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="log-in" size={40} color="#e94560" />
          <Text style={styles.cardTitle}>Connexion</Text>
          <Text style={styles.cardText}>Accédez à votre espace</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Register')}>
          <Ionicons name="person-add" size={40} color="#e94560" />
          <Text style={styles.cardTitle}>Inscription</Text>
          <Text style={styles.cardText}>Créez votre compte</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Fonctionnalités</Text>
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={16} color="#e94560" />
          <Text style={styles.infoItemText}>Prise de rendez-vous en ligne</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="car" size={16} color="#e94560" />
          <Text style={styles.infoItemText}>Gestion de vos véhicules</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="notifications" size={16} color="#e94560" />
          <Text style={styles.infoItemText}>Rappels d'entretien</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="map" size={16} color="#e94560" />
          <Text style={styles.infoItemText}>Suivi en temps réel</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="card" size={16} color="#e94560" />
          <Text style={styles.infoItemText}>Paiement en ligne</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  hero: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
    marginTop: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaaaaa',
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 20,
    width: '45%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
    marginTop: 10,
    marginBottom: 5,
  },
  cardText: {
    fontSize: 12,
    color: '#aaaaaa',
    textAlign: 'center',
  },
  infoContainer: {
    padding: 20,
    margin: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItemText: {
    fontSize: 14,
    color: '#f5f5f5',
    marginLeft: 10,
  },
});