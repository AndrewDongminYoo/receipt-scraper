import * as React from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

interface SectionCardProps {
  children: React.ReactNode;
  description?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  title?: string;
}

function SectionCard({
  children,
  description,
  style,
  testID,
  title,
}: SectionCardProps) {
  return (
    <View style={[styles.card, style]} testID={testID}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fcfbf8',
    borderColor: '#eceae4',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
  },
  description: {
    color: '#5f5f5d',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  title: {
    color: '#1c1c1c',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default SectionCard;
