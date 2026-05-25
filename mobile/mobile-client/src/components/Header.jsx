import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ title, showBack = false }) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {showBack && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#f5f5f5" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      {/* Bouton de déconnexion temporairement désactivé */}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1a1a2e',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#e94560',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  logoutButton: {
    padding: 5,
  },
});