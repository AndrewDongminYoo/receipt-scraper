import React from 'react';
import {
  screen,
  userEvent,
  waitFor,
  within,
} from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { Platform } from 'react-native';
import {
  launchCamera,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import ReceiptUploadScreen from '../src/screens/ReceiptUploadScreen';
import ReceiptListScreen from '../src/screens/ReceiptListScreen';
import { renderWithQueryClient } from '../jest/renderWithQueryClient';
import type { ReceiptItem } from '../src/types/receipt';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: jest.fn(),
}));

jest.mock('react-native-document-scanner-plugin', () => ({
  __esModule: true,
  ResponseType: {
    Base64: 'base64',
    ImageFilePath: 'imageFilePath',
  },
  ScanDocumentResponseStatus: {
    Success: 'success',
    Cancel: 'cancel',
  },
  default: {
    scanDocument: jest.fn(),
  },
}));

jest.mock('../src/api/ocr', () => ({
  recognizeReceiptText: jest.fn().mockResolvedValue({
    text: [
      '팀리미티드 편의점',
      '상품명 단가 수량 금액',
      '김밥 3,500 1 3,500',
      '삼각김밥 1,200 2 2,400',
      '부가세 536원',
      '합계 5,900원',
      '카드 일시불',
    ].join('\n'),
    isEmpty: false,
  }),
  OcrError: class OcrError extends Error {},
}));

jest.mock('../src/utils/featureFlags', () => ({
  getUseLibraryPicker: jest.fn().mockResolvedValue(false),
  setUseLibraryPicker: jest.fn().mockResolvedValue(undefined),
}));

const mockedLaunchCamera = launchCamera as jest.MockedFunction<
  typeof launchCamera
>;
const mockedScanDocument = DocumentScanner.scanDocument as jest.MockedFunction<
  typeof DocumentScanner.scanDocument
>;
const mockedUseRoute = useRoute as jest.MockedFunction<typeof useRoute>;

const mockAsset: Asset = {
  fileName: 'receipt-001.jpg',
  fileSize: 182340,
  type: 'image/jpeg',
  uri: 'file:///tmp/receipt-001.jpg',
};

let mockReceiptStore: ReceiptItem[] = [];
let consoleErrorSpy: jest.SpyInstance;
const originalPlatformOS = Platform.OS;

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
  jest.useFakeTimers();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: 'ios',
  });
  mockReceiptStore = [];
  mockedLaunchCamera.mockResolvedValue({
    assets: [mockAsset],
  } as ImagePickerResponse);
  mockedScanDocument.mockRejectedValue(new Error('scanner unavailable'));
  mockedUseRoute.mockReturnValue({
    key: 'ReceiptUpload-flow',
    name: 'ReceiptUpload',
    params: undefined,
  } as never);
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  consoleErrorSpy.mockRestore();
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: originalPlatformOS,
  });
  jest.clearAllMocks();
});

test('refreshes the receipt list after a successful upload', async () => {
  const user = userEvent.setup();

  renderWithQueryClient(<ReceiptFlowHarness />);

  expect(await screen.findByText('No receipts uploaded yet.')).toBeTruthy();

  await user.press(screen.getByTestId('pick-receipt-button'));
  expect(await screen.findByTestId('receipt-preview-image')).toBeTruthy();

  await user.press(screen.getByTestId('upload-receipt-button'));

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

  expect(
    consoleErrorSpy.mock.calls.some(
      ([message]) =>
        typeof message === 'string' &&
        message.includes('inside a test was not wrapped in act'),
    ),
  ).toBe(false);
});
