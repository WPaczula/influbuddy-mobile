import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, ArrowRight, Circle, X } from 'lucide-react-native';

interface StatusBadgeProps {
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

export default function StatusBadge({ status, size = 'medium', showLabel = false }: StatusBadgeProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const getStatusConfig = () => {
    switch (status) {
      case 'DRAFT':
        return {
          backgroundColor: theme.colors.textSecondary,
          icon: <Circle size={size === 'small' ? 14 : 16} color="white" strokeWidth={2.5} />,
          label: t.draft,
        };
      case 'ACTIVE':
        return {
          backgroundColor: theme.colors.primary,
          icon: <ArrowRight size={size === 'small' ? 14 : 16} color="white" strokeWidth={2.5} />,
          label: t.active,
        };
      case 'COMPLETED':
        return {
          backgroundColor: theme.colors.success,
          icon: <Check size={size === 'small' ? 14 : 16} color="white" strokeWidth={2.5} />,
          label: t.completed,
        };
      case 'CANCELLED':
        return {
          backgroundColor: theme.colors.error,
          icon: <X size={size === 'small' ? 14 : 16} color="white" strokeWidth={2.5} />,
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
        <View style={styles.iconContainer}>
          {config.icon}
        </View>
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});