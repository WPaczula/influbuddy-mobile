import { View, Text, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'purple' | 'blue' | 'green' | 'orange';
}

export default function StatsCard({ icon, title, value, subtitle, color = 'purple' }: StatsCardProps) {
  const { theme } = useTheme();

  const getColorStyles = () => {
    switch (color) {
      case 'purple':
        return { 
          backgroundColor: theme.colors.purpleLight, 
          iconColor: theme.colors.purple,
          gradientColors: ['#D6BCFA', '#B794F6'], // Softer purple gradients
        };
      case 'blue':
        return { 
          backgroundColor: theme.colors.blueLight, 
          iconColor: theme.colors.blue,
          gradientColors: ['#90CDF4', '#63B3ED'], // Softer blue gradients
        };
      case 'green':
        return { 
          backgroundColor: theme.colors.greenLight, 
          iconColor: theme.colors.green,
          gradientColors: ['#9AE6B4', '#68D391'], // Softer green gradients
        };
      case 'orange':
        return { 
          backgroundColor: theme.colors.orangeLight, 
          iconColor: theme.colors.orange,
          gradientColors: ['#FBD38D', '#F6AD55'], // Softer orange gradients
        };
    }
  };

  const colorStyles = getColorStyles();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {/* Gradient Background Overlay */}
      <LinearGradient
        colors={[...colorStyles.gradientColors, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />
      
      <View style={styles.content}>
        <LinearGradient
          colors={colorStyles.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          {icon}
        </LinearGradient>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{title}</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    flex: 1,
    minHeight: 140,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03, // Even more subtle
  },
  content: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});