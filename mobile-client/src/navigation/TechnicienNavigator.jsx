import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTachometerAlt, faWrench, faQrcode, faCamera, faSignature } from '@fortawesome/free-solid-svg-icons';

import TechnicienDashboardScreen from '../screens/technicien/TechnicienDashboardScreen';
import InterventionsScreen from '../screens/technicien/InterventionsScreen';
import ScanScreen from '../screens/technicien/ScanScreen';
import PhotoScreen from '../screens/technicien/PhotoScreen';
import SignatureScreen from '../screens/technicien/SignatureScreen';

const Tab = createBottomTabNavigator();

export default function TechnicienNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          if (route.name === 'Dashboard') icon = faTachometerAlt;
          else if (route.name === 'Interventions') icon = faWrench;
          else if (route.name === 'Scan') icon = faQrcode;
          else if (route.name === 'Photo') icon = faCamera;
          else if (route.name === 'Signature') icon = faSignature;
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
      <Tab.Screen name="Dashboard" component={TechnicienDashboardScreen} />
      <Tab.Screen name="Interventions" component={InterventionsScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Photo" component={PhotoScreen} />
      <Tab.Screen name="Signature" component={SignatureScreen} />
    </Tab.Navigator>
  );
}