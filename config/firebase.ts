import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import * as firebaseAuth from 'firebase/auth';
import { Platform } from 'react-native';

// Only import AsyncStorage on native
let ReactNativeAsyncStorage: any;
if (Platform.OS !== 'web') {
  ReactNativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
}

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
const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence

// Initialize Auth with AsyncStorage persistence on native, default on web
const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: reactNativePersistence(ReactNativeAsyncStorage),
      });

export { auth };
export default app;