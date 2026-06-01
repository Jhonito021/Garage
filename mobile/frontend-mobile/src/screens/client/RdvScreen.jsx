// frontend-mobile/src/screens/client/RdvScreen.jsx
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

export default function RdvScreen() {
  const [vehicules, setVehicules] = useState([]);
  const [rdvs, setRdvs] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    vehicule_id: '',
    date: '',
    heure: '',
    service_demande: '',
  });
  const [creneaux, setCreneaux] = useState([]);
  const [user, setUser] = useState(null);

  const fetchData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      setUser(user);
      
      const [vehiculesRes, rdvsRes, interventionsRes] = await Promise.all([
        api.get(`/vehicules?client_id=${user.id}`),
        api.get(`/rdv?client_id=${user.id}`),
        api.get(`/suivi/interventions?client_id=${user.id}`)
      ]);
      
      setVehicules(Array.isArray(vehiculesRes.data) ? vehiculesRes.data : []);
      setRdvs(Array.isArray(rdvsRes.data) ? rdvsRes.data : []);
      setInterventions(Array.isArray(interventionsRes.data) ? interventionsRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchCreneaux = async (date) => {
    if (!date) return;
    try {
      const res = await api.get(`/planning/disponibles?date=${date}`);
      setCreneaux(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!formData.vehicule_id || !formData.date || !formData.heure || !formData.service_demande) {
      Alert.alert('Erreur', 'Tous les champs sont requis');
      return;
    }

    const dateHeure = `${formData.date} ${formData.heure}:00`;

    try {
      await api.post('/rdv', {
        client_id: user.id,
        vehicule_id: formData.vehicule_id,
        date_heure: dateHeure,
        service_demande: formData.service_demande,
      });
      Alert.alert('Succès', 'Rendez-vous confirmé');
      setModalVisible(false);
      setFormData({ vehicule_id: '', date: '', heure: '', service_demande: '' });
      fetchData();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Erreur');
    }
  };

  const getInterventionForRdv = (rdvId) => {
    return interventions.find(i => i.rdv_id === rdvId);
  };

  const isInterventionBlocked = (rdvId) => {
    const intervention = getInterventionForRdv(rdvId);
    if (intervention) {
      if (intervention.statut === 'en_cours' || intervention.statut === 'terminée') {
        return true;
      }
    }
    return false;
  };

  const getInfoMessage = (rdv) => {
    if (rdv.statut === 'annulé') {
      return { message: "Ce rendez-vous a été annulé", type: 'danger' };
    }
    
    const intervention = getInterventionForRdv(rdv.id);
    if (intervention) {
      if (intervention.statut === 'en_cours') {
        return { message: "L'intervention est déjà en cours", type: 'warning' };
      }
      if (intervention.statut === 'terminée') {
        return { message: "L'intervention est déjà terminée", type: 'success' };
      }
    }
    
    return null;
  };

  const handleAnnuler = async (id) => {
    Alert.alert('Confirmation', 'Annuler ce rendez-vous ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        onPress: async () => {
          try {
            await api.put(`/rdv/${id}/annuler`, { client_id: user.id });
            fetchData();
            Alert.alert('Succès', 'Rendez-vous annulé');
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || 'Erreur');
          }
        },
      },
    ]);
  };

  const getStatusBadge = (rdv) => {
    const intervention = getInterventionForRdv(rdv.id);
    
    if (intervention && intervention.statut === 'en_cours') {
      return <Text style={[styles.badge, styles.badgeWarning]}>Intervention en cours</Text>;
    }
    if (intervention && intervention.statut === 'terminée') {
      return <Text style={[styles.badge, styles.badgeSuccess]}>Intervention terminée</Text>;
    }
    if (rdv.statut === 'confirmé') {
      return <Text style={[styles.badge, styles.badgeInfo]}>Confirmé</Text>;
    }
    if (rdv.statut === 'annulé') {
      return <Text style={[styles.badge, styles.badgeDanger]}>Annulé</Text>;
    }
    return <Text style={[styles.badge, styles.badgeInfo]}>{rdv.statut}</Text>;
  };

  const renderRdvCard = ({ item }) => {
    const infoMessage = getInfoMessage(item);
    const blocked = isInterventionBlocked(item.id);
    const isCancelled = item.statut === 'annulé';
    const showCancelButton = !isCancelled && !blocked;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="build" size={14} color="#e94560" />
            <Text style={styles.cardTitle}>{item.service_demande}</Text>
          </View>
          {getStatusBadge(item)}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardTextRow}>
            <Ionicons name="calendar" size={12} color="#aaaaaa" />
            <Text style={styles.cardText}>{new Date(item.date_heure).toLocaleString('fr-FR')}</Text>
          </View>
          <View style={styles.cardTextRow}>
            <Ionicons name="car" size={12} color="#aaaaaa" />
            <Text style={styles.cardText}>{item.marque} {item.modele} - {item.immatriculation}</Text>
          </View>
          
          {infoMessage && (
            <View style={[
              styles.infoContainer,
              infoMessage.type === 'warning' && styles.infoWarning,
              infoMessage.type === 'success' && styles.infoSuccess,
              infoMessage.type === 'danger' && styles.infoDanger,
            ]}>
              <Ionicons 
                name={infoMessage.type === 'warning' ? 'alert-circle' : (infoMessage.type === 'success' ? 'checkmark-circle' : 'close-circle')} 
                size={16} 
                color={infoMessage.type === 'warning' ? '#ff9800' : (infoMessage.type === 'success' ? '#4caf50' : '#f44336')} 
              />
              <Text style={[
                styles.infoText,
                infoMessage.type === 'warning' && styles.infoTextWarning,
                infoMessage.type === 'success' && styles.infoTextSuccess,
                infoMessage.type === 'danger' && styles.infoTextDanger,
              ]}>
                {infoMessage.message}
              </Text>
            </View>
          )}
        </View>
        
        {showCancelButton && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleAnnuler(item.id)}>
            <Ionicons name="close" size={16} color="#fff" />
            <Text style={styles.cancelButtonText}>Annuler le rendez-vous</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={16} color="#fff" />
        <Text style={styles.addButtonText}>Prendre rendez-vous</Text>
      </TouchableOpacity>

      <FlatList
        data={rdvs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRdvCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar" size={50} color="#aaaaaa" />
            <Text style={styles.emptyText}>Aucun rendez-vous</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyButtonText}>Prendre rendez-vous</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Nouveau rendez-vous</Text>
        <TouchableOpacity onPress={() => setModalVisible(false)}>
          <Ionicons name="close" size={24} color="#e94560" />
        </TouchableOpacity>
      </View>
      
      <ScrollView>
        {/* Véhicule */}
        <Text style={styles.label}>Véhicule</Text>
        {vehicules.map((v) => (
          <TouchableOpacity
            key={v.id}
            style={[
              styles.vehicleOption,
              formData.vehicule_id === v.id && styles.vehicleOptionSelected,
            ]}
            onPress={() => setFormData({ ...formData, vehicule_id: v.id })}
          >
            <Text style={styles.vehicleOptionText}>
              {v.marque} {v.modele} - {v.immatriculation}
            </Text>
            {formData.vehicule_id === v.id && (
              <Ionicons name="checkmark" size={16} color="#e94560" />
            )}
          </TouchableOpacity>
        ))}

        {/* Date */}
        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-JJ"
          placeholderTextColor="#aaaaaa"
          value={formData.date}
          onChangeText={(value) => {
            setFormData({ ...formData, date: value });
            fetchCreneaux(value);
          }}
        />

        {/* Horaire */}
        <Text style={styles.label}>Horaire</Text>
        <View style={styles.creneauxContainer}>
          {creneaux.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.creneauOption,
                formData.heure === c && styles.creneauOptionSelected,
              ]}
              onPress={() => setFormData({ ...formData, heure: c })}
            >
              <Ionicons name="time" size={12} color="#f5f5f5" />
              <Text style={styles.creneauText}>{c}</Text>
            </TouchableOpacity>
          ))}
          {creneaux.length === 0 && formData.date && (
            <Text style={styles.noCreneaux}>Aucun créneau disponible</Text>
          )}
        </View>

        {/* Service */}
        <Text style={styles.label}>Service</Text>
        
        <TouchableOpacity
          style={[
            styles.serviceOption,
            formData.service_demande === 'Vidange' && styles.serviceOptionSelected,
          ]}
          onPress={() => setFormData({ ...formData, service_demande: 'Vidange' })}
        >
          <Text style={styles.serviceText}>Vidange</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.serviceOption,
            formData.service_demande === 'Contrôle technique' && styles.serviceOptionSelected,
          ]}
          onPress={() => setFormData({ ...formData, service_demande: 'Contrôle technique' })}
        >
          <Text style={styles.serviceText}>Contrôle technique</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.serviceOption,
            formData.service_demande === 'Réparation' && styles.serviceOptionSelected,
          ]}
          onPress={() => setFormData({ ...formData, service_demande: 'Réparation' })}
        >
          <Text style={styles.serviceText}>Réparation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Confirmer</Text>
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
  loadingText: {
    color: '#aaaaaa',
    marginTop: 10,
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
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContent: {
    gap: 8,
  },
  cardTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardText: {
    color: '#f5f5f5',
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  badgeInfo: {
    backgroundColor: '#2196f3',
    color: '#fff',
  },
  badgeWarning: {
    backgroundColor: '#ff9800',
    color: '#fff',
  },
  badgeSuccess: {
    backgroundColor: '#4caf50',
    color: '#fff',
  },
  badgeDanger: {
    backgroundColor: '#f44336',
    color: '#fff',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
    gap: 8,
  },
  infoWarning: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  infoSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  infoDanger: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
  infoTextWarning: {
    color: '#ff9800',
  },
  infoTextSuccess: {
    color: '#4caf50',
  },
  infoTextDanger: {
    color: '#f44336',
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  label: {
    color: '#f5f5f5',
    fontSize: 16,
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: '#f5f5f5',
    fontSize: 16,
  },
  vehicleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  vehicleOptionSelected: {
    borderWidth: 1,
    borderColor: '#e94560',
  },
  vehicleOptionText: {
    color: '#f5f5f5',
    fontSize: 14,
  },
  creneauxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  creneauOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 15,
    gap: 8,
  },
  creneauOptionSelected: {
    backgroundColor: '#e94560',
  },
  creneauText: {
    color: '#f5f5f5',
    fontSize: 14,
  },
  noCreneaux: {
    color: '#aaaaaa',
    textAlign: 'center',
    padding: 10,
  },
  serviceOption: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  serviceOptionSelected: {
    backgroundColor: '#e94560',
  },
  serviceText: {
    color: '#f5f5f5',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});