import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { Asset } from 'react-native-image-picker';
import type {
  ApiErrorResponse,
  ReceiptItem,
  ReceiptUploadResponse,
} from '../types/receipt';
import { extractReceiptMetadata } from '../features/receipts/receiptValidation';
import { wait } from '../utils/wait';

const LIST_DELAY_MS = 450;
const UPLOAD_DELAY_MS = 900;
const mockReceipts: ReceiptItem[] = [];
const uploadedFileNames = new Set<string>();

export const receiptQueryKeys = {
  all: ['receipts'] as const,
};

export interface UploadReceiptParams {
  asset: Asset;
  shouldFail?: boolean;
  ocrText: string;
  captureDate: string;
  deviceLocale: string;
}

const uploadClient = axios.create({
  baseURL: 'https://mock.receipt-scraper.local',
});

function getHeaderValue(
  config: InternalAxiosRequestConfig,
  headerName: string,
): string | undefined {
  const axiosHeaderValue = config.headers?.get?.(headerName);

  if (typeof axiosHeaderValue === 'string') {
    return axiosHeaderValue;
  }

  const rawHeaderValue = config.headers?.[headerName];

  if (Array.isArray(rawHeaderValue)) {
    return rawHeaderValue[0];
  }

  return typeof rawHeaderValue === 'string' ? rawHeaderValue : undefined;
}

function decodeHeaderValue(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function mockUploadAdapter(
  config: InternalAxiosRequestConfig<FormData>,
): Promise<AxiosResponse<ReceiptUploadResponse, FormData>> {
  await wait(UPLOAD_DELAY_MS);

  const shouldFail = getHeaderValue(config, 'x-mock-failure') === 'true';

  if (shouldFail) {
    // shouldFail check takes priority over duplicate detection
    const errorResponse: AxiosResponse<ApiErrorResponse, FormData> = {
      config,
      data: {
        message:
          'Mock upload failed. Review the error state, then retry the same receipt.',
      },
      headers: {},
      status: 500,
      statusText: 'Internal Server Error',
    };

    throw new AxiosError<ApiErrorResponse, FormData>(
      errorResponse.data.message,
      AxiosError.ERR_BAD_RESPONSE,
      config,
      undefined,
      errorResponse,
    );
  }

  const fileName = getHeaderValue(config, 'x-receipt-file-name') ?? '';
  if (fileName && uploadedFileNames.has(fileName)) {
    const dupResponse: AxiosResponse<ApiErrorResponse, FormData> = {
      config,
      data: { message: 'This receipt has already been submitted.' },
      headers: {},
      status: 409,
      statusText: 'Conflict',
    };
    throw new AxiosError<ApiErrorResponse, FormData>(
      dupResponse.data.message,
      AxiosError.ERR_BAD_RESPONSE,
      config,
      undefined,
      dupResponse,
    );
  }
  if (fileName) {
    uploadedFileNames.add(fileName);
  }

  const ocrText = decodeHeaderValue(
    getHeaderValue(config, 'x-receipt-ocr-text'),
  );
  const extractedMetadata = ocrText
    ? extractReceiptMetadata(ocrText)
    : undefined;

  const receipt: ReceiptItem = {
    extractedMetadata,
    fileName,
    fileSize:
      Number(getHeaderValue(config, 'x-receipt-size') || 0) || undefined,
    id: `receipt-${Date.now()}`,
    imageUrl: getHeaderValue(config, 'x-receipt-uri') || '',
    mimeType: getHeaderValue(config, 'x-receipt-type'),
    ocrText,
    purchasedAt: new Date().toISOString(),
    status: 'pending',
    storeName: extractedMetadata?.storeName || 'Pending Review',
  };

  mockReceipts.unshift(receipt);

  return {
    config,
    data: {
      message:
        'Receipt uploaded successfully. It is now queued for review in the mock backend.',
      receipt,
    },
    headers: {},
    status: 201,
    statusText: 'Created',
  };
}

uploadClient.defaults.adapter = mockUploadAdapter;

export async function fetchReceipts(): Promise<ReceiptItem[]> {
  await wait(LIST_DELAY_MS);

  return [...mockReceipts];
}

export async function uploadReceipt({
  asset,
  shouldFail = false,
  ocrText,
  captureDate,
  deviceLocale,
}: UploadReceiptParams): Promise<ReceiptUploadResponse> {
  if (!asset.uri) {
    throw new Error('The selected receipt is missing a file URI.');
  }

  const formData = new FormData();

  formData.append('receipt', {
    name: asset.fileName || 'receipt.jpg',
    type: asset.type || 'image/jpeg',
    uri: asset.uri,
  } as never);
  formData.append('ocrText', ocrText);
  formData.append('captureDate', captureDate);
  formData.append('deviceLocale', deviceLocale);

  const response = await uploadClient.post<ReceiptUploadResponse>(
    '/receipts/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-capture-date': captureDate,
        'x-device-locale': deviceLocale,
        'x-mock-failure': shouldFail ? 'true' : 'false',
        'x-receipt-ocr-text': encodeURIComponent(ocrText),
        'x-receipt-file-name': asset.fileName || 'receipt.jpg',
        'x-receipt-size': asset.fileSize ? String(asset.fileSize) : '',
        'x-receipt-type': asset.type || 'image/jpeg',
        'x-receipt-uri': asset.uri,
      },
    },
  );

  return response.data;
}
