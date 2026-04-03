/**
 * @format
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import App from '../App';
import { RootStack } from '../src/navigation/RootNavigator';

const RootStackComponent = RootStack.getComponent();

test('App renders without crashing with the Day 1 navigator mounted', () => {
  render(<App />);
});

test('renders the Home screen with all Day 1 navigation buttons', () => {
  render(
    <NavigationContainer>
      <RootStackComponent />
    </NavigationContainer>,
  );

  expect(screen.getByTestId('screen-home')).toBeTruthy();
  expect(screen.getByTestId('screen-home-title').props.children).toBe('Home');
  expect(screen.getByTestId('nav-receipt-upload')).toBeTruthy();
  expect(screen.getByTestId('nav-receipt-list')).toBeTruthy();
  expect(screen.getByTestId('nav-survey')).toBeTruthy();
  expect(screen.getByTestId('nav-reward-result')).toBeTruthy();
});

test.each([
  [
    'nav-receipt-upload',
    'screen-receipt-upload',
    'screen-receipt-upload-title',
    'Upload Receipt',
  ],
  [
    'nav-receipt-list',
    'screen-receipt-list',
    'screen-receipt-list-title',
    'Receipt List',
  ],
  ['nav-survey', 'screen-survey', 'screen-survey-title', 'Survey'],
  [
    'nav-reward-result',
    'screen-reward-result',
    'screen-reward-result-title',
    'Reward Result',
  ],
])(
  'navigates from Home using %s',
  (buttonTestID, screenTestID, titleTestID, expectedTitle) => {
    render(
      <NavigationContainer>
        <RootStackComponent />
      </NavigationContainer>,
    );

    fireEvent.press(screen.getByTestId(buttonTestID));

    expect(screen.getByTestId(screenTestID)).toBeTruthy();
    expect(screen.getByTestId(titleTestID).props.children).toBe(expectedTitle);
  },
);
