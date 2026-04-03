import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import ReceiptListScreen from '../src/screens/ReceiptListScreen';
import { fetchReceipts } from '../src/api/receipts';
import { renderWithQueryClient } from '../jest/renderWithQueryClient';
import type { ReceiptItem } from '../src/types/receipt';

jest.mock('../src/api/receipts', () => ({
  fetchReceipts: jest.fn(),
  receiptQueryKeys: {
    all: ['receipts'],
  },
}));

const mockedFetchReceipts = fetchReceipts as jest.MockedFunction<
  typeof fetchReceipts
>;

const sampleReceipt: ReceiptItem = {
  fileName: 'receipt-001.jpg',
  fileSize: 182340,
  id: 'receipt-1',
  imageUrl: 'file:///tmp/receipt-001.jpg',
  mimeType: 'image/jpeg',
  purchasedAt: '2025-01-01T00:00:00.000Z',
  status: 'pending',
  storeName: 'Pending Review',
};

function createDeferredReceiptsPromise() {
  let resolvePromise: (receipts: ReceiptItem[]) => void = () => undefined;

  const promise = new Promise<ReceiptItem[]>(resolve => {
    resolvePromise = resolve;
  });

  return { promise, resolvePromise };
}

afterEach(() => {
  jest.clearAllMocks();
});

test('shows a loading state while receipts are being fetched', () => {
  const deferredReceipts = createDeferredReceiptsPromise();

  mockedFetchReceipts.mockReturnValue(deferredReceipts.promise);

  renderWithQueryClient(<ReceiptListScreen />);

  expect(screen.getByText('Loading receipts...')).toBeTruthy();
});

test('shows an empty state when no receipts have been uploaded yet', async () => {
  mockedFetchReceipts.mockResolvedValue([]);

  renderWithQueryClient(<ReceiptListScreen />);

  expect(await screen.findByText('No receipts uploaded yet.')).toBeTruthy();
});

test('shows a retry action after a fetch failure', async () => {
  mockedFetchReceipts
    .mockRejectedValueOnce(new Error('Unable to load receipts right now.'))
    .mockResolvedValueOnce([sampleReceipt]);

  renderWithQueryClient(<ReceiptListScreen />);

  expect(
    await screen.findByText('Unable to load receipts right now.'),
  ).toBeTruthy();

  fireEvent.press(screen.getByTestId('retry-receipts-button'));

  expect(await screen.findByText('receipt-001.jpg')).toBeTruthy();
});

test('renders uploaded receipts when data is available', async () => {
  mockedFetchReceipts.mockResolvedValue([sampleReceipt]);

  renderWithQueryClient(<ReceiptListScreen />);

  expect(await screen.findByText('receipt-001.jpg')).toBeTruthy();
  expect(screen.getByText('Pending Review')).toBeTruthy();
});
