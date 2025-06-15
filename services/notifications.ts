import * as Notifications from 'expo-notifications';
import { api } from './api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationsService = {
  // Request permission for push notifications and register with backend
  async requestPermissionsAndRegister() {
    debugger;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }

    // Get push token
    const token = await Notifications.getExpoPushTokenAsync();
    
    // Store token in backend (correct endpoint)
    try {
      await api.post('/notifications/push-token', { token: token.data });
      return true;
    } catch (error) {
      console.error('Error storing push token:', error);
      return false;
    }
  },
}; 