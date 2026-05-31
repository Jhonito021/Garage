import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TechnicienDashboardScreen from '../screens/technicien/TechnicienDashboardScreen';
import TechnicienInterventionsScreen from '../screens/technicien/TechnicienInterventionsScreen';

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

export default function TechnicienNavigator({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Interventions') {
            iconName = focused ? 'wrench' : 'wrench-outline';
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
        component={TechnicienDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Interventions"
        component={TechnicienInterventionsScreen}
        options={{ title: 'Interventions' }}
      />
    </Tab.Navigator>
  );
}
