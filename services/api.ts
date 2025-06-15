import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';

// Use different base URLs based on platform
const API_URL = Platform.select({
  ios: 'https://888b-193-25-251-171.ngrok-free.app/api/v1',
  android: 'https://888b-193-25-251-171.ngrok-free.app/api/v1',
  default: 'https://888b-193-25-251-171.ngrok-free.app/api/v1',
});

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken(true); // Force refresh the token
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['X-User-ID'] = user.uid;
      }
    } else {
      console.warn('No authenticated user found when making API request');
    }
    
    return config;
  } catch (error) {
    console.error('Error adding auth token to request:', error);
    return config;
  }
}); 