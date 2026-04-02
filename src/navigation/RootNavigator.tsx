import * as React from 'react';
import {
  createStaticNavigation,
  type StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ReceiptListScreen from '../screens/ReceiptListScreen';
import ReceiptUploadScreen from '../screens/ReceiptUploadScreen';
import RewardResultScreen from '../screens/RewardResultScreen';
import SurveyScreen from '../screens/SurveyScreen';

export const RootStack = createNativeStackNavigator({
  initialRouteName: 'Home',
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: 'Home',
      },
    },
    ReceiptUpload: {
      screen: ReceiptUploadScreen,
      options: {
        title: 'Upload Receipt',
      },
    },
    ReceiptList: {
      screen: ReceiptListScreen,
      options: {
        title: 'Receipt List',
      },
    },
    Survey: {
      screen: SurveyScreen,
      options: {
        title: 'Survey',
      },
    },
    RewardResult: {
      screen: RewardResultScreen,
      options: {
        title: 'Reward Result',
      },
    },
  },
});

export type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack);

function RootNavigator() {
  return <Navigation />;
}

export default RootNavigator;
