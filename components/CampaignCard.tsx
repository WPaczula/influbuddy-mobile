import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Campaign } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import StatusBadge from './StatusBadge';
import { Calendar, Building2 } from 'lucide-react-native';

interface CampaignCardProps {
  campaign: Campaign;
  onPress?: () => void;
}

export default function CampaignCard({ campaign, onPress }: CampaignCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const getDeadlineInfo = () => {
    if (!campaign.deadline) return null;
    
    const deadline = new Date(campaign.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate day comparison
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = deadline.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: deadline.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });

    let urgencyColor = theme.colors.textSecondary;
    let isUrgent = false;
    let statusText = formattedDate;
    
    // Only show urgency for non-completed and non-cancelled campaigns
    if (campaign.status !== 'COMPLETED' && campaign.status !== 'CANCELLED') {
      if (diffDays < 0) {
        // Overdue
        urgencyColor = theme.colors.error;
        isUrgent = true;
        const overdueDays = Math.abs(diffDays);
        statusText = `${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue`;
      } else if (diffDays === 0) {
        // Due today
        urgencyColor = theme.colors.warning;
        isUrgent = true;
        statusText = 'Due today';
      } else if (diffDays <= 3) {
        urgencyColor = theme.colors.warning;
        isUrgent = true;
      } else if (diffDays <= 7) {
        urgencyColor = theme.colors.primary;
      }
    }

    return {
      formattedDate: statusText,
      urgencyColor,
      isUrgent,
      isOverdue: diffDays < 0 && campaign.status !== 'COMPLETED' && campaign.status !== 'CANCELLED',
      isDueToday: diffDays === 0 && campaign.status !== 'COMPLETED' && campaign.status !== 'CANCELLED',
    };
  };

  const deadlineInfo = getDeadlineInfo();

  return (
    <TouchableOpacity
      style={[styles.container, { 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.borderLight,
        shadowColor: theme.colors.shadow,
      }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Enhanced subtle background gradient */}
      <LinearGradient
        colors={theme.isDark 
          ? ['rgba(183, 148, 246, 0.08)', 'rgba(104, 211, 145, 0.03)', 'transparent']
          : ['rgba(183, 148, 246, 0.04)', 'rgba(104, 211, 145, 0.02)', 'transparent']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Subtle accent border gradient */}
      <LinearGradient
        colors={[
          theme.colors.primary + '20',
          'transparent'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.borderGradient}
      />

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

      {/* Header with title and status badge */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {campaign.title}
        </Text>
        <StatusBadge status={campaign.status} size="small" />
      </View>

      {/* Footer with company and deadline on same line */}
      <View style={styles.footer}>
        <View style={styles.companySection}>
          <Building2 size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.companyText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {campaign.partner.company}
          </Text>
        </View>
        
        {deadlineInfo && (
          <View style={[
            styles.deadlineSection,
            deadlineInfo.isUrgent && { 
              backgroundColor: deadlineInfo.urgencyColor + '15', // 15% opacity
              borderColor: deadlineInfo.urgencyColor + '30', // 30% opacity
            }
          ]}>
            <Calendar size={14} color={deadlineInfo.urgencyColor} />
            <Text style={[styles.deadlineText, { color: deadlineInfo.urgencyColor }]} numberOfLines={1}>
              {deadlineInfo.formattedDate}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    padding: 16,
    // Enhanced shadow for beautiful depth - matching other cards
    shadowOffset: {
      width: 0,
      height: 6, // Increased from 4
    },
    shadowOpacity: 0.12, // Increased from 0.08
    shadowRadius: 16, // Increased from 12
    elevation: 8, // Increased from 6
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundGradient: {
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
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
    position: 'relative',
    zIndex: 1,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    minHeight: 20, // Ensure consistent height
    position: 'relative',
    zIndex: 1,
  },
  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minHeight: 20, // Ensure consistent height
  },
  companyText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    lineHeight: 18,
    flex: 1,
  },
  deadlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80, // Ensure consistent width
    justifyContent: 'center',
  },
  deadlineText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 14,
    textAlign: 'center',
  },
});