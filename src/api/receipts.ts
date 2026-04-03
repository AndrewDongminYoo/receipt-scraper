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

const LIST_DELAY_MS = 450;
const UPLOAD_DELAY_MS = 900;
const mockReceipts: ReceiptItem[] = [];

export const receiptQueryKeys = {
  all: ['receipts'] as const,
};

export interface UploadReceiptParams {
  asset: Asset;
  shouldFail?: boolean;
}

const uploadClient = axios.create({
  baseURL: 'https://mock.receipt-scraper.local',
});

const wait = (durationMs: number) =>
  new Promise<void>(resolve => setTimeout(() => resolve(), durationMs));

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

async function mockUploadAdapter(
  config: InternalAxiosRequestConfig<FormData>,
): Promise<AxiosResponse<ReceiptUploadResponse, FormData>> {
  await wait(UPLOAD_DELAY_MS);

  const shouldFail = getHeaderValue(config, 'x-mock-failure') === 'true';

  if (shouldFail) {
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

  const receipt: ReceiptItem = {
    fileName: getHeaderValue(config, 'x-receipt-file-name'),
    fileSize:
      Number(getHeaderValue(config, 'x-receipt-size') || 0) || undefined,
    id: `receipt-${Date.now()}`,
    imageUrl: getHeaderValue(config, 'x-receipt-uri') || '',
    mimeType: getHeaderValue(config, 'x-receipt-type'),
    purchasedAt: new Date().toISOString(),
    status: 'pending',
    storeName: 'Pending Review',
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
  formData.append('capturedAt', new Date().toISOString());

  const response = await uploadClient.post<ReceiptUploadResponse>(
    '/receipts/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-mock-failure': shouldFail ? 'true' : 'false',
        'x-receipt-file-name': asset.fileName || 'receipt.jpg',
        'x-receipt-size': asset.fileSize ? String(asset.fileSize) : '',
        'x-receipt-type': asset.type || 'image/jpeg',
        'x-receipt-uri': asset.uri,
      },
    },
  );

  return response.data;
}
