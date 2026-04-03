/**
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import App from '../App';
import { RootStack } from '../src/navigation/RootNavigator';
import { renderWithQueryClient } from '../jest/renderWithQueryClient';

const RootStackComponent = RootStack.getComponent();

test('App renders without crashing with the Day 3 providers mounted', () => {
  render(<App />);
});

test('renders the Home screen with all primary navigation buttons', () => {
  renderWithQueryClient(
    <NavigationContainer>
      <RootStackComponent />
    </NavigationContainer>,
  );

  expect(screen.getByTestId('screen-home-title')).toHaveTextContent('Home');
  expect(screen.getByText('Upload Receipt')).toBeTruthy();
  expect(screen.getByText('Receipt List')).toBeTruthy();
  expect(screen.getByText('Survey')).toBeTruthy();
  expect(screen.getByText('Reward Result')).toBeTruthy();
});

test.each([
  ['Upload Receipt', 'screen-receipt-upload', 'screen-receipt-upload-title'],
  ['Receipt List', 'screen-receipt-list', 'screen-receipt-list-title'],
  ['Survey', 'screen-survey', 'screen-survey-title'],
  ['Reward Result', 'screen-reward-result', 'screen-reward-result-title'],
])(
  'navigates from Home to %s',
  async (buttonTitle, screenTestID, titleTestID) => {
    renderWithQueryClient(
      <NavigationContainer>
        <RootStackComponent />
      </NavigationContainer>,
    );

    fireEvent.press(screen.getByText(buttonTitle));

    expect(await screen.findByTestId(screenTestID)).toBeTruthy();
    expect(screen.getByTestId(titleTestID)).toHaveTextContent(buttonTitle);
  },
);
