export type ReceiptStatus = 'pending' | 'approved' | 'rejected';

export interface ReceiptItem {
  id: string;
  imageUrl: string;
  storeName: string;
  purchasedAt: string;
  status: ReceiptStatus;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  rewardPoint?: number;
}

export interface ReceiptUploadResponse {
  message: string;
  receipt: ReceiptItem;
}

export interface ApiErrorResponse {
  message: string;
}
