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

test('accepts OCR text when receipt keywords are split by spaces and line items span multiple lines', () => {
  const sampleOcrText = [
    '이마트 역삼점 T:(02) 6908-1234',
    '206-86-50913 한채양',
    '서울특별시 강남구 역삼로 310',
    '영수증 지참시 교환/환불 불가',
    '[구 매]2026-03-14 15:19 POS:7911-5689',
    '상품 명',
    '01 도스코파스까버네쇼비',
    '8809642308251 4,900 6 29,400',
    '04 하리보 스타믹스 250g',
    '4001686726013 5,980',
    '부가',
    '단 가수량 금 액',
    '과세 물 품',
    '카드결제(IC)',
    '3,760',
    '일시불 / 41,360',
  ].join('\n');

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
  const sampleOcrText = [
    '이마트 역삼점 T:(02) 6908-1234',
    '206-86-50913 한채양',
    '서울특별시 강남구 역삼로 310',
    '영수증 지참시 교환/환불 불가',
    '정상상품에 한함, 30일 이내(신선 7일)',
    '일부 브랜드매장 제외(매장 고지물참조)',
    '교환/환불 구매점에서 가능(결제카드 지참)',
    '[구 매]2026-03-14 15:19 POS:7911-5689',
    '상품 명',
    '01 도스코파스까버네쇼비',
    '8809642308251 4,900 6',
    '02 하리보 스위트러브 24',
    '8803420906943',
    '2+1',
    '4001686301524',
    '03 하리보 골드베렌 250g',
    '241',
    '2+1',
    '04 하리보 스타믹스 250g',
    '4001686726013 5,980',
    '부가',
    '단 가수량 금 액',
    '합',
    '결제대상금액',
    '5,980',
    '과세 물 품',
    '0012 KEB 하나',
    '카드결제(IC)',
    '5,980',
    '금회발생포인트',
    '누계(가용)포인트',
    '품세 계',
    '계',
    '1',
    '1',
    '[신세계포인트 적립]',
    '유*민 고객님의 포인트 현황입니다.',
    '29,400',
    'T9350**144*',
    '5,980',
    '793(',
    '-2,000',
    '5,980',
    '-1,990',
    '5,980',
    '-1,990',
    '37,600',
    '51149500**529*/19509902',
    '3,760',
    '일시불 / 41,360',
    '41,360',
    '41,360',
    '*신세계포인트 유효기간은 3년입니다.',
    '41',
    '752)',
  ].join('\n');

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
  const sampleOcrText = [
    '이마트 역삼점 T:(02) 6908-1234',
    '206-86-50913 한채양',
    '서울특별시 강남구 역삼로 310',
    '영수증 지참시 교환/환불 불가',
    '[구 매]2026-03-14 15:19 POS:7911-5689',
    '상품 명',
    '01 도스코파스까버네쇼비',
    '8809642308251 4,900 6 29,400',
    '합 계',
    '41,360',
    '카드결제(IC)',
  ].join('\n');
  const spacedSampleOcrText = [
    '이마트  역삼점  T:(02) 6908-1234',
    '206-86-50913 한채양',
    '서울특별시  강남구  역삼로 310',
    '영수증 지참시 교환/환불 불가',
    '[구 매] 2026-03-14 15:19 POS:7911-5689',
    '상품 명',
    '01 도스코파스까버네쇼비',
    '8809642308251 4,900 6 29,400',
    '합 계',
    '41,360',
    '카드결제(IC)',
  ].join('\n');

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
  const purchaseReceiptText = [
    '팀리미티드 편의점',
    '서울특별시 강남구 역삼로 310',
    '206-86-50913',
    '영수증 지참시 교환/환불 불가',
    '교환/환불 구매점에서 가능(결제카드 지참)',
    '[구 매]2026-03-14 15:19 POS:7911-5689',
    '상품명 단가 수량 금액',
    '김밥 3,500 1 3,500',
    '합계 3,500원',
    '카드 일시불',
  ].join('\n');
  const refundReceiptText = [
    '팀리미티드 편의점',
    '서울특별시 강남구 역삼로 310',
    '206-86-50913',
    '[환불]2026-03-15 12:20 POS:7911-5690',
    '상품명 단가 수량 금액',
    '김밥 3,500 1 3,500',
    '카드취소',
    '환불금액 3,500원',
    '승인취소',
  ].join('\n');

  expect(extractReceiptMetadata(purchaseReceiptText).isRefund).toBe(false);
  expect(extractReceiptMetadata(refundReceiptText).isRefund).toBe(true);
});
