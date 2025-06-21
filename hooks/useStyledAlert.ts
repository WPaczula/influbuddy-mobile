import { useState, useCallback } from 'react';

export interface StyledAlertConfig {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

export function useStyledAlert() {
  const [alertConfig, setAlertConfig] = useState<StyledAlertConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = useCallback((config: StyledAlertConfig) => {
    setAlertConfig(config);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    setAlertConfig(null);
  }, []);

  const alert = useCallback((title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    showAlert({ title, message, type });
  }, [showAlert]);

  const confirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    showAlert({
      title,
      message,
      type,
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'OK', style: 'default', onPress: onConfirm },
      ],
    });
  }, [showAlert]);

  const confirmDestructive = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) => {
    showAlert({
      title,
      message,
      type: 'error',
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'Delete', style: 'destructive', onPress: onConfirm },
      ],
    });
  }, [showAlert]);

  return {
    alertConfig,
    isVisible,
    showAlert,
    hideAlert,
    alert,
    confirm,
    confirmDestructive,
  };
} 