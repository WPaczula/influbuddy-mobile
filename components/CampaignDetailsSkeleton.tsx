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

export default function CampaignDetailsSkeleton() {
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
        {/* Campaign header skeleton */}
        <View style={styles.section}>
          <View style={styles.campaignHeader}>
            <View style={styles.titleSection}>
              <SkeletonBox width="80%" height={24} style={{ marginBottom: 8 }} />
              <View style={styles.partnerInfo}>
                <SkeletonBox width={16} height={16} style={{ borderRadius: 2 }} />
                <SkeletonBox width="40%" height={16} />
              </View>
            </View>
            <SkeletonBox width={80} height={32} style={{ borderRadius: 6 }} />
          </View>

          <SkeletonBox width="100%" height={60} style={{ marginTop: 16, borderRadius: 8 }} />
        </View>

        {/* Timeline skeleton */}
        <View style={styles.section}>
          <SkeletonBox width="30%" height={20} style={{ marginBottom: 16 }} />
          <View style={[styles.timelineCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.timelineItem}>
              <SkeletonBox width="25%" height={14} />
              <SkeletonBox width="35%" height={16} />
            </View>
            <View style={[styles.timelineDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.timelineItem}>
              <SkeletonBox width="20%" height={14} />
              <SkeletonBox width="30%" height={16} />
            </View>
          </View>
        </View>

        {/* Social media posts skeleton */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SkeletonBox width="40%" height={20} />
            <SkeletonBox width={80} height={32} style={{ borderRadius: 8 }} />
          </View>

          {/* Empty state skeleton */}
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}>
            <SkeletonBox width={48} height={48} style={{ borderRadius: 24, marginBottom: 16 }} />
            <SkeletonBox width="60%" height={18} style={{ marginBottom: 8 }} />
            <SkeletonBox width="80%" height={14} />
          </View>
        </View>

        {/* Campaign summary skeleton */}
        <View style={styles.summarySection}>
          <SkeletonBox width="40%" height={20} style={{ marginBottom: 16 }} />
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.summaryHeader}>
              <SkeletonBox width={24} height={24} style={{ borderRadius: 12 }} />
              <View style={styles.summaryInfo}>
                <SkeletonBox width="70%" height={18} style={{ marginBottom: 4 }} />
                <SkeletonBox width="90%" height={14} />
              </View>
            </View>
            <View style={styles.summaryActions}>
              <SkeletonBox width="48%" height={40} style={{ borderRadius: 8 }} />
              <SkeletonBox width="48%" height={40} style={{ borderRadius: 8 }} />
            </View>
          </View>
        </View>

        {/* Action button skeleton */}
        <SkeletonBox width="100%" height={50} style={{ borderRadius: 12, marginTop: 20 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineCard: {
    borderRadius: 16,
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timelineDivider: {
    height: 1,
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  summarySection: {
    marginBottom: 32,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 12,
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