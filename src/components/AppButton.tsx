import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'ghost' | 'surface';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  isLoading?: boolean;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}

function AppButton({
  children,
  disabled,
  isLoading = false,
  onPress,
  size = 'md',
  style,
  testID,
  variant = 'primary',
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fcfbf8' : '#1c1c1c'}
          size="small"
          testID={testID ? `${testID}-spinner` : undefined}
        />
      ) : (
        <Text
          style={[styles.label, labelStyles[variant], sizeTextStyles[size]]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.8,
  },
});

const sizeStyles = StyleSheet.create({
  lg: { paddingHorizontal: 24, paddingVertical: 14 },
  md: { paddingHorizontal: 16, paddingVertical: 10 },
  sm: { paddingHorizontal: 12, paddingVertical: 6 },
});

const sizeTextStyles = StyleSheet.create({
  lg: { fontSize: 17 },
  md: { fontSize: 16 },
  sm: { fontSize: 14 },
});

// Lovable-style inset shadow approximation for primary variant
const variantStyles = StyleSheet.create({
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(28, 28, 28, 0.4)',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  primary: {
    backgroundColor: '#1c1c1c',
    borderColor: 'rgba(0, 0, 0, 0.35)',
    borderTopColor: 'rgba(255, 255, 255, 0.20)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  surface: {
    backgroundColor: '#f7f4ed',
  },
});

const labelStyles = StyleSheet.create({
  ghost: { color: '#1c1c1c' },
  primary: { color: '#fcfbf8' },
  surface: { color: '#1c1c1c' },
});

export default AppButton;
