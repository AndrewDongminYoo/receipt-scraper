import React from 'react';
import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';
import DocumentScanner, {
  ScanDocumentResponseStatus,
} from 'react-native-document-scanner-plugin';
import { Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import ReceiptUploadScreen from '../src/screens/ReceiptUploadScreen';
import { uploadReceipt } from '../src/api/receipts';
import { recognizeReceiptText } from '../src/api/ocr';
import { getUseLibraryPicker } from '../src/utils/featureFlags';
import { renderWithQueryClient } from '../jest/renderWithQueryClient';
import type { ReceiptItem, ReceiptUploadResponse } from '../src/types/receipt';

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

jest.mock('../src/api/receipts', () => ({
  receiptQueryKeys: {
    all: ['receipts'],
  },
  uploadReceipt: jest.fn(),
}));

jest.mock('../src/api/ocr', () => ({
  recognizeReceiptText: jest.fn(),
  OcrError: class OcrError extends Error {},
}));

jest.mock('../src/utils/featureFlags', () => ({
  getUseLibraryPicker: jest.fn().mockResolvedValue(false),
  setUseLibraryPicker: jest.fn().mockResolvedValue(undefined),
}));

const mockedLaunchCamera = launchCamera as jest.MockedFunction<
  typeof launchCamera
>;
const mockedLaunchImageLibrary = launchImageLibrary as jest.MockedFunction<
  typeof launchImageLibrary
>;
const mockedScanDocument = DocumentScanner.scanDocument as jest.MockedFunction<
  typeof DocumentScanner.scanDocument
>;
const mockedUploadReceipt = uploadReceipt as jest.MockedFunction<
  typeof uploadReceipt
>;
const mockedRecognizeReceiptText = recognizeReceiptText as jest.MockedFunction<
  typeof recognizeReceiptText
>;
const mockedGetUseLibraryPicker = getUseLibraryPicker as jest.MockedFunction<
  typeof getUseLibraryPicker
>;
const mockedUseRoute = useRoute as jest.MockedFunction<typeof useRoute>;

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

const validReceiptOcrText = 'TOTAL $12.99 TAX $1.00 CASH';

let consoleErrorSpy: jest.SpyInstance;
const originalPlatformOS = Platform.OS;

function setPlatformOS(os: 'android' | 'ios') {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: os,
  });
}

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
  setPlatformOS('ios');
  mockedUseRoute.mockReturnValue({
    key: 'ReceiptUpload-test',
    name: 'ReceiptUpload',
    params: undefined,
  } as never);
  mockedGetUseLibraryPicker.mockResolvedValue(false);
  mockedLaunchCamera.mockResolvedValue({
    assets: [mockAsset],
  } as ImagePickerResponse);
  mockedScanDocument.mockRejectedValue(new Error('scanner unavailable'));
  mockedRecognizeReceiptText.mockResolvedValue({
    text: validReceiptOcrText,
    isEmpty: false,
  });
  mockedUploadReceipt.mockResolvedValue(successResponse);
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

test('captures a receipt and shows a preview', async () => {
  const user = userEvent.setup();

  renderWithQueryClient(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));

  expect(await screen.findByTestId('receipt-preview-image')).toBeTruthy();
  expect(mockedLaunchCamera).toHaveBeenCalledTimes(1);
  expect(screen.getByText('receipt-001.jpg')).toBeTruthy();
  expect(screen.getByTestId('upload-receipt-button')).toBeEnabled();
  expectNoActWarnings();
});

test('uploads a captured receipt and shows a success status', async () => {
  const user = userEvent.setup();

  renderWithQueryClient(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));
  expect(await screen.findByTestId('receipt-preview-image')).toBeTruthy();

  await user.press(screen.getByTestId('upload-receipt-button'));

  await waitFor(() => {
    expect(mockedUploadReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        asset: mockAsset,
        ocrText: validReceiptOcrText,
        shouldFail: false,
      }),
    );
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
    expect(mockedUploadReceipt).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        asset: mockAsset,
        shouldFail: false,
      }),
    );
  });

  expect(await screen.findByText(successResponse.message)).toBeTruthy();
  expectNoActWarnings();
});

test('shows ocr_failed card when OCR returns empty text', async () => {
  const user = userEvent.setup();

  mockedRecognizeReceiptText.mockResolvedValueOnce({ text: '', isEmpty: true });

  renderWithQueryClient(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));

  expect(await screen.findByTestId('receipt-capture-failure-ocr')).toBeTruthy();
  expect(screen.getByTestId('upload-receipt-button')).toBeDisabled();
  expectNoActWarnings();
});

test('shows ocr_failed card when OCR throws', async () => {
  const user = userEvent.setup();

  mockedRecognizeReceiptText.mockRejectedValueOnce(
    new Error('native module error'),
  );

  renderWithQueryClient(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));

  expect(await screen.findByTestId('receipt-capture-failure-ocr')).toBeTruthy();
  expectNoActWarnings();
});

test('shows wrong_type card when OCR text does not match receipt patterns', async () => {
  const user = userEvent.setup();

  mockedRecognizeReceiptText.mockResolvedValueOnce({
    text: 'Hello World this is a document with no price',
    isEmpty: false,
  });

  renderWithQueryClient(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));

  expect(
    await screen.findByTestId('receipt-capture-failure-wrong-type'),
  ).toBeTruthy();
  expectNoActWarnings();
});

test('uses launchImageLibrary when feature flag is true', async () => {
  const user = userEvent.setup();

  mockedGetUseLibraryPicker.mockResolvedValueOnce(true);
  mockedLaunchImageLibrary.mockResolvedValue({
    assets: [mockAsset],
  } as ImagePickerResponse);

  renderWithQueryClient(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));

  await waitFor(() => {
    expect(mockedLaunchImageLibrary).toHaveBeenCalledTimes(1);
    expect(mockedLaunchCamera).not.toHaveBeenCalled();
  });
  expectNoActWarnings();
});

test('auto-starts library capture when launched with library intent', async () => {
  mockedUseRoute.mockReturnValue({
    key: 'ReceiptUpload-library',
    name: 'ReceiptUpload',
    params: {
      autoStart: true,
      launchMode: 'library',
    },
  } as never);
  mockedLaunchImageLibrary.mockResolvedValueOnce({
    assets: [mockAsset],
  } as ImagePickerResponse);

  renderWithQueryClient(<ReceiptUploadScreen />);

  await waitFor(() => {
    expect(mockedLaunchImageLibrary).toHaveBeenCalledTimes(1);
  });

  expect(await screen.findByTestId('receipt-preview-image')).toBeTruthy();
});

test('uses DocumentScanner on ios and previews the first scanned page', async () => {
  const user = userEvent.setup();

  setPlatformOS('ios');
  mockedScanDocument.mockResolvedValueOnce({
    scannedImages: [
      'file:///tmp/scan-page-1.jpg',
      'file:///tmp/scan-page-2.jpg',
    ],
    status: ScanDocumentResponseStatus.Success,
  });

  renderWithQueryClient(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));

  const previewImage = await screen.findByTestId('receipt-preview-image');
  expect(previewImage.props.source).toEqual({
    uri: 'file:///tmp/scan-page-1.jpg',
  });
  expect(mockedLaunchCamera).not.toHaveBeenCalled();
  expect(screen.getByTestId('upload-receipt-button')).toBeEnabled();
  expectNoActWarnings();
});

test('auto-starts camera capture when launched with camera intent', async () => {
  mockedUseRoute.mockReturnValue({
    key: 'ReceiptUpload-camera',
    name: 'ReceiptUpload',
    params: {
      autoStart: true,
      launchMode: 'camera',
    },
  } as never);
  mockedScanDocument.mockResolvedValueOnce({
    scannedImages: [
      'file:///tmp/scan-page-1.jpg',
      'file:///tmp/scan-page-2.jpg',
    ],
    status: ScanDocumentResponseStatus.Success,
  });

  renderWithQueryClient(<ReceiptUploadScreen />);

  const previewImage = await screen.findByTestId('receipt-preview-image');
  expect(previewImage.props.source).toEqual({
    uri: 'file:///tmp/scan-page-1.jpg',
  });
});

test('falls back to launchCamera when ios document scanner throws', async () => {
  const user = userEvent.setup();
  const fallbackAsset: Asset = {
    fileName: 'fallback-receipt.jpg',
    type: 'image/jpeg',
    uri: 'file:///tmp/fallback-receipt.jpg',
  };

  setPlatformOS('ios');
  mockedScanDocument.mockRejectedValueOnce(new Error('scanner failed'));
  mockedLaunchCamera.mockResolvedValueOnce({
    assets: [fallbackAsset],
  } as ImagePickerResponse);

  renderWithQueryClient(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));

  const previewImage = await screen.findByTestId('receipt-preview-image');
  expect(mockedLaunchCamera).toHaveBeenCalledTimes(1);
  expect(previewImage.props.source).toEqual({
    uri: 'file:///tmp/fallback-receipt.jpg',
  });
  expectNoActWarnings();
});

test('shows duplicate error when the same receipt is uploaded twice', async () => {
  const user = userEvent.setup();
  const duplicateError = new Error('This receipt has already been submitted.');

  mockedUploadReceipt
    .mockResolvedValueOnce(successResponse)
    .mockRejectedValueOnce(duplicateError);

  renderWithQueryClient(<ReceiptUploadScreen />);

  await user.press(screen.getByTestId('pick-receipt-button'));
  await user.press(screen.getByTestId('upload-receipt-button'));
  await screen.findByText(successResponse.message);

  await user.press(screen.getByTestId('pick-receipt-button'));
  await user.press(screen.getByTestId('upload-receipt-button'));

  expect(
    await screen.findByText('This receipt has already been submitted.'),
  ).toBeTruthy();
  expectNoActWarnings();
});
