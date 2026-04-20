import * as React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens';

interface PointsBadgeProps {
  points: number;
  testID?: string;
}

function PointsBadge({ points, testID }: PointsBadgeProps) {
  const [displayState, setDisplayState] = React.useState(() => ({
    points,
    value: 0,
  }));
  const [scale] = React.useState(() => new Animated.Value(0.8));
  const displayCount =
    points > 0 && displayState.points === points ? displayState.value : 0;

  // Count-up animation
  React.useEffect(() => {
    if (points <= 0) {
      return;
    }

    const step = Math.max(1, Math.ceil(points / 40));
    const intervalMs = 30;

    const timer = setInterval(() => {
      setDisplayState(prev => {
        const currentValue = prev.points === points ? prev.value : 0;
        const next = currentValue + step;

        if (next >= points) {
          clearInterval(timer);
          return { points, value: points };
        }

        return { points, value: next };
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
