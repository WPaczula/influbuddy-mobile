import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';

export default function PartnerDetailsSkeleton() {
  const { theme } = useTheme();
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-100, 100]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const SkeletonBox = ({ width, height, style }: { width: number | string; height: number; style?: any }) => (
    <View style={[
      {
        width,
        height,
        backgroundColor: theme.colors.borderLight,
        borderRadius: 6,
        overflow: 'hidden',
      },
      style
    ]}>
      <Animated.View style={[shimmerStyle, styles.shimmer]}>
        <LinearGradient
          colors={[
            'transparent',
            theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
            'transparent'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header skeleton */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <SkeletonBox width={40} height={40} style={{ borderRadius: 8 }} />
        <SkeletonBox width="50%" height={18} />
        <SkeletonBox width={40} height={40} style={{ borderRadius: 8 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile section skeleton */}
        <View style={[styles.profileSection, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <SkeletonBox width={80} height={80} style={{ borderRadius: 16, marginBottom: 16 }} />
          <SkeletonBox width="60%" height={24} style={{ marginBottom: 8 }} />
          <View style={styles.companyRow}>
            <SkeletonBox width={16} height={16} style={{ borderRadius: 2 }} />
            <SkeletonBox width="40%" height={18} />
          </View>
          <SkeletonBox width="30%" height={14} style={{ marginTop: 8, marginBottom: 8 }} />
          <SkeletonBox width="80%" height={14} />
        </View>

        {/* Stats section skeleton */}
        <View style={styles.statsSection}>
          <SkeletonBox width="30%" height={20} style={{ marginBottom: 12 }} />
          <View style={styles.statsGrid}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <SkeletonBox width={40} height={40} style={{ borderRadius: 20, marginBottom: 8 }} />
                <SkeletonBox width="80%" height={18} style={{ marginBottom: 4 }} />
                <SkeletonBox width="60%" height={12} />
              </View>
            ))}
          </View>
        </View>

        {/* Contact section skeleton */}
        <View style={styles.contactSection}>
          <SkeletonBox width="50%" height={20} style={{ marginBottom: 12 }} />
          <View style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={styles.contactItem}>
                <SkeletonBox width={20} height={20} style={{ borderRadius: 2 }} />
                <SkeletonBox width="70%" height={16} />
              </View>
            ))}
          </View>
        </View>

        {/* Notes section skeleton */}
        <View style={styles.notesSection}>
          <SkeletonBox width="20%" height={20} style={{ marginBottom: 12 }} />
          <View style={[styles.notesCard, { backgroundColor: theme.colors.surface }]}>
            <SkeletonBox width="100%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonBox width="80%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonBox width="60%" height={16} />
          </View>
        </View>

        {/* Campaigns section skeleton */}
        <View style={styles.campaignsSection}>
          <SkeletonBox width="40%" height={20} style={{ marginBottom: 16 }} />
          
          {Array.from({ length: 2 }).map((_, index) => (
            <View key={index} style={[styles.campaignCardSkeleton, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.campaignCardHeader}>
                <SkeletonBox width="70%" height={16} />
                <SkeletonBox width={60} height={24} style={{ borderRadius: 6 }} />
              </View>
              <View style={styles.campaignCardFooter}>
                <View style={styles.companySection}>
                  <SkeletonBox width={14} height={14} style={{ borderRadius: 2 }} />
                  <SkeletonBox width="50%" height={14} />
                </View>
                <View style={styles.deadlineSection}>
                  <SkeletonBox width={14} height={14} style={{ borderRadius: 2 }} />
                  <SkeletonBox width={60} height={14} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileSection: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  contactSection: {
    marginBottom: 24,
  },
  contactCard: {
    borderRadius: 16,
    padding: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesCard: {
    borderRadius: 16,
    padding: 20,
  },
  campaignsSection: {
    marginBottom: 24,
  },
  campaignCardSkeleton: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  campaignCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  campaignCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  deadlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
  shimmerGradient: {
    flex: 1,
    width: '100%',
  },
});