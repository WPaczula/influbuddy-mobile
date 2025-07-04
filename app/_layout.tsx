import '@/config/firebase';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider, useAuth } from '@/contexts/FirebaseAuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotifications } from '@/hooks/useNotifications';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
    },
  },
});

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { theme, isLoaded: themeLoaded } = useTheme();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  useNotifications(); // Initialize notifications

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const isReady = (fontsLoaded || fontError) && themeLoaded && !authLoading;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Show loading screen while initializing
  if (!isReady) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: theme.colors.background
      }} />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'none',
        presentation: 'card',
        gestureEnabled: false,
      }}>
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme.isDark ? "light" : "dark"} backgroundColor={theme.colors.background} />
    </View>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <AlertProvider>
              <RootLayoutContent />
            </AlertProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}