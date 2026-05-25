import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: '',
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.mot_de_passe || !formData.nom || !formData.prenom) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      Alert.alert('Succès', 'Compte créé avec succès. Veuillez vous connecter.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Ionicons name="person-add" size={50} color="#e94560" style={styles.icon} />
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Créez votre compte client</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#aaaaaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor="#aaaaaa"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#aaaaaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe *"
              placeholderTextColor="#aaaaaa"
              value={formData.mot_de_passe}
              onChangeText={(value) => handleChange('mot_de_passe', value)}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#aaaaaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nom *"
              placeholderTextColor="#aaaaaa"
              value={formData.nom}
              onChangeText={(value) => handleChange('nom', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#aaaaaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Prénom *"
              placeholderTextColor="#aaaaaa"
              value={formData.prenom}
              onChangeText={(value) => handleChange('prenom', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call" size={20} color="#aaaaaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              placeholderTextColor="#aaaaaa"
              value={formData.telephone}
              onChangeText={(value) => handleChange('telephone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color="#aaaaaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Adresse"
              placeholderTextColor="#aaaaaa"
              value={formData.adresse}
              onChangeText={(value) => handleChange('adresse', value)}
              multiline
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>S'inscrire</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    padding: 20,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaaaaa',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    color: '#f5f5f5',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#e94560',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});