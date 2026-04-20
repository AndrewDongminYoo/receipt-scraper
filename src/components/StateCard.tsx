import * as React from 'react';
import {
  Animated,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens';

export type StateCardVariant =
  | 'error'
  | 'info'
  | 'neutral'
  | 'success'
  | 'loading'
  | 'empty';

interface StateCardProps {
  children?: React.ReactNode;
  message: string;
  showsActivityIndicator?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  title: string;
  variant?: StateCardVariant;
}

/** Three bouncing dots shown for loading variant */
function BouncingDots() {
  const [dot1] = React.useState(() => new Animated.Value(0));
  const [dot2] = React.useState(() => new Animated.Value(0));
  const [dot3] = React.useState(() => new Animated.Value(0));

  React.useEffect(() => {
    const makeBounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -8,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.delay(500),
        ]),
      );

    const a1 = makeBounce(dot1, 0);
    const a2 = makeBounce(dot2, 150);
    const a3 = makeBounce(dot3, 300);
    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={dotsStyles.row}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[dotsStyles.dot, { transform: [{ translateY: dot }] }]}
        />
      ))}
    </View>
  );
}

const dotsStyles = StyleSheet.create({
  dot: {
    backgroundColor: colors.primary500,
    borderRadius: radii.full,
    height: 8,
    width: 8,
  },
  row: {
    flexDirection: 'row',
    gap: space.sm,
    justifyContent: 'center',
    marginBottom: space.sm,
  },
});

/** Shake animation wrapper for error variant */
function useShakeAnim() {
  const [translateX] = React.useState(() => new Animated.Value(0));

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(translateX, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 4,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -4,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX]);

  return translateX;
}

function StateCard({
  children,
  message,
  showsActivityIndicator = false,
  style,
  testID,
  title,
  variant = 'neutral',
}: StateCardProps) {
  const shakeX = useShakeAnim();

  const resolvedVariant: 'error' | 'info' | 'neutral' | 'success' =
    variant === 'loading' || variant === 'empty' ? 'neutral' : variant;

  const Wrapper = variant === 'error' ? Animated.View : View;
  const wrapperStyle =
    variant === 'error'
      ? [
          containerStyles[resolvedVariant],
          style,
          { transform: [{ translateX: shakeX }] },
        ]
      : [containerStyles[resolvedVariant], style];

  return (
    <Wrapper
      style={[
        styles.card,
        ...(Array.isArray(wrapperStyle) ? wrapperStyle : [wrapperStyle]),
      ]}
      testID={testID}
    >
      {variant === 'loading' || showsActivityIndicator ? (
        <BouncingDots />
      ) : null}
      <Text style={[styles.title, titleStyles[resolvedVariant]]}>{title}</Text>
      <Text style={[styles.message, messageStyles[resolvedVariant]]}>
        {message}
      </Text>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
    marginTop: 4,
  },
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    gap: space.sm,
    marginBottom: space.lg,
    padding: space.xl,
  },
  message: {
    fontSize: fontSizes.sm,
    lineHeight: 22,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
});

const containerStyles = StyleSheet.create({
  error: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
  },
  info: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.primary200,
  },
  neutral: {
    backgroundColor: colors.ink100,
    borderColor: colors.ink300,
  },
  success: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
});

const titleStyles = StyleSheet.create({
  error: {
    color: colors.errorText,
  },
  info: {
    color: colors.primary600,
  },
  neutral: {
    color: colors.ink900,
  },
  success: {
    color: colors.successText,
  },
});

const messageStyles = StyleSheet.create({
  error: {
    color: colors.errorText,
  },
  info: {
    color: colors.ink700,
  },
  neutral: {
    color: colors.ink500,
  },
  success: {
    color: colors.successText,
  },
});

export default StateCard;
