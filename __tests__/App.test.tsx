/**
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render, screen, userEvent } from '@testing-library/react-native';
import App from '../App';
import { RootStack } from '../src/navigation/RootNavigator';
import { renderWithQueryClient } from '../jest/renderWithQueryClient';

const RootStackComponent = RootStack.getComponent();

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

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
  ['Receipt List', 'screen-receipt-list', 'screen-receipt-list-title'],
  ['Survey', 'screen-survey', 'screen-survey-title'],
  ['Reward Result', 'screen-reward-result', 'screen-reward-result-title'],
])(
  'navigates from Home to %s',
  async (buttonTitle, screenTestID, titleTestID) => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <NavigationContainer>
        <RootStackComponent />
      </NavigationContainer>,
    );

    await user.press(screen.getByText(buttonTitle));

    expect(await screen.findByTestId(screenTestID)).toBeTruthy();
    expect(screen.getByTestId(titleTestID)).toHaveTextContent(buttonTitle);
  },
);

test('opens the upload source sheet from Home before navigating', async () => {
  const user = userEvent.setup();

  renderWithQueryClient(
    <NavigationContainer>
      <RootStackComponent />
    </NavigationContainer>,
  );

  await user.press(screen.getByText('Upload Receipt'));

  expect(await screen.findByTestId('upload-source-sheet')).toBeTruthy();
  expect(screen.getByTestId('upload-source-library')).toBeTruthy();
  expect(screen.getByTestId('upload-source-camera')).toBeTruthy();
});
