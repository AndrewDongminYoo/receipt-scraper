# API and Error-State Contracts

This document records the typed request/response shape for each flow in the
app, plus the complete error-state map visible to the user.

---

## 1. Receipt Upload

### Request

```plaintext
POST /receipts/upload
Content-Type: multipart/form-data

Body (FormData):
  receipt     — file blob (name, type, uri)
  ocrText     — string (full OCR text from on-device recognition)
  captureDate — string (ISO 8601 timestamp from device clock)
  deviceLocale — string (device locale identifier, e.g. "ko_KR")

Custom headers:
  x-mock-failure      — "true" | "false" (simulate failure toggle)
  x-receipt-ocr-text  — URI-encoded OCR text
  x-capture-date      — ISO 8601 capture timestamp
  x-device-locale     — device locale
  x-receipt-file-name — original file name
  x-receipt-size      — file size in bytes
  x-receipt-type      — MIME type (image/jpeg, image/png, image/heic)
  x-receipt-uri       — local file URI
```

### Response (Success — 201)

```typescript
interface ReceiptUploadResponse {
  message: string; // "Receipt uploaded successfully. It is now queued for review..."
  receipt: ReceiptItem;
}
```

### Response (Failure — 409, 422, 500)

```typescript
interface ApiErrorResponse {
  message: string;
}
```

---

## 2. Receipt List

### Request

```plaintext
GET /receipts  (simulated via fetchReceipts() with in-memory store)
```

### Response

```typescript
type ReceiptItem[] // Array of ReceiptItem objects

interface ReceiptItem {
  id: string;
  imageUrl: string;
  storeName: string;
  purchasedAt: string;        // ISO 8601
  status: ReceiptStatus;      // 'pending' | 'approved' | 'rejected'
  rewardPoint?: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  ocrText?: string;
  extractedMetadata?: ReceiptExtractedMetadata;
}

interface ReceiptExtractedMetadata {
  totalAmount?: string;
  vatAmount?: string;
  paymentMethod?: string;
  storeName?: string;
  lineItems: ReceiptLineItem[];
  itemCount: number;
  receiptFingerprint?: string;
  isRefund?: boolean;
}
```

---

## 3. Survey Submit

### Request

```typescript
interface SurveySubmission {
  visitPurpose: string; // "grocery" | "snack" | "necessity" | "other"
  purchaseFor: string; // "myself" | "family" | "office" | "gift"
  paymentMethod: string; // "credit_card" | "debit_card" | "cash" | "mobile_pay"
}
```

### Response (Success)

```typescript
interface SurveySubmissionResponse {
  rewardResult: RewardResult;
}
```

---

## 4. Reward Result

### Request

```plaintext
GET (simulated via fetchLatestRewardResult() reading from query cache)
```

### Response

```typescript
interface RewardResult {
  title: string; // e.g. "Reward Earned!"
  points: number; // e.g. 150
  message: string; // e.g. "You earned 150 points..."
  submittedAt: string; // ISO 8601
  surveyAnswers: {
    visitPurpose: string;
    purchaseFor: string;
    paymentMethod: string;
  };
}
```

---

## Error-State Map

Every error state in the app and where it appears:

| Error condition            | Screen        | UI element                        | Message                                                              |
| -------------------------- | ------------- | --------------------------------- | -------------------------------------------------------------------- |
| Upload network failure     | ReceiptUpload | StateCard (error) + retry button  | "Receipt upload failed. Please try again." or axios error message    |
| Duplicate receipt (client) | ReceiptUpload | StateCard (error)                 | "This receipt has already been submitted."                           |
| Duplicate receipt (server) | ReceiptUpload | StateCard (error)                 | "This receipt has already been submitted."                           |
| OCR empty or failed        | ReceiptUpload | StateCard (error)                 | "We couldn't read the receipt. Try again in better lighting."        |
| Wrong receipt type         | ReceiptUpload | StateCard (error)                 | "Only grocery and supermarket receipts are accepted."                |
| Refund receipt             | ReceiptUpload | StateCard (error)                 | "Refund and cancellation receipts are not eligible for points."      |
| Camera unavailable         | ReceiptUpload | StateCard (error)                 | "Unable to access the camera. Check your permissions and try again." |
| Receipt list fetch error   | ReceiptList   | StateCard (error) + "Try Again"   | Error message or "Unable to load receipts right now."                |
| Survey validation error    | Survey        | Inline per-field error text       | "This field is required" (per Zod schema)                            |
| Survey submit failure      | Survey        | StateCard (error)                 | Error message from the mutation                                      |
| Reward result fetch error  | RewardResult  | StateCard (error) + retry button  | Error message or default                                             |
| Reward result empty        | RewardResult  | StateCard (info) + "Go To Survey" | "No reward result found. Complete the survey to earn points."        |
