import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMapMarkerAlt, faClock, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/Header';

export default function SuiviScreen() {
  return (
    <View style={styles.container}>
      <Header title="Suivi en temps réel" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <FontAwesomeIcon icon={faMapMarkerAlt} size={16} color="#e94560" /> Position actuelle
          </Text>
          <Text style={styles.infoText}>Aucune intervention en cours</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <FontAwesomeIcon icon={faClock} size={16} color="#e94560" /> Statut
          </Text>
          <Text style={styles.infoText}>Aucune intervention programmée aujourd'hui</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <FontAwesomeIcon icon={faCheckCircle} size={16} color="#e94560" /> Dernière intervention
          </Text>
          <Text style={styles.infoText}>Aucune intervention récente</Text>
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
  content: {
    padding: 15,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: '#aaaaaa',
    fontSize: 14,
  },
});