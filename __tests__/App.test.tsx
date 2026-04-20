/**
 * @format
 */

import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { render, screen, userEvent } from '@testing-library/react-native';

import App from '../App';
import { renderWithQueryClient } from '../jest/renderWithQueryClient';
import { RootStack } from '../src/navigation/RootNavigator';

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
  expect(screen.toJSON()).not.toBeNull();
});

test('renders the Home screen with all primary navigation buttons', () => {
  renderWithQueryClient(
    <NavigationContainer>
      <RootStackComponent />
    </NavigationContainer>,
  );

  expect(screen.getByTestId('screen-home-title')).toHaveTextContent(
    'Receipt Club',
  );
  expect(screen.getByText('영수증 올리기')).toBeTruthy();
  expect(screen.getByText('내 영수증')).toBeTruthy();
  expect(screen.getByText('설문 참여')).toBeTruthy();
  expect(screen.getByText('리워드 결과')).toBeTruthy();
});

test.each([
  ['nav-receipt-list', 'screen-receipt-list', '내 영수증 📋'],
  ['nav-survey', 'screen-survey', '설문에 답하고\n포인트를 받아요 📝'],
  ['nav-reward-result', 'screen-reward-result', '아직 설문 결과가 없어요'],
])(
  'navigates from Home using %s',
  async (buttonTestID, screenTestID, expectedText) => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderWithQueryClient(
      <NavigationContainer>
        <RootStackComponent />
      </NavigationContainer>,
    );

    await user.press(screen.getByTestId(buttonTestID));

    expect(await screen.findByTestId(screenTestID)).toBeTruthy();
    expect(await screen.findByText(expectedText)).toBeTruthy();
  },
);

test('opens the upload source sheet from Home before navigating', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  renderWithQueryClient(
    <NavigationContainer>
      <RootStackComponent />
    </NavigationContainer>,
  );

  await user.press(screen.getByTestId('nav-receipt-upload'));

  expect(await screen.findByTestId('upload-source-sheet')).toBeTruthy();
  expect(screen.getByTestId('upload-source-library')).toBeTruthy();
  expect(screen.getByTestId('upload-source-camera')).toBeTruthy();
});
