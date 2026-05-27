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

export default function VehiclesScreen() {
  const [vehicules, setVehicules] = useState([]);
  const [filteredVehicules, setFilteredVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const { data, status } = await api.get(`/vehicules?client_id=${user.id}`);
      
      if (status === 200 && Array.isArray(data)) {
        setVehicules(data);
        setFilteredVehicules(data);
      }
      setError('');
    } catch (err) {
      console.error('Erreur fetchVehicules:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = vehicules.filter(v => 
        v.immatriculation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modele?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVehicules(filtered);
    } else {
      setFilteredVehicules(vehicules);
    }
  }, [searchTerm, vehicules]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.immatriculation || !formData.marque || !formData.modele) {
      Alert.alert('Erreur', 'Immatriculation, marque et modèle sont requis');
      return;
    }

    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      
      if (editingId) {
        await api.put(`/vehicules/${editingId}`, { ...formData, client_id: user.id });
        Alert.alert('Succès', 'Véhicule modifié');
      } else {
        await api.post('/vehicules', { ...formData, client_id: user.id });
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
      Alert.alert('Erreur', err.response?.data?.error || 'Erreur');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirmation', 'Supprimer ce véhicule ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const userData = await AsyncStorage.getItem('user');
          const user = JSON.parse(userData);
          try {
            await api.delete(`/vehicules/${id}`, { data: { client_id: user.id } });
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

  const getKilometrageStatus = (km) => {
    if (!km) return { text: 'Non renseigné', color: '#aaaaaa', icon: 'help-circle' };
    if (km > 200000) return { text: 'Élevé', color: '#f44336', icon: 'alert-circle' };
    if (km > 100000) return { text: 'Modéré', color: '#ff9800', icon: 'warning' };
    return { text: 'Faible', color: '#4caf50', icon: 'checkmark-circle' };
  };

  const renderVehicleCard = ({ item }) => {
    const kmStatus = getKilometrageStatus(item.kilometrage_actuel);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{item.marque} {item.modele}</Text>
            <Text style={styles.cardSubtitle}>{item.immatriculation}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
              <Ionicons name="create" size={20} color="#e94560" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
              <Ionicons name="trash" size={20} color="#e94560" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#aaaaaa" />
            <Text style={styles.infoText}>Année: {item.annee || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="flash" size={16} color="#aaaaaa" />
            <Text style={styles.infoText}>Carburant: {item.type_carburant || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="speedometer" size={16} color="#aaaaaa" />
            <Text style={styles.infoText}>Kilométrage: {item.kilometrage_actuel?.toLocaleString()} km</Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <Ionicons name={kmStatus.icon} size={14} color={kmStatus.color} />
          <Text style={[styles.statusText, { color: kmStatus.color }]}>Kilométrage {kmStatus.text}</Text>
        </View>
      </View>
    );
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
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#aaaaaa" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un véhicule..."
            placeholderTextColor="#aaaaaa"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => {
          setEditingId(null);
          setFormData({
            immatriculation: '',
            marque: '',
            modele: '',
            annee: '',
            type_carburant: '',
            kilometrage_actuel: '',
          });
          setModalVisible(true);
        }}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredVehicules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVehicleCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car" size={60} color="#aaaaaa" />
            <Text style={styles.emptyTitle}>Aucun véhicule</Text>
            <Text style={styles.emptyText}>Ajoutez votre premier véhicule</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyButtonText}>+ Ajouter un véhicule</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Modifier' : 'Ajouter'} un véhicule</Text>
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
  headerContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#f5f5f5',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: '#aaaaaa',
    fontSize: 14,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    padding: 5,
  },
  cardContent: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    color: '#f5f5f5',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: '#f5f5f5',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    color: '#aaaaaa',
    fontSize: 14,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
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