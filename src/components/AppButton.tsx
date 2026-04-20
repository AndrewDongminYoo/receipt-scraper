import * as React from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type AppButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  size?: AppButtonSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  title: string;
  variant?: AppButtonVariant;
}

function AppButton({
  disabled = false,
  loading = false,
  onPress,
  size = 'md',
  style,
  testID,
  title,
  variant = 'primary',
}: AppButtonProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      damping: 10,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 10,
      stiffness: 300,
    }).start();
  };

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.base,
          sizeStyles[size],
          variantStyles[variant],
          isDisabled && styles.disabled,
        ]}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'danger' ? colors.surface : colors.primary500}
            size="small"
          />
        ) : (
          <Text style={[styles.label, labelStyles[variant], sizeLabelStyles[size]]}>
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.lg,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontWeight: fontWeights.bold,
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    minHeight: 40,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  md: {
    minHeight: 52,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
  },
  lg: {
    minHeight: 60,
    paddingHorizontal: space['2xl'],
    paddingVertical: space.lg,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary500,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.primary500,
    borderWidth: 2,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.errorText,
  },
});

const labelStyles = StyleSheet.create({
  primary: {
    color: colors.surface,
  },
  secondary: {
    color: colors.primary500,
  },
  ghost: {
    color: colors.primary500,
  },
  danger: {
    color: colors.surface,
  },
});

const sizeLabelStyles = StyleSheet.create({
  sm: {
    fontSize: fontSizes.sm,
  },
  md: {
    fontSize: fontSizes.md,
  },
  lg: {
    fontSize: fontSizes.lg,
  },
});

export default AppButton;
