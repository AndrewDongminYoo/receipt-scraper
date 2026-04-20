import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { renderWithQueryClient } from '../jest/renderWithQueryClient';
import { RootStack } from '../src/navigation/RootNavigator';

const RootStackComponent = RootStack.getComponent();

type MockRewardResult = {
  answers: {
    paymentMethod: string;
    purchaseFor: string;
    visitPurpose: string;
  };
  message: string;
  pointsAwarded: number;
  submittedAt: string;
  title: string;
};

type SubmitResult = { message: string; result: MockRewardResult };

let latestRewardResult: MockRewardResult | null = null;
let nextSubmitPromise: Promise<SubmitResult> | null = null;
let consoleErrorSpy: jest.SpyInstance;

const mockedFetchLatestRewardResult = jest.fn(async () => latestRewardResult);
const mockedSubmitSurvey = jest.fn(async (answers: Record<string, string>) => {
  if (nextSubmitPromise) {
    const pendingSubmission = nextSubmitPromise;
    nextSubmitPromise = null;
    return pendingSubmission;
  }

  const nextResult: MockRewardResult = {
    answers: {
      paymentMethod: answers.paymentMethod,
      purchaseFor: answers.purchaseFor,
      visitPurpose: answers.visitPurpose,
    },
    message: 'Thanks for sharing your receipt context. Your bonus is ready.',
    pointsAwarded: 35,
    submittedAt: '2026-04-03T12:00:00.000Z',
    title: '35 points earned',
  };

  latestRewardResult = nextResult;

  return {
    message: nextResult.message,
    result: nextResult,
  };
});

jest.mock('../src/api/rewards', () => ({
  fetchLatestRewardResult: () => mockedFetchLatestRewardResult(),
  rewardResultQueryKeys: {
    latest: ['reward-result'],
  },
  submitSurvey: (answers: Record<string, string>) =>
    mockedSubmitSurvey(answers),
}));

beforeEach(() => {
  jest.useFakeTimers();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  latestRewardResult = null;
  nextSubmitPromise = null;
  mockedFetchLatestRewardResult.mockClear();
  mockedSubmitSurvey.mockClear();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  consoleErrorSpy.mockRestore();
});

function renderRootFlow() {
  return renderWithQueryClient(
    <NavigationContainer>
      <RootStackComponent />
    </NavigationContainer>,
  );
}

async function openSurveyScreen(user: ReturnType<typeof userEvent.setup>) {
  await user.press(screen.getByTestId('nav-survey'));
}

async function answerSurveyQuestions(user: ReturnType<typeof userEvent.setup>) {
  await user.press(screen.getByTestId('survey-option-visitPurpose-groceries'));
  await user.press(screen.getByTestId('survey-option-purchaseFor-household'));
  await user.press(screen.getByTestId('survey-option-paymentMethod-card'));
}

test('shows an empty reward state when no survey has been submitted yet', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  renderRootFlow();

  await user.press(screen.getByTestId('nav-reward-result'));

  expect(await screen.findByTestId('screen-reward-result')).toBeTruthy();
  expect(await screen.findByText('아직 설문 결과가 없어요')).toBeTruthy();
  expect(
    consoleErrorSpy.mock.calls.some(
      ([message]) =>
        typeof message === 'string' &&
        message.includes('inside a test was not wrapped in act'),
    ),
  ).toBe(false);
});

test('keeps submit disabled until all required survey answers are selected', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  renderRootFlow();

  await openSurveyScreen(user);
  expect(await screen.findByTestId('screen-survey')).toBeTruthy();

  expect(screen.getByTestId('submit-survey-button')).toBeDisabled();

  await answerSurveyQuestions(user);

  expect(screen.getByTestId('submit-survey-button')).toBeEnabled();
  expect(mockedSubmitSurvey).not.toHaveBeenCalled();
  expect(
    consoleErrorSpy.mock.calls.some(
      ([message]) =>
        typeof message === 'string' &&
        message.includes('inside a test was not wrapped in act'),
    ),
  ).toBe(false);
});

test('disables repeated submit while the survey request is in flight', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  let resolveSubmission!: (
    value: SubmitResult | PromiseLike<SubmitResult>,
  ) => void;

  nextSubmitPromise = new Promise(resolve => {
    resolveSubmission = resolve;
  });

  renderRootFlow();

  await openSurveyScreen(user);
  expect(await screen.findByTestId('screen-survey')).toBeTruthy();
  await answerSurveyQuestions(user);

  await user.press(screen.getByTestId('submit-survey-button'));

  await waitFor(() => {
    expect(screen.getByTestId('survey-submitting')).toBeTruthy();
    expect(screen.getByTestId('submit-survey-button')).toBeDisabled();
  });

  resolveSubmission?.({
    message: 'Thanks for sharing your receipt context. Your bonus is ready.',
    result: {
      answers: {
        paymentMethod: 'card',
        purchaseFor: 'household',
        visitPurpose: 'groceries',
      },
      message: 'Thanks for sharing your receipt context. Your bonus is ready.',
      pointsAwarded: 35,
      submittedAt: '2026-04-03T12:00:00.000Z',
      title: '35 points earned',
    },
  });

  expect(await screen.findByTestId('screen-reward-result')).toBeTruthy();
  expect(
    consoleErrorSpy.mock.calls.some(
      ([message]) =>
        typeof message === 'string' &&
        message.includes('inside a test was not wrapped in act'),
    ),
  ).toBe(false);
});

test('submits the survey and navigates to the reward result screen', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  renderRootFlow();

  await openSurveyScreen(user);
  expect(await screen.findByTestId('screen-survey')).toBeTruthy();
  await answerSurveyQuestions(user);

  await user.press(screen.getByTestId('submit-survey-button'));

  expect(await screen.findByTestId('screen-reward-result')).toBeTruthy();
  expect(
    screen.getByText(
      'Thanks for sharing your receipt context. Your bonus is ready.',
    ),
  ).toBeTruthy();
  expect(screen.getByText('Visit purpose')).toBeTruthy();
  expect(screen.getByText('Groceries')).toBeTruthy();
  expect(
    consoleErrorSpy.mock.calls.some(
      ([message]) =>
        typeof message === 'string' &&
        message.includes('inside a test was not wrapped in act'),
    ),
  ).toBe(false);
});

test('shows a submission error without leaving the survey screen', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  mockedSubmitSurvey.mockRejectedValueOnce(
    new Error('We could not submit your survey. Please try again.'),
  );

  renderRootFlow();

  await openSurveyScreen(user);
  expect(await screen.findByTestId('screen-survey')).toBeTruthy();
  await answerSurveyQuestions(user);

  await user.press(screen.getByTestId('submit-survey-button'));

  expect(
    await screen.findByText(
      'We could not submit your survey. Please try again.',
    ),
  ).toBeTruthy();
  expect(screen.getByTestId('screen-survey')).toBeTruthy();
  expect(
    consoleErrorSpy.mock.calls.some(
      ([message]) =>
        typeof message === 'string' &&
        message.includes('inside a test was not wrapped in act'),
    ),
  ).toBe(false);
});
