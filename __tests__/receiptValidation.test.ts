import {
  looksLikeReceiptText,
  normalizeReceiptText,
} from '../src/features/receipts/receiptValidation';

test('normalizes OCR whitespace before receipt checks', () => {
  expect(normalizeReceiptText('상품명  김밥\n\n합계   3,500원')).toBe(
    '상품명 김밥 합계 3,500원',
  );
});

test('accepts Korean receipt text with won amounts and receipt keywords', () => {
  expect(
    looksLikeReceiptText(
      '상품명 김밥\n수량 1\n금액 3,500원\n부가세 318원\n합계 3,500원\n카드 일시불',
    ),
  ).toBe(true);
});

test('accepts English receipt text for existing test fixtures', () => {
  expect(looksLikeReceiptText('TOTAL $12.99 TAX $1.00 CASH')).toBe(true);
});

test('rejects text without receipt keywords', () => {
  expect(
    looksLikeReceiptText('안녕하세요 주문번호 20260404 금액 안내 3500'),
  ).toBe(false);
});
