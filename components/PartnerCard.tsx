import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Partner } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { Building2, Mail, Phone, Globe, TrendingUp } from 'lucide-react-native';

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
      }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      {/* Subtle gradient overlay */}
      <LinearGradient
        colors={[theme.colors.primary + '04', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
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

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <View style={[styles.detailIcon, { backgroundColor: '#EBF8FF' }]}>
              <Mail size={12} color="#63B3ED" />
            </View>
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>{partner.email}</Text>
          </View>
          
          {partner.phone && (
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#F0FFF4' }]}>
                <Phone size={12} color="#68D391" />
              </View>
              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{partner.phone}</Text>
            </View>
          )}
          
          {partner.website && (
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: '#FFFAF0' }]}>
                <Globe size={12} color="#F6AD55" />
              </View>
              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>{partner.website}</Text>
            </View>
          )}
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
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  details: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
});