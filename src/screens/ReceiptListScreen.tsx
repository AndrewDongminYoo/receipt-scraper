import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function ReceiptListScreen() {
  return (
    <View style={styles.container} testID="screen-receipt-list">
      <Text style={styles.title} testID="screen-receipt-list-title">
        Receipt List
      </Text>
      <Text style={styles.description}>Receipt list placeholder screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default ReceiptListScreen;
