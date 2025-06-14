import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Campaign } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import StatusBadge from './StatusBadge';
import { Building2, DollarSign, Calendar } from 'lucide-react-native';

interface CampaignCardProps {
  campaign: Campaign;
  onPress?: () => void;
}

export default function CampaignCard({ campaign, onPress }: CampaignCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'DRAFT':
        return theme.colors.textSecondary;
      case 'ACTIVE':
        return theme.colors.primary;
      case 'COMPLETED':
        return theme.colors.success;
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getDaysLeft = () => {
    if (!campaign.deadline) return null;
    const deadline = new Date(campaign.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDeadlineDate = () => {
    if (!campaign.deadline) return null;
    const deadline = new Date(campaign.deadline);
    return deadline.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const daysLeft = getDaysLeft();
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
      {/* Subtle gradient overlay */}
      <LinearGradient
        colors={[theme.colors.primary + '02', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />

      <View style={styles.content}>
        {/* Header with title and status badge */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
            {campaign.title}
          </Text>
          <View style={styles.statusBadge}>
            <StatusBadge status={campaign.status} size="small" />
          </View>
        </View>

        {/* Description */}
        {campaign.description && (
          <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {campaign.description}
          </Text>
        )}

        {/* Campaign details */}
        <View style={styles.details}>
          {campaign.partner && (
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Building2 size={14} color={theme.colors.primary} />
              </View>
              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {campaign.partner.name}
              </Text>
            </View>
          )}

          {campaign.productValue && (
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: theme.colors.greenLight }]}>
                <DollarSign size={14} color={theme.colors.green} />
              </View>
              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                ${campaign.productValue.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Footer with days left and deadline date */}
        <View style={styles.footer}>
          <View style={styles.daysLeftContainer}>
            {daysLeft !== null && (
              <Text
                style={[
                  styles.daysLeft,
                  {
                    color:
                      daysLeft < 0
                        ? theme.colors.error
                        : daysLeft === 0
                          ? theme.colors.warning
                          : daysLeft <= 3
                            ? theme.colors.warning
                            : theme.colors.textSecondary,
                  },
                ]}
              >
                {daysLeft < 0
                  ? `${Math.abs(daysLeft)} days overdue`
                  : daysLeft === 0
                    ? 'Due today'
                    : `${daysLeft} days left`}
              </Text>
            )}
          </View>

          {deadlineDate && (
            <View style={styles.deadlineContainer}>
              <Calendar size={14} color={theme.colors.textTertiary} />
              <Text style={[styles.deadlineDate, { color: theme.colors.textTertiary }]}>
                {deadlineDate}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 24,
  },
  statusBadge: {
    flexShrink: 0,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 120,
  },
  detailIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysLeftContainer: {
    flex: 1,
  },
  daysLeft: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
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