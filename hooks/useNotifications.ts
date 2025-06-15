import { useEffect } from 'react';
import { notificationsService } from '../services/notifications';
import { useAuth } from '@/contexts/FirebaseAuthContext';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    const initializeNotifications = async () => {
      try {
        await notificationsService.requestPermissionsAndRegister();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, [isAuthenticated]);
}; 