import { View, StyleSheet } from 'react-native';
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

export default function PartnerCardSkeleton() {
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
    <View style={[styles.card, { 
      backgroundColor: theme.colors.surface, 
      borderColor: theme.colors.borderLight,
    }]}>
      {/* Subtle gradient overlay skeleton */}
      <View style={styles.gradientOverlay} />

      <View style={styles.content}>
        <View style={styles.header}>
          {/* Avatar skeleton */}
          <SkeletonBox width={56} height={56} style={{ borderRadius: 16, marginRight: 16 }} />
          
          {/* Info section skeleton */}
          <View style={styles.info}>
            <SkeletonBox width="80%" height={18} style={{ marginBottom: 6 }} />
            <View style={styles.companyRow}>
              <SkeletonBox width={14} height={14} style={{ borderRadius: 2, marginRight: 6 }} />
              <SkeletonBox width="60%" height={14} />
            </View>
          </View>
          
          {/* Stats section skeleton */}
          <View style={styles.stats}>
            <View style={styles.earningsContainer}>
              <SkeletonBox width={16} height={16} style={{ borderRadius: 2, marginRight: 4 }} />
              <SkeletonBox width={60} height={18} />
            </View>
            <SkeletonBox width={50} height={12} style={{ marginTop: 4 }} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.02,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    alignItems: 'flex-end',
  },
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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