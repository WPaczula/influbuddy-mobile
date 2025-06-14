import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Campaign } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import StatusBadge from './StatusBadge';
import { Calendar } from 'lucide-react-native';

interface CampaignCardProps {
  campaign: Campaign;
  onPress?: () => void;
}

export default function CampaignCard({ campaign, onPress }: CampaignCardProps) {
  const { theme } = useTheme();

  const formatDeadlineDate = () => {
    if (!campaign.deadline) return null;
    const deadline = new Date(campaign.deadline);
    return deadline.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const deadlineDate = formatDeadlineDate();

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

      {/* Description */}
      {campaign.description && (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {campaign.description}
        </Text>
      )}

      {/* Footer with deadline */}
      {deadlineDate && (
        <View style={styles.footer}>
          <View style={styles.deadlineContainer}>
            <Calendar size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.deadlineDate, { color: theme.colors.textSecondary }]}>
              {deadlineDate}
            </Text>
          </View>
        </View>
      )}
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
    marginBottom: 8,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineDate: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
});