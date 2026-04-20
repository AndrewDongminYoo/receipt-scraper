import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, space } from '../theme/tokens';

interface ScreenHeaderProps {
  description: string;
  title: string;
  titleTestID?: string;
}

function ScreenHeader({ description, title, titleTestID }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} testID={titleTestID}>
        {title}
      </Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: space.xl,
  },
  description: {
    color: colors.ink500,
    fontSize: fontSizes.md,
    lineHeight: 24,
  },
  title: {
    color: colors.ink900,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
    lineHeight: 36,
    marginBottom: space.sm,
  },
});

export default ScreenHeader;
