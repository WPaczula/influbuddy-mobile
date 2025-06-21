import { Alert, Platform } from 'react-native';
import { alert as alertQueue } from 'react-native-alert-queue';

// Cross-platform alert function
export const showAlert = (
  title: string,
  message: string,
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>
) => {
  if (Platform.OS === 'web') {
    // Use react-native-alert-queue for web
    return alertQueue.show({
      title,
      message,
      buttons: buttons || [{ text: 'OK' }],
    });
  } else {
    // Use React Native's Alert for mobile platforms
    return new Promise<void>((resolve) => {
      Alert.alert(
        title,
        message,
        buttons?.map(button => ({
          text: button.text,
          onPress: () => {
            button.onPress?.();
            resolve();
          },
          style: button.style,
        })) || [{ text: 'OK', onPress: () => resolve() }]
      );
    });
  }
};

// Convenience function for simple alerts
export const alert = (title: string, message: string) => {
  return showAlert(title, message);
};

// Convenience function for confirmation dialogs
export const confirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  return showAlert(title, message, [
    { text: 'Cancel', style: 'cancel', onPress: onCancel },
    { text: 'OK', style: 'default', onPress: onConfirm },
  ]);
};

// Convenience function for destructive confirmation dialogs
export const confirmDestructive = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  return showAlert(title, message, [
    { text: 'Cancel', style: 'cancel', onPress: onCancel },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}; 