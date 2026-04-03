import React from 'react';
import {
  render,
  screen,
  waitFor,
  userEvent,
} from '@testing-library/react-native';
import {
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import ReceiptUploadScreen from '../src/screens/ReceiptUploadScreen';
import { uploadReceipt } from '../src/api/receipts';
import type { ReceiptItem, ReceiptUploadResponse } from '../src/types/receipt';

jest.mock('../src/api/receipts', () => ({
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

beforeEach(() => {
  jest.useFakeTimers();
  mockedLaunchImageLibrary.mockResolvedValue({
    assets: [mockAsset],
  } as ImagePickerResponse);
  mockedUploadReceipt.mockResolvedValue(successResponse);
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
});

test('selects a receipt from the library and shows a preview', async () => {
  const user = userEvent.setup();

  render(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));

  const previewImage = await screen.findByTestId('receipt-preview-image');

  expect(mockedLaunchImageLibrary).toHaveBeenCalledTimes(1);
  expect(previewImage.props.source).toEqual({
    uri: mockAsset.uri,
  });
  expect(screen.getByTestId('receipt-file-name').props.children).toBe(
    mockAsset.fileName,
  );
  expect(
    screen.getByTestId('upload-receipt-button').props.accessibilityState
      ?.disabled,
  ).toBe(false);
});

test('uploads a selected receipt and shows a success status', async () => {
  const user = userEvent.setup();

  render(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));
  await screen.findByTestId('receipt-preview-image');

  await user.press(screen.getByTestId('upload-receipt-button'));

  await waitFor(() => {
    expect(mockedUploadReceipt).toHaveBeenCalledWith({
      asset: mockAsset,
      shouldFail: false,
    });
    expect(
      screen.getByTestId('receipt-upload-status-message').props.children,
    ).toBe(successResponse.message);
  });
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

  render(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));
  await screen.findByTestId('receipt-preview-image');

  await user.press(screen.getByTestId('simulate-failure-toggle'));
  await user.press(screen.getByTestId('upload-receipt-button'));

  await waitFor(() => {
    expect(mockedUploadReceipt).toHaveBeenNthCalledWith(1, {
      asset: mockAsset,
      shouldFail: true,
    });
    expect(
      screen.getByTestId('receipt-upload-status-message').props.children,
    ).toBe(
      'Mock upload failed. Review the error state, then retry the same receipt.',
    );
    expect(screen.getByTestId('retry-upload-button')).toBeTruthy();
  });

  await user.press(screen.getByTestId('retry-upload-button'));

  await waitFor(() => {
    expect(mockedUploadReceipt).toHaveBeenNthCalledWith(2, {
      asset: mockAsset,
      shouldFail: false,
    });
    expect(
      screen.getByTestId('receipt-upload-status-message').props.children,
    ).toBe(successResponse.message);
  });
});
