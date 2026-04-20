import * as React from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens';

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
    backgroundColor: colors.surface,
    borderColor: colors.ink300,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: space.lg,
    padding: space.xl,
    shadowColor: colors.ink500,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  description: {
    color: colors.ink500,
    fontSize: fontSizes.sm,
    lineHeight: 22,
    marginBottom: space.lg,
  },
  title: {
    color: colors.ink900,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    marginBottom: space.sm,
  },
});

export default SectionCard;
