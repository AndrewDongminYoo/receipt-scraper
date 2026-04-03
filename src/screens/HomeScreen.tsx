import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../navigation/RootNavigator';

const destinations: Array<{
  route: keyof Omit<RootStackParamList, 'Home'>;
  testID: string;
  title: string;
}> = [
  {
    route: 'ReceiptUpload',
    testID: 'nav-receipt-upload',
    title: 'Upload Receipt',
  },
  {
    route: 'ReceiptList',
    testID: 'nav-receipt-list',
    title: 'Receipt List',
  },
  {
    route: 'Survey',
    testID: 'nav-survey',
    title: 'Survey',
  },
  {
    route: 'RewardResult',
    testID: 'nav-reward-result',
    title: 'Reward Result',
  },
];

function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container} testID="screen-home">
      <Text style={styles.title} testID="screen-home-title">
        Home
      </Text>
      <Text style={styles.description}>
        Choose a destination to preview the current practice app flow.
      </Text>
      <View style={styles.buttonGroup}>
        {destinations.map(destination => (
          <View key={destination.route} style={styles.buttonWrapper}>
            <Button
              onPress={() => navigation.navigate(destination.route)}
              testID={destination.testID}
              title={destination.title}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
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
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonGroup: {
    gap: 12,
  },
  buttonWrapper: {
    width: '100%',
  },
});

export default HomeScreen;
