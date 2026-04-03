import React from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import RewardResultScreen from '../src/screens/RewardResultScreen';
import { fetchLatestRewardResult } from '../src/api/rewards';
import { renderWithQueryClient } from '../jest/renderWithQueryClient';

const mockedNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockedNavigate,
  }),
}));

jest.mock('../src/api/rewards', () => ({
  fetchLatestRewardResult: jest.fn(),
  rewardResultQueryKeys: {
    latest: ['reward-result'],
  },
}));

const mockedFetchLatestRewardResult =
  fetchLatestRewardResult as jest.MockedFunction<
    typeof fetchLatestRewardResult
  >;

beforeEach(() => {
  jest.useFakeTimers();
  mockedNavigate.mockClear();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
});

test('shows a retry action after failing to load the latest reward result', async () => {
  const user = userEvent.setup();
  let shouldResolveAfterRetry = false;

  mockedFetchLatestRewardResult.mockImplementation(async () => {
    if (!shouldResolveAfterRetry) {
      throw new Error('Unable to load the latest reward result right now.');
    }

    return null;
  });

  renderWithQueryClient(<RewardResultScreen />);

  expect(
    await screen.findByText(
      'Unable to load the latest reward result right now.',
    ),
  ).toBeTruthy();

  shouldResolveAfterRetry = true;
  await user.press(screen.getByTestId('retry-reward-result-button'));

  expect(
    await screen.findByText('Complete the survey to calculate your reward.'),
  ).toBeTruthy();
});
