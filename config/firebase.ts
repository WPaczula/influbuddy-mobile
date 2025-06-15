import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase config - Replace with your actual config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBcxy5Ac2UCOaR4MkumppuFtJDDlRLass0",
  authDomain: "influbuddy-9df22.firebaseapp.com",
  projectId: "influbuddy-9df22",
  storageBucket: "influbuddy-9df22.firebasestorage.app",
  messagingSenderId: "274109631340",
  appId: "1:274109631340:web:49a563c23d2973a37f0149"
};

// Initialize Firebase only if no apps have been initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
export default app;