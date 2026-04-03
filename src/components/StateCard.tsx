import * as React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type StateCardVariant = 'error' | 'info' | 'neutral' | 'success';

interface StateCardProps {
  children?: React.ReactNode;
  message: string;
  showsActivityIndicator?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  title: string;
  variant?: StateCardVariant;
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
  return (
    <View
      style={[styles.card, containerStyles[variant], style]}
      testID={testID}
    >
      {showsActivityIndicator ? (
        <ActivityIndicator
          color={indicatorColors[variant]}
          size="small"
          testID={testID ? `${testID}-spinner` : undefined}
        />
      ) : null}
      <Text style={[styles.title, titleStyles[variant]]}>{title}</Text>
      <Text style={[styles.message, messageStyles[variant]]}>{message}</Text>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
});

const containerStyles = StyleSheet.create({
  error: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  info: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  neutral: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
  },
  success: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
  },
});

const titleStyles = StyleSheet.create({
  error: {
    color: '#7f1d1d',
  },
  info: {
    color: '#1d4ed8',
  },
  neutral: {
    color: '#111827',
  },
  success: {
    color: '#14532d',
  },
});

const messageStyles = StyleSheet.create({
  error: {
    color: '#991b1b',
  },
  info: {
    color: '#1f2937',
  },
  neutral: {
    color: '#4b5563',
  },
  success: {
    color: '#166534',
  },
});

const indicatorColors: Record<StateCardVariant, string> = {
  error: '#b91c1c',
  info: '#2563eb',
  neutral: '#6b7280',
  success: '#15803d',
};

export default StateCard;
