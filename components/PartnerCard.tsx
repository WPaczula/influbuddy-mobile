import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Partner } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { Building2, TrendingUp } from 'lucide-react-native';

interface PartnerCardProps {
  partner: Partner;
  onPress?: () => void;
}

export default function PartnerCard({ partner, onPress }: PartnerCardProps) {
  const { theme } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { 
        backgroundColor: theme.colors.surface, 
        borderColor: theme.colors.borderLight,
        shadowColor: theme.colors.shadow,
      }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      {/* Enhanced gradient overlay */}
      <LinearGradient
        colors={theme.isDark 
          ? ['rgba(183, 148, 246, 0.08)', 'rgba(104, 211, 145, 0.03)', 'transparent']
          : ['rgba(183, 148, 246, 0.04)', 'rgba(104, 211, 145, 0.02)', 'transparent']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />

      {/* Subtle accent border gradient */}
      <LinearGradient
        colors={[
          theme.colors.primary + '20',
          theme.colors.success + '10',
          'transparent'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.borderGradient}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#D6BCFA', '#B794F6']} // Softer purple gradients
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {partner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </LinearGradient>
          
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{partner.name}</Text>
            <View style={styles.companyRow}>
              <Building2 size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.company, { color: theme.colors.textSecondary }]}>{partner.company}</Text>
            </View>
          </View>
          
          <View style={styles.stats}>
            <View style={styles.earningsContainer}>
              <TrendingUp size={16} color={theme.colors.success} />
              <Text style={[styles.earnings, { color: theme.colors.success }]}>{formatCurrency(partner.totalEarnings)}</Text>
            </View>
            <Text style={[styles.campaigns, { color: theme.colors.textSecondary }]}>{partner.activeCampaigns} active</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    // Enhanced shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  borderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  content: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    // Add subtle shadow to avatar
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  company: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  stats: {
    alignItems: 'flex-end',
  },
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  earnings: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  campaigns: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});