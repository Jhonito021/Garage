import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import Header from '../../components/Header';

export default function VehiclesScreen() {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    annee: '',
    type_carburant: '',
    kilometrage_actuel: '',
  });

  const fetchVehicules = async () => {
    try {
      console.log('Récupération des véhicules...');
      const { data, status } = await api.get('/vehicules');
      
      if (status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        await AsyncStorage.removeItem('user');
        return;
      }
      
      console.log('Véhicules reçus:', data);
      setVehicules(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Erreur fetchVehicules:', err);
      setError('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.immatriculation || !formData.marque || !formData.modele) {
      Alert.alert('Erreur', 'Immatriculation, marque et modèle sont requis');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/vehicules/${editingId}`, formData);
        Alert.alert('Succès', 'Véhicule modifié');
      } else {
        await api.post('/vehicules', formData);
        Alert.alert('Succès', 'Véhicule ajouté');
      }
      setModalVisible(false);
      setEditingId(null);
      setFormData({
        immatriculation: '',
        marque: '',
        modele: '',
        annee: '',
        type_carburant: '',
        kilometrage_actuel: '',
      });
      fetchVehicules();
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirmation', 'Supprimer ce véhicule ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/vehicules/${id}`);
            fetchVehicules();
          } catch (err) {
            Alert.alert('Erreur', 'Erreur lors de la suppression');
          }
        },
      },
    ]);
  };

  const handleEdit = (vehicule) => {
    setFormData({
      immatriculation: vehicule.immatriculation,
      marque: vehicule.marque,
      modele: vehicule.modele,
      annee: vehicule.annee?.toString() || '',
      type_carburant: vehicule.type_carburant || '',
      kilometrage_actuel: vehicule.kilometrage_actuel?.toString() || '',
    });
    setEditingId(vehicule.id);
    setModalVisible(true);
  };

  const renderVehicleCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {item.marque} {item.modele}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
            <Ionicons name="create" size={18} color="#e94560" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
            <Ionicons name="trash" size={18} color="#e94560" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardText}>
          <Ionicons name="car" size={12} color="#aaaaaa" /> {item.immatriculation}
        </Text>
        <Text style={styles.cardText}>
          <Ionicons name="calendar" size={12} color="#aaaaaa" /> {item.annee || 'Année non renseignée'}
        </Text>
        <Text style={styles.cardText}>
          <Ionicons name="flash" size={12} color="#aaaaaa" /> {item.type_carburant || 'Non spécifié'}
        </Text>
        <Text style={styles.cardText}>
          <Ionicons name="speedometer" size={12} color="#aaaaaa" /> {item.kilometrage_actuel?.toLocaleString()} km
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Header title="Mes véhicules" />
        <ActivityIndicator size="large" color="#e94560" style={styles.loader} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Header title="Mes véhicules" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchVehicules}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Mes véhicules" />
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={16} color="#fff" />
        <Text style={styles.addButtonText}>Ajouter un véhicule</Text>
      </TouchableOpacity>

      <FlatList
        data={vehicules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVehicleCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car" size={50} color="#aaaaaa" />
            <Text style={styles.emptyText}>Aucun véhicule enregistré</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyButtonText}>Ajouter mon premier véhicule</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#e94560" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Immatriculation *"
                placeholderTextColor="#aaaaaa"
                value={formData.immatriculation}
                onChangeText={(value) => handleChange('immatriculation', value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Marque *"
                placeholderTextColor="#aaaaaa"
                value={formData.marque}
                onChangeText={(value) => handleChange('marque', value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Modèle *"
                placeholderTextColor="#aaaaaa"
                value={formData.modele}
                onChangeText={(value) => handleChange('modele', value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Année"
                placeholderTextColor="#aaaaaa"
                value={formData.annee}
                onChangeText={(value) => handleChange('annee', value)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Type de carburant"
                placeholderTextColor="#aaaaaa"
                value={formData.type_carburant}
                onChangeText={(value) => handleChange('type_carburant', value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Kilométrage"
                placeholderTextColor="#aaaaaa"
                value={formData.kilometrage_actuel}
                onChangeText={(value) => handleChange('kilometrage_actuel', value)}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: '#e94560',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#e94560',
    padding: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#e94560',
    margin: 15,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    padding: 5,
  },
  cardContent: {
    gap: 5,
  },
  cardText: {
    color: '#f5f5f5',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#aaaaaa',
    fontSize: 16,
    marginTop: 15,
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e94560',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 20,
  },
  emptyButtonText: {
    color: '#e94560',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#e94560',
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: '#f5f5f5',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});