import * as React from 'react';
import {
  ActivityIndicator,
  type StyleProp,
  StyleSheet,
  Text,
  View,
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
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
});

const containerStyles = StyleSheet.create({
  error: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  info: {
    backgroundColor: '#fcfbf8',
    borderColor: '#eceae4',
  },
  neutral: {
    backgroundColor: '#fcfbf8',
    borderColor: '#eceae4',
  },
  success: {
    backgroundColor: '#ecfdf5',
    borderColor: '#6ee7b7',
  },
});

const titleStyles = StyleSheet.create({
  error: { color: '#991b1b' },
  info: { color: '#1c1c1c' },
  neutral: { color: '#1c1c1c' },
  success: { color: '#065f46' },
});

const messageStyles = StyleSheet.create({
  error: { color: '#b91c1c' },
  info: { color: '#5f5f5d' },
  neutral: { color: '#5f5f5d' },
  success: { color: '#047857' },
});

const indicatorColors: Record<StateCardVariant, string> = {
  error: '#991b1b',
  info: '#5f5f5d',
  neutral: '#5f5f5d',
  success: '#065f46',
};

export default StateCard;
