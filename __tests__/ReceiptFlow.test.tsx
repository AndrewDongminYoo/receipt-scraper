import React from 'react';
import {
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react-native';
import {
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import ReceiptUploadScreen from '../src/screens/ReceiptUploadScreen';
import ReceiptListScreen from '../src/screens/ReceiptListScreen';
import { renderWithQueryClient } from '../jest/renderWithQueryClient';
import type { ReceiptItem } from '../src/types/receipt';

const mockedLaunchImageLibrary = launchImageLibrary as jest.MockedFunction<
  typeof launchImageLibrary
>;

const mockAsset: Asset = {
  fileName: 'receipt-001.jpg',
  fileSize: 182340,
  type: 'image/jpeg',
  uri: 'file:///tmp/receipt-001.jpg',
};

let mockReceiptStore: ReceiptItem[] = [];

jest.mock('../src/api/receipts', () => ({
  fetchReceipts: jest.fn(async () => mockReceiptStore),
  receiptQueryKeys: {
    all: ['receipts'],
  },
  uploadReceipt: jest.fn(async ({ asset, shouldFail = false }) => {
    if (shouldFail) {
      throw new Error(
        'Mock upload failed. Review the error state, then retry the same receipt.',
      );
    }

    const nextReceipt: ReceiptItem = {
      fileName: asset.fileName,
      fileSize: asset.fileSize,
      id: `receipt-${mockReceiptStore.length + 1}`,
      imageUrl: asset.uri,
      mimeType: asset.type,
      purchasedAt: '2025-01-01T00:00:00.000Z',
      status: 'pending',
      storeName: 'Pending Review',
    };

    mockReceiptStore = [nextReceipt, ...mockReceiptStore];

    return {
      message:
        'Receipt uploaded successfully. It is now queued for review in the mock backend.',
      receipt: nextReceipt,
    };
  }),
}));

function ReceiptFlowHarness() {
  return (
    <>
      <ReceiptUploadScreen />
      <ReceiptListScreen />
    </>
  );
}

beforeEach(() => {
  mockReceiptStore = [];
  mockedLaunchImageLibrary.mockResolvedValue({
    assets: [mockAsset],
  } as ImagePickerResponse);
});

afterEach(() => {
  jest.clearAllMocks();
});

test('refreshes the receipt list after a successful upload', async () => {
  renderWithQueryClient(<ReceiptFlowHarness />);

  expect(await screen.findByText('No receipts uploaded yet.')).toBeTruthy();

  fireEvent.press(screen.getByTestId('pick-receipt-button'));
  expect(await screen.findByTestId('receipt-preview-image')).toBeTruthy();

  fireEvent.press(screen.getByTestId('upload-receipt-button'));

  expect(
    await screen.findByText(
      'Receipt uploaded successfully. It is now queued for review in the mock backend.',
    ),
  ).toBeTruthy();

  await waitFor(() => {
    const receiptListItem = screen.getByTestId('receipt-list-item-receipt-1');

    expect(within(receiptListItem).getByText('receipt-001.jpg')).toBeTruthy();
    expect(within(receiptListItem).getByText('Pending Review')).toBeTruthy();
  });
});
