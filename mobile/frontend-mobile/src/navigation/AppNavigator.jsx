import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ClientNavigator from './ClientNavigator';
import DepanneurNavigator from './DepanneurNavigator';
import TechnicienNavigator from './TechnicienNavigator';
import HomeScreen from '../screens/auth/HomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DepanneurLoginScreen from '../screens/depanneur/DepanneurLoginScreen';
import TechnicienLoginScreen from '../screens/technicien/TechnicienLoginScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      console.log('User data:', userData);
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        setIsLoggedIn(true);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return null;
  }

  console.log('IsLoggedIn:', isLoggedIn, 'Role:', userRole);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="DepanneurLogin" component={DepanneurLoginScreen} />
        <Stack.Screen name="TechnicienLogin" component={TechnicienLoginScreen} />
        <Stack.Screen name="Client" component={ClientNavigator} />
        <Stack.Screen name="Depanneur" component={DepanneurNavigator} />
        <Stack.Screen name="Technicien" component={TechnicienNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}