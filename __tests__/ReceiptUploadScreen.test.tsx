import React from 'react';
import { screen, userEvent, waitFor } from '@testing-library/react-native';
import {
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import ReceiptUploadScreen from '../src/screens/ReceiptUploadScreen';
import { uploadReceipt } from '../src/api/receipts';
import { renderWithQueryClient } from '../jest/renderWithQueryClient';
import type { ReceiptItem, ReceiptUploadResponse } from '../src/types/receipt';

jest.mock('../src/api/receipts', () => ({
  receiptQueryKeys: {
    all: ['receipts'],
  },
  uploadReceipt: jest.fn(),
}));

const mockedLaunchImageLibrary = launchImageLibrary as jest.MockedFunction<
  typeof launchImageLibrary
>;
const mockedUploadReceipt = uploadReceipt as jest.MockedFunction<
  typeof uploadReceipt
>;

const mockAsset: Asset = {
  fileName: 'receipt-001.jpg',
  fileSize: 182340,
  type: 'image/jpeg',
  uri: 'file:///tmp/receipt-001.jpg',
};

const mockReceipt: ReceiptItem = {
  fileName: mockAsset.fileName,
  fileSize: mockAsset.fileSize,
  id: 'receipt-1',
  imageUrl: mockAsset.uri!,
  mimeType: mockAsset.type,
  purchasedAt: '2025-01-01T00:00:00.000Z',
  status: 'pending',
  storeName: 'Pending Review',
};

const successResponse: ReceiptUploadResponse = {
  message:
    'Receipt uploaded successfully. It is now queued for review in the mock backend.',
  receipt: mockReceipt,
};

let consoleErrorSpy: jest.SpyInstance;

function expectNoActWarnings() {
  expect(
    consoleErrorSpy.mock.calls.some(
      ([message]) =>
        typeof message === 'string' &&
        message.includes('inside a test was not wrapped in act'),
    ),
  ).toBe(false);
}

beforeEach(() => {
  jest.useFakeTimers();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockedLaunchImageLibrary.mockResolvedValue({
    assets: [mockAsset],
  } as ImagePickerResponse);
  mockedUploadReceipt.mockResolvedValue(successResponse);
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  consoleErrorSpy.mockRestore();
  jest.clearAllMocks();
});

test('selects a receipt from the library and shows a preview', async () => {
  const user = userEvent.setup();

  renderWithQueryClient(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));

  expect(await screen.findByTestId('receipt-preview-image')).toBeTruthy();
  expect(mockedLaunchImageLibrary).toHaveBeenCalledTimes(1);
  expect(screen.getByText('receipt-001.jpg')).toBeTruthy();
  expect(screen.getByText('Ready to upload receipt-001.jpg.')).toBeTruthy();
  expect(screen.getByTestId('upload-receipt-button')).toBeEnabled();
  expectNoActWarnings();
});

test('uploads a selected receipt and shows a success status', async () => {
  const user = userEvent.setup();

  renderWithQueryClient(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));
  expect(await screen.findByTestId('receipt-preview-image')).toBeTruthy();

  await user.press(screen.getByTestId('upload-receipt-button'));

  await waitFor(() => {
    expect(mockedUploadReceipt).toHaveBeenCalledWith({
      asset: mockAsset,
      shouldFail: false,
    });
  });

  expect(await screen.findByText(successResponse.message)).toBeTruthy();
  expectNoActWarnings();
});

test('shows an error state and retries the same receipt after a failed upload', async () => {
  const user = userEvent.setup();

  mockedUploadReceipt
    .mockRejectedValueOnce(
      new Error(
        'Mock upload failed. Review the error state, then retry the same receipt.',
      ),
    )
    .mockResolvedValueOnce(successResponse);

  renderWithQueryClient(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));
  expect(await screen.findByTestId('receipt-preview-image')).toBeTruthy();

  await user.press(screen.getByTestId('simulate-failure-toggle'));
  await user.press(screen.getByTestId('upload-receipt-button'));

  expect(
    await screen.findByText(
      'Mock upload failed. Review the error state, then retry the same receipt.',
    ),
  ).toBeTruthy();
  expect(screen.getByTestId('retry-upload-button')).toBeTruthy();

  await user.press(screen.getByTestId('retry-upload-button'));

  await waitFor(() => {
    expect(mockedUploadReceipt).toHaveBeenNthCalledWith(2, {
      asset: mockAsset,
      shouldFail: false,
    });
  });

  expect(await screen.findByText(successResponse.message)).toBeTruthy();
  expectNoActWarnings();
});
