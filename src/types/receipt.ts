export type ReceiptStatus = 'pending' | 'approved' | 'rejected';

export interface ReceiptLineItem {
  name: string;
  quantity?: string;
  unitPrice?: string;
  amount?: string;
}

export interface ReceiptExtractedMetadata {
  itemCount: number;
  lineItems: ReceiptLineItem[];
  paymentMethod?: string;
  storeName?: string;
  totalAmount?: string;
  vatAmount?: string;
}

export interface ReceiptItem {
  extractedMetadata?: ReceiptExtractedMetadata;
  ocrText?: string;
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
