import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Campaign } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import StatusBadge from './StatusBadge';
import { Calendar, DollarSign, Clock } from 'lucide-react-native';

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

  const daysLeft = getDaysLeft();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <LinearGradient
        colors={[getStatusColor(campaign.status), getStatusColor(campaign.status) + '20']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.statusBar}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {campaign.title}
          </Text>
          <StatusBadge status={campaign.status} showLabel />
        </View>

        {campaign.description && (
          <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {campaign.description}
          </Text>
        )}

        <View style={styles.details}>
          {campaign.partner && (
            <View style={styles.detail}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                {t.partner}
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {campaign.partner.name}
              </Text>
            </View>
          )}

          {campaign.productValue && (
            <View style={styles.detail}>
              <DollarSign size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                ${campaign.productValue.toLocaleString()}
              </Text>
            </View>
          )}

          {campaign.deadline && (
            <View style={styles.detail}>
              <Calendar size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {new Date(campaign.deadline).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {daysLeft !== null && (
          <View style={styles.footer}>
            <Clock size={16} color={theme.colors.textSecondary} />
            <Text
              style={[
                styles.daysLeft,
                {
                  color:
                    daysLeft < 0
                      ? theme.colors.error
                      : daysLeft === 0
                        ? theme.colors.warning
                        : theme.colors.textSecondary,
                },
              ]}
            >
              {daysLeft < 0
                ? t.daysOverdue.replace('{days}', Math.abs(daysLeft).toString())
                : daysLeft === 0
                  ? t.dueToday
                  : t.daysLeft.replace('{days}', daysLeft.toString())}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  statusBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginRight: 12,
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
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daysLeft: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});