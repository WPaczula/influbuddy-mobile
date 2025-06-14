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
          backgroundGradient: theme.isDark 
            ? ['rgba(214, 188, 250, 0.15)', 'rgba(183, 148, 246, 0.05)']
            : ['rgba(214, 188, 250, 0.08)', 'rgba(183, 148, 246, 0.03)'],
        };
      case 'blue':
        return { 
          backgroundColor: theme.colors.blueLight, 
          iconColor: theme.colors.blue,
          gradientColors: ['#90CDF4', '#63B3ED'], // Softer blue gradients
          backgroundGradient: theme.isDark 
            ? ['rgba(144, 205, 244, 0.15)', 'rgba(99, 179, 237, 0.05)']
            : ['rgba(144, 205, 244, 0.08)', 'rgba(99, 179, 237, 0.03)'],
        };
      case 'green':
        return { 
          backgroundColor: theme.colors.greenLight, 
          iconColor: theme.colors.green,
          gradientColors: ['#9AE6B4', '#68D391'], // Softer green gradients
          backgroundGradient: theme.isDark 
            ? ['rgba(154, 230, 180, 0.15)', 'rgba(104, 211, 145, 0.05)']
            : ['rgba(154, 230, 180, 0.08)', 'rgba(104, 211, 145, 0.03)'],
        };
      case 'orange':
        return { 
          backgroundColor: theme.colors.orangeLight, 
          iconColor: theme.colors.orange,
          gradientColors: ['#FBD38D', '#F6AD55'], // Softer orange gradients
          backgroundGradient: theme.isDark 
            ? ['rgba(251, 211, 141, 0.15)', 'rgba(246, 173, 85, 0.05)']
            : ['rgba(251, 211, 141, 0.08)', 'rgba(246, 173, 85, 0.03)'],
        };
    }
  };

  const colorStyles = getColorStyles();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {/* Main Background Gradient */}
      <LinearGradient
        colors={colorStyles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      
      {/* Subtle accent gradient on the edge */}
      <LinearGradient
        colors={[colorStyles.gradientColors[0] + '20', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 0.3 }}
        style={styles.accentGradient}
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

      {/* Subtle shine effect */}
      <LinearGradient
        colors={[
          'transparent',
          theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.4)',
          'transparent'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.shineEffect}
      />
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
    // Enhanced shadow for more depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  accentGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  content: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    // Add subtle shadow to icon container
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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