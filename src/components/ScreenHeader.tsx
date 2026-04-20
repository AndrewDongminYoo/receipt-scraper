import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    marginBottom: 24,
  },
  description: {
    color: '#5f5f5d',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
  },
  title: {
    color: '#1c1c1c',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'left',
  },
});

export default ScreenHeader;
