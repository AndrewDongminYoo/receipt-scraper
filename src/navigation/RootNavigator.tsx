import * as React from 'react';

import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ReceiptListScreen from '../screens/ReceiptListScreen';
import ReceiptUploadScreen from '../screens/ReceiptUploadScreen';
import RewardResultScreen from '../screens/RewardResultScreen';
import SurveyScreen from '../screens/SurveyScreen';

export type ReceiptUploadLaunchMode = 'camera' | 'library';

export type RootStackParamList = {
  Home: undefined;
  ReceiptUpload:
    | {
        autoStart?: boolean;
        launchMode?: ReceiptUploadLaunchMode;
      }
    | undefined;
  ReceiptList: undefined;
  Survey: undefined;
  RewardResult: undefined;
};

const screenOptions = {
  contentStyle: { backgroundColor: '#f7f4ed' },
  headerStyle: { backgroundColor: '#f7f4ed' },
  headerTintColor: '#1c1c1c',
  headerTitleStyle: { color: '#1c1c1c', fontWeight: '600' as const },
};

export const RootStack = createNativeStackNavigator({
  initialRouteName: 'Home',
  screenOptions: screenOptions,
  screens: {
    Home: {
      screen: HomeScreen,
      options: { title: 'Home' },
    },
    ReceiptUpload: {
      screen: ReceiptUploadScreen,
      options: { title: 'Upload Receipt' },
    },
    ReceiptList: {
      screen: ReceiptListScreen,
      options: { title: 'Receipt List' },
    },
    Survey: {
      screen: SurveyScreen,
      options: { title: 'Survey' },
    },
    RewardResult: {
      screen: RewardResultScreen,
      options: { title: 'Reward Result' },
    },
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack);

function RootNavigator() {
  return <Navigation />;
}

export default RootNavigator;
