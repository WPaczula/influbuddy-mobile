import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export default function LogoutButton({
  variant = 'primary',
  size = 'medium',
  showIcon = true
}: LogoutButtonProps) {
  const { signOut } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    // Skip confirmation alert for web, as it often doesn't work properly in Expo web
    if (Platform.OS === 'web') {
      performLogout();
    } else {
      // Show confirmation alert for mobile platforms
      Alert.alert(
        t.signOut,
        t.signOutConfirmation,
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.signOut,
            style: 'destructive',
            onPress: performLogout
          }
        ]
      );
    }
  };

  const performLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, we still navigate to login since local storage is cleared
      Alert.alert(
        'Warning',
        'Logout completed, but there may have been an issue with the server. You have been signed out locally.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login')
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonStyle = () => {
    const sizeKey = `button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles;
    const baseStyle = [styles.button, styles[sizeKey]];

    switch (variant) {
      case 'primary':
        return [
          ...baseStyle,
          { backgroundColor: theme.colors.error },
          isLoading && { opacity: 0.6 }
        ];
      case 'secondary':
        return [
          ...baseStyle,
          {
            backgroundColor: theme.colors.errorLight,
            borderWidth: 1,
            borderColor: theme.colors.error
          },
          isLoading && { opacity: 0.6 }
        ];
      case 'text':
        return [
          ...baseStyle,
          { backgroundColor: 'transparent' },
          isLoading && { opacity: 0.6 }
        ];
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const sizeKey = `text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles;
    const baseStyle = [styles.text, styles[sizeKey]];

    switch (variant) {
      case 'primary':
        return [...baseStyle, { color: 'white' }];
      case 'secondary':
      case 'text':
        return [...baseStyle, { color: theme.colors.error }];
      default:
        return baseStyle;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handleLogout}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {showIcon && (
        <LogOut
          size={getIconSize()}
          color={variant === 'primary' ? 'white' : theme.colors.error}
        />
      )}
      <Text style={getTextStyle()}>
        {isLoading ? t.signingOut : t.signOut}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  text: {
    fontFamily: 'Inter-SemiBold',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
});