import {
  extractReceiptMetadata,
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
      [
        '팀리미티드 편의점',
        '상품명 단가 수량 금액',
        '김밥 3,500 1 3,500',
        '삼각김밥 1,200 2 2,400',
        '부가세 536원',
        '합계 5,900원',
        '카드 일시불',
      ].join('\n'),
    ),
  ).toBe(true);
});

test('accepts English receipt text for existing test fixtures', () => {
  expect(
    looksLikeReceiptText(
      [
        'Limited Mart',
        'ITEM QTY UNIT PRICE AMOUNT',
        'Sandwich 2 4.50 9.00',
        'Coffee 1 3.99 3.99',
        'TAX 1.17',
        'TOTAL $14.16',
        'CARD VISA',
      ].join('\n'),
    ),
  ).toBe(true);
});

test('rejects text without receipt keywords', () => {
  expect(
    looksLikeReceiptText('안녕하세요 주문번호 20260404 금액 안내 3500'),
  ).toBe(false);
});

test('rejects receipt text that only has payment totals without itemized lines', () => {
  expect(
    looksLikeReceiptText(
      '결제금액 5,900원\n부가세 536원\n합계 5,900원\n카드 일시불',
    ),
  ).toBe(false);
});

test('extracts metadata and line items from Korean mart receipts', () => {
  const metadata = extractReceiptMetadata(
    [
      '팀리미티드 편의점',
      '상품명 단가 수량 금액',
      '김밥 3,500 1 3,500',
      '삼각김밥 1,200 2 2,400',
      '부가세 536원',
      '합계 5,900원',
      '카드 일시불',
    ].join('\n'),
  );

  expect(metadata.totalAmount).toBe('5,900원');
  expect(metadata.vatAmount).toBe('536원');
  expect(metadata.paymentMethod).toBe('카드');
  expect(metadata.lineItems).toEqual([
    {
      amount: '3,500',
      name: '김밥',
      quantity: '1',
      unitPrice: '3,500',
    },
    {
      amount: '2,400',
      name: '삼각김밥',
      quantity: '2',
      unitPrice: '1,200',
    },
  ]);
});
