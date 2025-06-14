import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = deadline.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: deadline.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });

    let urgencyColor = theme.colors.textSecondary;
    let isUrgent = false;
    
    if (diffDays < 0) {
      urgencyColor = theme.colors.error;
      isUrgent = true;
    } else if (diffDays === 0) {
      urgencyColor = theme.colors.warning;
      isUrgent = true;
    } else if (diffDays <= 3) {
      urgencyColor = theme.colors.warning;
      isUrgent = true;
    } else if (diffDays <= 7) {
      urgencyColor = theme.colors.primary;
    }

    return {
      formattedDate,
      urgencyColor,
      isUrgent,
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
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