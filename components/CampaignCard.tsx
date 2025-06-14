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
    let urgencyText = '';
    
    if (diffDays < 0) {
      urgencyColor = theme.colors.error;
      urgencyText = `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      urgencyColor = theme.colors.warning;
      urgencyText = 'Due today';
    } else if (diffDays <= 3) {
      urgencyColor = theme.colors.warning;
      urgencyText = `${diffDays} days left`;
    } else if (diffDays <= 7) {
      urgencyColor = theme.colors.primary;
      urgencyText = `${diffDays} days left`;
    }

    return {
      formattedDate,
      urgencyColor,
      urgencyText,
      isUrgent: diffDays <= 3,
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

      {/* Partner info */}
      <View style={styles.partnerSection}>
        <Building2 size={16} color={theme.colors.textSecondary} />
        <Text style={[styles.partnerText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {campaign.partner.company}
        </Text>
      </View>

      {/* Footer with deadline */}
      <View style={styles.footer}>
        {deadlineInfo && (
          <View style={styles.deadlineContainer}>
            <View style={[styles.deadlineContent, deadlineInfo.isUrgent && styles.urgentDeadline]}>
              <Calendar size={14} color={deadlineInfo.urgencyColor} />
              <Text style={[styles.deadlineDate, { color: deadlineInfo.urgencyColor }]}>
                {deadlineInfo.formattedDate}
              </Text>
            </View>
            {deadlineInfo.urgencyText && (
              <Text style={[styles.urgencyText, { color: deadlineInfo.urgencyColor }]}>
                {deadlineInfo.urgencyText}
              </Text>
            )}
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
  partnerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  partnerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  deadlineContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  deadlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgentDeadline: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(252, 129, 129, 0.1)', // Light red background for urgent items
  },
  deadlineDate: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  urgencyText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    textAlign: 'right',
  },
});