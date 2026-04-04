import React from 'react';
import { screen, userEvent } from '@testing-library/react-native';
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
  extractedMetadata: {
    itemCount: 2,
    lineItems: [
      {
        amount: '3,500원',
        name: '김밥',
        quantity: '1',
        unitPrice: '3,500원',
      },
      {
        amount: '2,400원',
        name: '삼각김밥',
        quantity: '2',
        unitPrice: '1,200원',
      },
    ],
    paymentMethod: '카드',
    totalAmount: '5,900원',
    vatAmount: '536원',
  },
  fileName: 'receipt-001.jpg',
  fileSize: 182340,
  id: 'receipt-1',
  imageUrl: 'file:///tmp/receipt-001.jpg',
  mimeType: 'image/jpeg',
  ocrText: [
    '팀리미티드 편의점',
    '상품명 단가 수량 금액',
    '김밥 3,500 1 3,500',
    '삼각김밥 1,200 2 2,400',
    '부가세 536원',
    '합계 5,900원',
    '카드 일시불',
  ].join('\n'),
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

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
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
  const user = userEvent.setup();

  mockedFetchReceipts
    .mockRejectedValueOnce(new Error('Unable to load receipts right now.'))
    .mockResolvedValueOnce([sampleReceipt]);

  renderWithQueryClient(<ReceiptListScreen />);

  expect(
    await screen.findByText('Unable to load receipts right now.'),
  ).toBeTruthy();

  await user.press(screen.getByTestId('retry-receipts-button'));

  expect(await screen.findByText('receipt-001.jpg')).toBeTruthy();
});

test('renders uploaded receipts when data is available', async () => {
  mockedFetchReceipts.mockResolvedValue([sampleReceipt]);

  renderWithQueryClient(<ReceiptListScreen />);

  expect(await screen.findByText('receipt-001.jpg')).toBeTruthy();
  expect(screen.getByText('Pending Review')).toBeTruthy();
});

test('renders extracted receipt metadata and OCR text when available', async () => {
  mockedFetchReceipts.mockResolvedValue([sampleReceipt]);

  renderWithQueryClient(<ReceiptListScreen />);

  expect(await screen.findByText('Total: 5,900원')).toBeTruthy();
  expect(screen.getByText('VAT: 536원')).toBeTruthy();
  expect(screen.getByText('Payment: 카드')).toBeTruthy();
  expect(
    screen.getByText('김밥 · Qty 1 · Unit 3,500원 · Amount 3,500원'),
  ).toBeTruthy();
  expect(
    screen.getByText('삼각김밥 · Qty 2 · Unit 1,200원 · Amount 2,400원'),
  ).toBeTruthy();
  expect(screen.getByText(sampleReceipt.ocrText!)).toBeTruthy();
});
