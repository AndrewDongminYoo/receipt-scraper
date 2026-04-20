import * as React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens';

interface PointsBadgeProps {
  points: number;
  testID?: string;
}

function PointsBadge({ points, testID }: PointsBadgeProps) {
  const [displayCount, setDisplayCount] = React.useState(0);
  const scale = React.useRef(new Animated.Value(0.8)).current;

  // Count-up animation
  React.useEffect(() => {
    if (points <= 0) {
      return;
    }

    setDisplayCount(0);
    const step = Math.max(1, Math.ceil(points / 40));
    const intervalMs = 30;

    const timer = setInterval(() => {
      setDisplayCount(prev => {
        const next = prev + step;

        if (next >= points) {
          clearInterval(timer);
          return points;
        }

        return next;
      });
    }, intervalMs);

    // Entry bounce
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 8,
      stiffness: 200,
    }).start();

    return () => clearInterval(timer);
  }, [points, scale]);

  return (
    <Animated.View
      style={[styles.badge, { transform: [{ scale }] }]}
      testID={testID}
    >
      <Text style={styles.label}>{displayCount} pts</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.lavender200,
    borderRadius: radii.full,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  label: {
    color: colors.lavender700,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },
});

export default PointsBadge;
