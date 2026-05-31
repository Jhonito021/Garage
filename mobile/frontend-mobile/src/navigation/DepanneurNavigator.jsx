import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DepanneurDashboardScreen from '../screens/depanneur/DepanneurDashboardScreen';
import DepanneurMissionsScreen from '../screens/depanneur/DepanneurMissionsScreen';
import DepanneurSuiviScreen from '../screens/depanneur/DepanneurSuiviScreen';
import DepanneurProfilScreen from '../screens/depanneur/DepanneurProfilScreen';

const Tab = createBottomTabNavigator();

const LogoutButton = ({ navigation }) => {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
      <Ionicons name="log-out" size={24} color="#e94560" />
    </TouchableOpacity>
  );
};

export default function DepanneurNavigator({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Missions') {
            iconName = focused ? 'alert-circle' : 'alert-circle-outline';
          } else if (route.name === 'Suivi') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
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
        component={DepanneurDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Missions"
        component={DepanneurMissionsScreen}
        options={{ title: 'Missions' }}
      />
      <Tab.Screen
        name="Suivi"
        component={DepanneurSuiviScreen}
        options={{ title: 'Suivi' }}
      />
      <Tab.Screen
        name="Profil"
        component={DepanneurProfilScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}
