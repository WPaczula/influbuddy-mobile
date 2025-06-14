import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  colors: {
    background: string;
    surface: string;
    card: string;
    primary: string;
    primaryLight: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    borderLight: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    blue: string;
    blueLight: string;
    purple: string;
    purpleLight: string;
    green: string;
    greenLight: string;
    orange: string;
    orangeLight: string;
    shadow: string;
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    primary: '#B794F6', // Softer purple
    primaryLight: '#F7FAFC',
    text: '#2D3748', // Softer black
    textSecondary: '#718096', // Softer gray
    textTertiary: '#A0AEC0',
    border: '#E2E8F0',
    borderLight: '#F7FAFC',
    success: '#68D391', // Softer green
    successLight: '#F0FFF4',
    warning: '#F6AD55', // Softer orange
    warningLight: '#FFFAF0',
    error: '#FC8181', // Softer red
    errorLight: '#FED7D7',
    blue: '#63B3ED', // Softer blue
    blueLight: '#EBF8FF',
    purple: '#B794F6', // Softer purple
    purpleLight: '#FAF5FF',
    green: '#68D391', // Softer green
    greenLight: '#F0FFF4',
    orange: '#F6AD55', // Softer orange
    orangeLight: '#FFFAF0',
    shadow: '#000000',
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    background: '#1A202C',
    surface: '#2D3748',
    card: '#4A5568',
    primary: '#B794F6', // Keep same softer purple
    primaryLight: '#553C9A',
    text: '#F7FAFC',
    textSecondary: '#CBD5E0',
    textTertiary: '#A0AEC0',
    border: '#4A5568',
    borderLight: '#2D3748',
    success: '#68D391', // Keep same softer green
    successLight: '#276749',
    warning: '#F6AD55', // Keep same softer orange
    warningLight: '#744210',
    error: '#FC8181', // Keep same softer red
    errorLight: '#742A2A',
    blue: '#63B3ED', // Keep same softer blue
    blueLight: '#2A4365',
    purple: '#B794F6', // Keep same softer purple
    purpleLight: '#553C9A',
    green: '#68D391', // Keep same softer green
    greenLight: '#276749',
    orange: '#F6AD55', // Keep same softer orange
    orangeLight: '#744210',
    shadow: '#000000',
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_preference';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize with system preference
  const getInitialTheme = () => {
    const systemColorScheme = Appearance.getColorScheme();
    return systemColorScheme === 'dark';
  };

  const [isDark, setIsDark] = useState(getInitialTheme);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveThemePreference(isDark);
    }
  }, [isDark, isLoaded]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDark(JSON.parse(savedTheme));
      } else {
        // Use system preference if no saved preference
        const systemColorScheme = Appearance.getColorScheme();
        setIsDark(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Fallback to system preference
      const systemColorScheme = Appearance.getColorScheme();
      setIsDark(systemColorScheme === 'dark');
    } finally {
      setIsLoaded(true);
    }
  };

  const saveThemePreference = async (darkMode: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(darkMode));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setTheme = (darkMode: boolean) => {
    setIsDark(darkMode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  // Always render children with theme context
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}