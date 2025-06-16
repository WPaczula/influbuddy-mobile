import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatusBadgeProps {
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'WAITING_FOR_PAYMENT';
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

export default function StatusBadge({ status, size = 'medium', showLabel = false }: StatusBadgeProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  console.log(status);

  const getStatusConfig = () => {
    switch (status) {
      case 'DRAFT':
        return {
          backgroundColor: theme.colors.textSecondary,
          text: t.draft.toUpperCase(),
          label: t.draft,
        };
      case 'ACTIVE':
        return {
          backgroundColor: theme.colors.primary,
          text: t.active.toUpperCase(),
          label: t.active,
        };
      case 'COMPLETED':
        return {
          backgroundColor: theme.colors.success,
          text: t.completed.toUpperCase(),
          label: t.completed,
        };
      case 'WAITING_FOR_PAYMENT':
        return {
          backgroundColor: theme.colors.blue,
          text: t.waitingForPayment.toUpperCase(),
          label: t.waitingForPayment,
        };
      case 'CANCELLED':
        return {
          backgroundColor: theme.colors.error,
          text: t.cancelled.toUpperCase(),
          label: t.cancelled,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={styles.container}>
      <View style={[
        styles.badge,
        size === 'small' && styles.badgeSmall,
        { backgroundColor: config.backgroundColor }
      ]}>
        <Text style={[
          styles.badgeText,
          size === 'small' && styles.badgeTextSmall
        ]}>
          {config.text}
        </Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{config.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    minWidth: 50,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  badgeTextSmall: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});