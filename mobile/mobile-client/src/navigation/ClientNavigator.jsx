import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ClientDashboardScreen from '../screens/client/ClientDashboardScreen';
import VehiclesScreen from '../screens/client/VehiclesScreen';
import RdvScreen from '../screens/client/RdvScreen';
import SuiviScreen from '../screens/client/SuiviScreen';
import FacturesScreen from '../screens/client/FacturesScreen';

const Tab = createBottomTabNavigator();

// Composant de déconnexion pour le header
const LogoutButton = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await fetch('http://192.168.56.1:3005/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    } finally {
      await AsyncStorage.removeItem('user');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
      <Ionicons name="log-out" size={24} color="#e94560" />
    </TouchableOpacity>
  );
};

export default function ClientNavigator({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Véhicules') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Rendez-vous') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Suivi') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Factures') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e94560',
        tabBarInactiveTintColor: '#aaaaaa',
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#333',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#1a1a2e',
        },
        headerTitleStyle: {
          color: '#e94560',
          fontWeight: 'bold',
        },
        headerTintColor: '#e94560',
        headerRight: () => <LogoutButton navigation={navigation} />,
      })}
    >
      <Tab.Screen 
        name="Accueil" 
        component={ClientDashboardScreen} 
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen 
        name="Véhicules" 
        component={VehiclesScreen} 
        options={{ title: 'Mes véhicules' }}
      />
      <Tab.Screen 
        name="Rendez-vous" 
        component={RdvScreen} 
        options={{ title: 'Rendez-vous' }}
      />
      <Tab.Screen 
        name="Suivi" 
        component={SuiviScreen} 
        options={{ title: 'Suivi' }}
      />
      <Tab.Screen 
        name="Factures" 
        component={FacturesScreen} 
        options={{ title: 'Factures' }}
      />
    </Tab.Navigator>
  );
}