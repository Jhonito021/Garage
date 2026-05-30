import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function FacturesScreen() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [confirmationVisible, setConfirmationVisible] = useState(null);
  const [detailVisible, setDetailVisible] = useState(null);
  const [detailFacture, setDetailFacture] = useState(null);

  const fetchFactures = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const { data, status } = await api.get(`/factures?client_id=${user.id}`);
      
      if (status === 200 && Array.isArray(data)) {
        setFactures(data);
      } else {
        setFactures([]);
      }
    } catch (err) {
      console.error('Erreur chargement factures:', err);
      setFactures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const handlePayer = async (id) => {
    setPayingId(id);
    setConfirmationVisible(null);
    
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      
      await api.put(`/factures/${id}/payer`, { client_id: user.id });
      setFactures(factures.map(f => 
        f.id === id ? { ...f, statut_paiement: 'payé' } : f
      ));
      Alert.alert('Succès', 'Facture payée avec succès');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Erreur lors du paiement');
    } finally {
      setPayingId(null);
    }
  };

  const openConfirmation = (id) => {
    setConfirmationVisible(id);
  };

  const closeConfirmation = () => {
    setConfirmationVisible(null);
  };

  const openDetail = async (id) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      
      const { data } = await api.get(`/factures/${id}?client_id=${user.id}`);
      setDetailFacture(data);
      setDetailVisible(id);
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors du chargement du détail');
    }
  };

  const closeDetail = () => {
    setDetailVisible(null);
    setDetailFacture(null);
  };

  const formatMontant = (montant) => {
    const nombre = parseFloat(montant);
    if (isNaN(nombre)) return '0.00';
    return nombre.toFixed(2);
  };

  const renderFactureCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons name="document-text" size={20} color="#e94560" />
          <Text style={styles.cardTitle}> Facture #{item.id}</Text>
        </View>
        <TouchableOpacity onPress={() => openDetail(item.id)} style={styles.detailButton}>
          <Ionicons name="eye" size={20} color="#e94560" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={14} color="#aaaaaa" />
          <Text style={styles.infoText}>
            Émise le {new Date(item.date_emission).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cash" size={14} color="#aaaaaa" />
          <Text style={styles.infoText}>
            Montant: <Text style={styles.amount}>{formatMontant(item.montant_total)} Ar</Text>
          </Text>
        </View>

        {item.marque && (
          <View style={styles.infoRow}>
            <Ionicons name="car" size={14} color="#aaaaaa" />
            <Text style={styles.infoText}>
              Véhicule: {item.marque} {item.modele} - {item.immatriculation}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          {item.statut_paiement === 'payé' ? (
            <Ionicons name="checkmark-circle" size={14} color="#4caf50" />
          ) : (
            <Ionicons name="time" size={14} color="#f44336" />
          )}
          <Text style={[styles.statusText, item.statut_paiement === 'payé' ? styles.statusPaid : styles.statusUnpaid]}>
            {item.statut_paiement === 'payé' ? 'Payée' : 'Impayée'}
          </Text>
        </View>
      </View>

      {item.statut_paiement !== 'payé' && (
        <TouchableOpacity 
          style={styles.payButton} 
          onPress={() => openConfirmation(item.id)}
          disabled={payingId === item.id}
        >
          <Ionicons name="card" size={16} color="#fff" />
          <Text style={styles.payButtonText}>
            {payingId === item.id ? 'Paiement en cours...' : 'Payer au garage'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal de confirmation de paiement */}
      {confirmationVisible === item.id && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmation de paiement</Text>
            <Ionicons name="card" size={40} color="#e94560" style={styles.modalIcon} />
            <Text style={styles.modalText}>
              Confirmez-vous avoir payé la facture <Text style={styles.modalTextBold}>#{item.id}</Text> au garage ?
            </Text>
            <Text style={styles.modalAmount}>
              Montant: <Text style={styles.modalAmountBold}>{formatMontant(item.montant_total)} Ar</Text>
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={closeConfirmation}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={() => handlePayer(item.id)}>
                <Text style={styles.modalConfirmText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  // Modal de détail de facture
  const DetailModal = () => (
    <Modal
      visible={detailVisible !== null}
      animationType="slide"
      transparent={true}
      onRequestClose={closeDetail}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContent}>
          <View style={styles.detailModalHeader}>
            <Text style={styles.detailModalTitle}>
              <Ionicons name="document-text" size={20} color="#e94560" /> Détail de la facture
            </Text>
            <TouchableOpacity onPress={closeDetail}>
              <Ionicons name="close" size={24} color="#e94560" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {detailFacture && (
              <View>
                {/* Informations générales */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Informations générales</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Numéro :</Text>
                    <Text style={styles.detailValue}>#{detailFacture.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date :</Text>
                    <Text style={styles.detailValue}>
                      {new Date(detailFacture.date_emission).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Statut :</Text>
                    <Text style={[
                      styles.detailValue,
                      detailFacture.statut_paiement === 'payé' ? styles.statusPaid : styles.statusUnpaid
                    ]}>
                      {detailFacture.statut_paiement === 'payé' ? 'Payée' : 'Impayée'}
                    </Text>
                  </View>
                </View>

                {/* Client */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Client</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nom :</Text>
                    <Text style={styles.detailValue}>{detailFacture.prenom} {detailFacture.nom}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email :</Text>
                    <Text style={styles.detailValue}>{detailFacture.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Adresse :</Text>
                    <Text style={styles.detailValue}>{detailFacture.adresse || 'Non renseignée'}</Text>
                  </View>
                </View>

                {/* Véhicule */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Véhicule</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Marque :</Text>
                    <Text style={styles.detailValue}>{detailFacture.marque}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Modèle :</Text>
                    <Text style={styles.detailValue}>{detailFacture.modele}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Immatriculation :</Text>
                    <Text style={styles.detailValue}>{detailFacture.immatriculation}</Text>
                  </View>
                </View>

                {/* Détail des coûts */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Détail des coûts</Text>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Prestation :</Text>
                    <Text style={styles.costValue}>{formatMontant(detailFacture.prix_intervention)} Ar</Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Pièces utilisées :</Text>
                    <Text style={styles.costValue}>{formatMontant(detailFacture.total_pieces)} Ar</Text>
                  </View>
                  <View style={[styles.costRow, styles.costTotal]}>
                    <Text style={styles.costTotalLabel}>Total TTC :</Text>
                    <Text style={styles.costTotalValue}>{formatMontant(detailFacture.montant_total)} Ar</Text>
                  </View>
                </View>

                {/* Pièces utilisées */}
                {detailFacture.pieces && detailFacture.pieces.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      <Ionicons name="cube" size={14} color="#e94560" /> Pièces utilisées
                    </Text>
                    {detailFacture.pieces.map((p, idx) => (
                      <View key={idx} style={styles.pieceRow}>
                        <View style={styles.pieceInfo}>
                          <Text style={styles.pieceName}>{p.nom}</Text>
                          <Text style={styles.pieceRef}>{p.reference}</Text>
                        </View>
                        <View style={styles.pieceDetails}>
                          <Text style={styles.pieceQty}>x{p.quantite_utilisee}</Text>
                          <Text style={styles.piecePrice}>{p.prix_unitaire} Ar</Text>
                          <Text style={styles.pieceTotal}>{p.total} Ar</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.detailCloseButton} onPress={closeDetail}>
            <Text style={styles.detailCloseText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {factures.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text" size={60} color="#aaaaaa" />
          <Text style={styles.emptyTitle}>Aucune facture</Text>
          <Text style={styles.emptyText}>
            Vos factures apparaîtront ici après vos interventions
          </Text>
        </View>
      ) : (
        <FlatList
          data={factures}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFactureCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      <DetailModal />
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
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  detailButton: {
    padding: 5,
  },
  cardContent: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    color: '#f5f5f5',
    fontSize: 14,
    flex: 1,
  },
  amount: {
    color: '#e94560',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusPaid: {
    color: '#4caf50',
  },
  statusUnpaid: {
    color: '#f44336',
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: '#e94560',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalText: {
    color: '#f5f5f5',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalTextBold: {
    fontWeight: 'bold',
    color: '#e94560',
  },
  modalAmount: {
    color: '#f5f5f5',
    fontSize: 14,
    marginBottom: 20,
  },
  modalAmountBold: {
    fontWeight: 'bold',
    color: '#e94560',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 20,
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalConfirmButton: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 20,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailModalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '85%',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailModalTitle: {
    color: '#e94560',
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    width: 100,
    color: '#aaaaaa',
    fontSize: 13,
  },
  detailValue: {
    flex: 1,
    color: '#f5f5f5',
    fontSize: 13,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  costTotal: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 6,
    paddingTop: 10,
  },
  costLabel: {
    color: '#aaaaaa',
    fontSize: 14,
  },
  costValue: {
    color: '#f5f5f5',
    fontSize: 14,
  },
  costTotalLabel: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
  },
  costTotalValue: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pieceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  pieceInfo: {
    flex: 2,
  },
  pieceName: {
    color: '#f5f5f5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pieceRef: {
    color: '#aaaaaa',
    fontSize: 11,
  },
  pieceDetails: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pieceQty: {
    color: '#f5f5f5',
    fontSize: 13,
  },
  piecePrice: {
    color: '#f5f5f5',
    fontSize: 13,
  },
  pieceTotal: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: 'bold',
  },
  detailCloseButton: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  detailCloseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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
    textAlign: 'center',
  },
});