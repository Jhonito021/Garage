import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Remplacez par l'IP de votre ordinateur
// Pour trouver votre IP: ipconfig (Windows) ou ifconfig (Mac/Linux)
const API_URL = 'http://192.168.56.1:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;