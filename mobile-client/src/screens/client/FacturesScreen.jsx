import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import Header from '../../components/Header';

export default function FacturesScreen() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFactures = async () => {
    try {
      const res = await api.get('/factures');
      setFactures(res.data);
    } catch (err) {
      console.error('Erreur chargement factures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const handleDownload = async (id) => {
    Alert.alert(
      'Information',
      'Le téléchargement des factures sera disponible dans une prochaine version.'
    );
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
        <TouchableOpacity onPress={() => handleDownload(item.id)} style={styles.downloadButton}>
          <Ionicons name="download" size={18} color="#e94560" />
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
            Montant: <Text style={styles.amount}>{formatMontant(item.montant_total)} €</Text>
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
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Header title="Mes factures" />
        <ActivityIndicator size="large" color="#e94560" style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Mes factures" />

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
    backgroundColor: '#121212',
  },
  loader: {
    marginTop: 50,
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
  downloadButton: {
    padding: 8,
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