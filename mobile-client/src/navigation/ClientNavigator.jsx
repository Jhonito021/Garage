import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faCar, faCalendarAlt, faMapMarkerAlt, faUser } from '@fortawesome/free-solid-svg-icons';

import ClientDashboardScreen from '../screens/client/ClientDashboardScreen';
import VehiclesScreen from '../screens/client/VehiclesScreen';
import RdvScreen from '../screens/client/RdvScreen';
import SuiviScreen from '../screens/client/SuiviScreen';
import FacturesScreen from '../screens/client/FacturesScreen';

const Tab = createBottomTabNavigator();

export default function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          if (route.name === 'Accueil') icon = faHome;
          else if (route.name === 'Véhicules') icon = faCar;
          else if (route.name === 'Rendez-vous') icon = faCalendarAlt;
          else if (route.name === 'Suivi') icon = faMapMarkerAlt;
          else if (route.name === 'Profil') icon = faUser;
          return <FontAwesomeIcon icon={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e94560',
        tabBarInactiveTintColor: '#aaaaaa',
        tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#333' },
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTitleStyle: { color: '#e94560' },
        headerTintColor: '#e94560',
      })}
    >
      <Tab.Screen name="Accueil" component={ClientDashboardScreen} />
      <Tab.Screen name="Véhicules" component={VehiclesScreen} />
      <Tab.Screen name="Rendez-vous" component={RdvScreen} />
      <Tab.Screen name="Suivi" component={SuiviScreen} />
      <Tab.Screen name="Profil" component={FacturesScreen} />
    </Tab.Navigator>
  );
}