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
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'left',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'left',
  },
});

export default ScreenHeader;
