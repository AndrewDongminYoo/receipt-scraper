import {
  extractReceiptMetadata,
  looksLikeReceiptText,
  normalizeReceiptText,
} from '../src/features/receipts/receiptValidation';
import {
  basicKeywordFixtures,
  basicMetadataFixture,
  convenienceReceiptFixtures,
  emartFixtures,
  refundFixtures,
} from '../jest/fixtures/receipts';

test('normalizes OCR whitespace before receipt checks', () => {
  expect(normalizeReceiptText('상품명  김밥\n\n합계   3,500원')).toBe(
    '상품명 김밥 합계 3,500원',
  );
});

test('accepts Korean receipt text with won amounts and receipt keywords', () => {
  expect(looksLikeReceiptText(basicKeywordFixtures.koreanReceiptOcrText)).toBe(
    true,
  );
});

test('accepts English receipt text for existing test fixtures', () => {
  expect(looksLikeReceiptText(basicKeywordFixtures.englishReceiptOcrText)).toBe(
    true,
  );
});

test('rejects text without receipt keywords', () => {
  expect(looksLikeReceiptText(basicKeywordFixtures.invalidKeywordText)).toBe(
    false,
  );
});

test('rejects receipt text that only has payment totals without itemized lines', () => {
  expect(looksLikeReceiptText(basicKeywordFixtures.totalsOnlyReceiptText)).toBe(
    false,
  );
});

test('extracts metadata and line items from Korean mart receipts', () => {
  const metadata = extractReceiptMetadata(basicMetadataFixture.ocrText);

  expect(metadata.totalAmount).toBe(basicMetadataFixture.expectedTotalAmount);
  expect(metadata.vatAmount).toBe(basicMetadataFixture.expectedVatAmount);
  expect(metadata.paymentMethod).toBe(
    basicMetadataFixture.expectedPaymentMethod,
  );
  expect(metadata.lineItems).toEqual(basicMetadataFixture.expectedLineItems);
});

test('accepts OCR text when receipt keywords are split by spaces and line items span multiple lines', () => {
  const sampleOcrText = emartFixtures.splitKeywordReceipt;

  const metadata = extractReceiptMetadata(sampleOcrText);

  expect(looksLikeReceiptText(sampleOcrText)).toBe(true);
  expect(metadata.storeName).toBe('이마트 역삼점 T:(02) 6908-1234');
  expect(metadata.paymentMethod).toBe('카드');
  expect(metadata.totalAmount).toBe('41,360');
  expect(metadata.lineItems).toContainEqual({
    amount: '29,400',
    name: '도스코파스까버네쇼비',
    quantity: '6',
    unitPrice: '4,900',
  });
});

test('extracts line items from the exact emart OCR sample with split quantity and inferred amounts', () => {
  const sampleOcrText = emartFixtures.splitQuantityReceipt;

  const metadata = extractReceiptMetadata(sampleOcrText);

  expect(looksLikeReceiptText(sampleOcrText)).toBe(true);
  expect(metadata.storeName).toBe('이마트 역삼점 T:(02) 6908-1234');
  expect(metadata.paymentMethod).toBe('카드');
  expect(metadata.totalAmount).toBe('41,360');
  expect(metadata.lineItems).toContainEqual({
    amount: '29,400',
    name: '도스코파스까버네쇼비',
    quantity: '6',
    unitPrice: '4,900',
  });
});

test('extracts stable receipt identity fields and a fingerprint from grocery receipts', () => {
  const sampleOcrText = emartFixtures.fingerprintReceipt;
  const spacedSampleOcrText = emartFixtures.fingerprintReceiptWithExtraSpaces;

  const metadata = extractReceiptMetadata(sampleOcrText);
  const spacedMetadata = extractReceiptMetadata(spacedSampleOcrText);

  expect(metadata.businessNumber).toBe('206-86-50913');
  expect(metadata.storeAddress).toBe('서울특별시 강남구 역삼로 310');
  expect(metadata.purchaseDateTime).toBe('2026-03-14T15:19:00');
  expect(metadata.receiptFingerprint).toBeDefined();
  expect(metadata.receiptFingerprint).toBe(spacedMetadata.receiptFingerprint);
  expect(metadata.isRefund).toBe(false);
});

test('marks refund receipts while ignoring normal return-policy text', () => {
  expect(
    extractReceiptMetadata(refundFixtures.policyReceiptText).isRefund,
  ).toBe(false);
  expect(
    extractReceiptMetadata(refundFixtures.actualRefundReceiptText).isRefund,
  ).toBe(true);
});

test('does not mark seven eleven receipt policy text as a refund receipt', () => {
  expect(
    extractReceiptMetadata(refundFixtures.sevenElevenPolicyReceiptText)
      .isRefund,
  ).toBe(false);
});

test('does not mark CU exchange policy text as a refund receipt', () => {
  expect(
    extractReceiptMetadata(refundFixtures.cuPolicyReceiptText).isRefund,
  ).toBe(false);
});

test('extracts at least one line item from sparse seven eleven quantity-only OCR', () => {
  const sampleOcrText = convenienceReceiptFixtures.quantityOnlyReceipt.ocrText;

  const metadata = extractReceiptMetadata(sampleOcrText);

  expect(metadata.isRefund).toBe(false);
  expect(looksLikeReceiptText(sampleOcrText)).toBe(true);
  expect(metadata.itemCount).toBeGreaterThan(0);
  for (const expectedItem of convenienceReceiptFixtures.quantityOnlyReceipt
    .expectedItems) {
    expect(metadata.lineItems).toContainEqual(
      expect.objectContaining(expectedItem),
    );
  }
});

test('extracts sparse convenience line item when quantity is isolated on the next line', () => {
  const sampleOcrText =
    convenienceReceiptFixtures.isolatedQuantityReceipt.ocrText;

  const metadata = extractReceiptMetadata(sampleOcrText);

  expect(metadata.itemCount).toBeGreaterThan(0);
  for (const expectedItem of convenienceReceiptFixtures.isolatedQuantityReceipt
    .expectedItems) {
    expect(metadata.lineItems).toContainEqual(
      expect.objectContaining(expectedItem),
    );
  }
});

test('extracts sparse convenience line items even when barcode lines appear before the name', () => {
  const sampleOcrText =
    convenienceReceiptFixtures.barcodeBeforeNameReceipt.ocrText;

  const metadata = extractReceiptMetadata(sampleOcrText);

  expect(metadata.itemCount).toBeGreaterThan(0);
  for (const expectedItem of convenienceReceiptFixtures.barcodeBeforeNameReceipt
    .expectedItems) {
    expect(metadata.lineItems).toContainEqual(
      expect.objectContaining(expectedItem),
    );
  }
});

test('rejects cafe OCR noise instead of turning support text into purchase items', () => {
  const sampleOcrText = convenienceReceiptFixtures.cafeNoiseReceipt.ocrText;

  const metadata = extractReceiptMetadata(sampleOcrText);

  expect(looksLikeReceiptText(sampleOcrText)).toBe(false);
  expect(metadata.itemCount).toBe(0);
  expect(metadata.lineItems).toEqual([]);

  for (const noiseItemName of convenienceReceiptFixtures.cafeNoiseReceipt
    .expectedNoiseItemNames) {
    expect(metadata.lineItems).not.toContainEqual(
      expect.objectContaining({ name: noiseItemName }),
    );
  }
});
