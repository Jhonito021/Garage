import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function DepanneurSuiviScreen({ navigation }) {
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuivis = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      const user = JSON.parse(userData);

      const response = await api.get('/suivi', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuivis(response.data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuivis();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSuivis();
  };

  const renderSuivi = ({ item }) => (
    <View style={styles.suiviCard}>
      <View style={styles.suiviHeader}>
        <View style={styles.suiviInfo}>
          <Ionicons name="car" size={24} color="#e94560" />
          <Text style={styles.suiviTitle}>{item.vehicule}</Text>
        </View>
        <Text style={styles.suiviDate}>{new Date(item.date).toLocaleDateString('fr-FR')}</Text>
      </View>
      <Text style={styles.suiviDescription}>{item.description}</Text>
      <View style={styles.suiviFooter}>
        <Text style={styles.suiviStatus}>{item.statut}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={suivis}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSuivi}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun suivi disponible</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  suiviCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suiviHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  suiviInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suiviTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  suiviDate: {
    fontSize: 12,
    color: '#999',
  },
  suiviDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  suiviFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  suiviStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27ae60',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});
