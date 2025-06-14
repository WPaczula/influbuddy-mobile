import { View, StyleSheet, ScrollView } from 'react-native';
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

export default function CalendarSkeleton() {
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
    <View style={styles.container}>
      {/* Month navigation skeleton */}
      <View style={[styles.monthNavigation, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <SkeletonBox width={40} height={40} style={{ borderRadius: 8 }} />
        <SkeletonBox width="40%" height={18} />
        <SkeletonBox width={40} height={40} style={{ borderRadius: 8 }} />
      </View>

      {/* Partner filter skeleton */}
      <View style={[styles.partnerFilter, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.partnerScrollContent}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBox 
              key={index}
              width={80} 
              height={28} 
              style={{ borderRadius: 16, marginRight: 8 }} 
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Calendar skeleton */}
        <View style={[styles.calendar, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
          {/* Calendar header skeleton */}
          <View style={styles.calendarHeader}>
            {Array.from({ length: 7 }).map((_, index) => (
              <SkeletonBox key={index} width="12%" height={14} />
            ))}
          </View>
          
          {/* Calendar weeks skeleton */}
          {Array.from({ length: 6 }).map((weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {Array.from({ length: 7 }).map((dayIndex) => (
                <View key={dayIndex} style={styles.day}>
                  <SkeletonBox width={20} height={16} style={{ marginBottom: 4 }} />
                  {/* Random dots for some days */}
                  {Math.random() > 0.7 && (
                    <View style={styles.campaignDots}>
                      <SkeletonBox width={6} height={6} style={{ borderRadius: 3 }} />
                      <SkeletonBox width={6} height={6} style={{ borderRadius: 3 }} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Campaigns list skeleton */}
        <View style={styles.campaignsList}>
          <SkeletonBox width="60%" height={20} style={{ marginBottom: 16 }} />
          
          {Array.from({ length: 3 }).map((_, index) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  partnerFilter: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  partnerScrollContent: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    padding: 20,
  },
  calendar: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  week: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  day: {
    flex: 1,
    minHeight: 60,
    padding: 4,
    alignItems: 'center',
    borderRadius: 8,
  },
  campaignDots: {
    flexDirection: 'row',
    gap: 2,
  },
  campaignsList: {
    marginBottom: 32,
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