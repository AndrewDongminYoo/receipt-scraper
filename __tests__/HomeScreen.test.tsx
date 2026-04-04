import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { screen, userEvent } from '@testing-library/react-native';
import { renderWithQueryClient } from '../jest/renderWithQueryClient';
import HomeScreen from '../src/screens/HomeScreen';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}));

const mockedUseNavigation = useNavigation as jest.MockedFunction<
  typeof useNavigation
>;
const navigate = jest.fn();
let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.useFakeTimers();
  navigate.mockReset();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockedUseNavigation.mockReturnValue({
    navigate,
  } as never);
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  consoleErrorSpy.mockRestore();
});

function expectNoActWarnings() {
  expect(
    consoleErrorSpy.mock.calls.some(
      ([message]) =>
        typeof message === 'string' &&
        message.includes('inside a test was not wrapped in act'),
    ),
  ).toBe(false);
}

test('opens the upload source sheet before navigating to receipt upload', async () => {
  const user = userEvent.setup();

  renderWithQueryClient(<HomeScreen />);

  await user.press(screen.getByTestId('nav-receipt-upload'));

  expect(screen.getByTestId('upload-source-sheet')).toBeTruthy();
  expect(screen.getByTestId('upload-source-library')).toBeTruthy();
  expect(screen.getByTestId('upload-source-camera')).toBeTruthy();
  expect(navigate).not.toHaveBeenCalled();
  expectNoActWarnings();
});

test('navigates to receipt upload with library auto-start intent', async () => {
  const user = userEvent.setup();

  renderWithQueryClient(<HomeScreen />);

  await user.press(screen.getByTestId('nav-receipt-upload'));
  await user.press(screen.getByTestId('upload-source-library'));

  expect(navigate).toHaveBeenCalledWith('ReceiptUpload', {
    autoStart: true,
    launchMode: 'library',
  });
  expectNoActWarnings();
});

test('shows scanner guide before navigating to camera auto-start', async () => {
  const user = userEvent.setup();

  renderWithQueryClient(<HomeScreen />);

  await user.press(screen.getByTestId('nav-receipt-upload'));
  await user.press(screen.getByTestId('upload-source-camera'));

  expect(screen.getByTestId('scanner-guide-modal')).toBeTruthy();
  expect(navigate).not.toHaveBeenCalled();

  await user.press(screen.getByTestId('scanner-guide-start'));

  expect(navigate).toHaveBeenCalledWith('ReceiptUpload', {
    autoStart: true,
    launchMode: 'camera',
  });
  expectNoActWarnings();
});
