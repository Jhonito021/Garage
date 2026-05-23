import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientDashboardScreen from '../screens/client/ClientDashboardScreen';
import VehiclesScreen from '../screens/client/VehiclesScreen';
import RdvScreen from '../screens/client/RdvScreen';
import SuiviScreen from '../screens/client/SuiviScreen';
import FacturesScreen from '../screens/client/FacturesScreen';

const Stack = createNativeStackNavigator();

export default function ClientNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTitleStyle: { color: '#e94560' },
        headerTintColor: '#e94560',
      }}
    >
      <Stack.Screen name="Accueil" component={ClientDashboardScreen} options={{ title: 'Accueil' }} />
      <Stack.Screen name="Vehicules" component={VehiclesScreen} options={{ title: 'Mes véhicules' }} />
      <Stack.Screen name="Rdv" component={RdvScreen} options={{ title: 'Rendez-vous' }} />
      <Stack.Screen name="Suivi" component={SuiviScreen} options={{ title: 'Suivi' }} />
      <Stack.Screen name="Factures" component={FacturesScreen} options={{ title: 'Factures' }} />
    </Stack.Navigator>
  );
}