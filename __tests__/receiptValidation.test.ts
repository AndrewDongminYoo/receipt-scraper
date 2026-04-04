import {
  extractReceiptMetadata,
  looksLikeReceiptText,
  normalizeReceiptText,
} from '../src/features/receipts/receiptValidation';

// cspell:disable
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

test('does not mark seven eleven receipt policy text as a refund receipt', () => {
  const sampleOcrText = [
    '7-ELEVEL.',
    '세븐일레븐 삼성8호점#10612',
    '(02-3443-4789)',
    '김홍칠',
    '서울특별시 강남구 봉은사로 63길',
    '11 (삽성동)',
    'AA.eie) Lt..',
    '1208515430',
    '[판 매] 2025-06-09 (월) 22:19:40',
    '상품명 수량 금 액',
    '농십)누들핏마라탄탄',
    '8801043035330',
    '합게',
    '삼립)쪽닭쏙 닭블랙페퍼 100',
    '8801068396669 2',
    '1',
    '과세물품가액',
    '부 가 세',
    '승인번호 72120938',
    '1,800',
    '-4,500',
    '4.500',
    '5,727',
    '인 -4,500',
    '4# 신용승인정보[고객용] +',
    '점모 방문',
    '573',
    '6,300',
    'TBK비씨제크[ IBK비씨제크] 6,300',
    '52980380',
    'P:01-01 CNT:0003 REG: 백경도',
    '(N)일시물',
    '세븐일레 고객센터 1577-0711',
    '71061201251601786221',
    '교 환환불은 영수증 및 걸제카드',
    '삼품 등 일부품목 제외',
    '치참하시어 30일 이내 구매',
    '4시도유시필요상품 및 시즌',
    ', 기획',
  ].join('\n');

  expect(extractReceiptMetadata(sampleOcrText).isRefund).toBe(false);
});

test('does not mark CU exchange policy text as a refund receipt', () => {
  const sampleOcrText = [
    'CU(Again)',
    '최 증발행인쇄',
    'CU 강남CC점',
    '사업자등록번호: 120123828/',
    '서울특별시 강남구 봉은사로439C빌',
    '딩(삼성동) CC빌딩',
    '박완식 TEL : 070-7604-3123',
    '정부 방침 으로 교환/환불 시 영수증',
    '지참하셔야 합니다. (결제 1카드 지함)',
    '30일 내 구매 점포 방문',
    '#식품선도유지상품 및 일부품목제외',
    '51006 2025-06-25(수) POS-01',
    '도)넘버원양념쌀치킨2',
    '총구 매 액',
    '과세물품가액',
    '부 가 세',
    '#걸 제 금액',
    '신용카 드',
    '결제금액 :',
    '1',
    '카드회사: 001',
    '할부개월 : 00',
    '1',
    '카드번호: 5298-0380-***후-191*',
    '7,500',
    '7, 500',
    '6,819',
    '681',
    '7, 500',
    '신용 카드 **유',
    '7,500',
    'IBK비씨',
    '승인번호: 67687064',
    '7, 500',
    '9202506255100601609',
    '#표시 상품은 부가세 먼세 품복 임.',
    '객층:00 담당: 박*식',
    'NO:5992 20:48',
  ].join('\n');

  expect(extractReceiptMetadata(sampleOcrText).isRefund).toBe(false);
});

test('extracts at least one line item from sparse seven eleven quantity-only OCR', () => {
  const sampleOcrText = [
    '7-ELEVEn',
    '세븐일레븐 삼성8호점#10612',
    '(02-3443-4789)',
    '김홍칠',
    '1208515430',
    '서울특별시 강남구 봉은사로 63길',
    '11 (삼성동)',
    '[판 매] 2025-07-16 (수) 20:47:12',
    '상품명 수랑',
    '동원)양반영양닭죽285g',
    '8801047161677 2',
    '합계',
    '과세물품기가액',
    '부가 세',
    '할',
    '금액',
    '-4,500',
    '4,500',
    '4,091',
    '인 -4,500',
    '#4,500',
    '+* 신용승인정보[고객용] ***',
    '409',
    'IBK비씨체크[ IBK비씨체크] 4,500',
    '52980380',
    '승인번호 76126028 (N)일시물',
    'P:01-01 CNT:0002 REG: 백경도',
    '상품 등 일부품록 제외',
    '세븐일레븐 고객선센티 1577-0711',
    '71061201251975688767',
    '교환/환볼은 영수증 및 결제카드',
    '를 지참하시어 30일 이내 구매',
    '점포 방문',
    '선도 유지 요상품 및 시즌 기획',
  ].join('\n');

  const metadata = extractReceiptMetadata(sampleOcrText);

  expect(metadata.isRefund).toBe(false);
  expect(looksLikeReceiptText(sampleOcrText)).toBe(true);
  expect(metadata.itemCount).toBeGreaterThan(0);
  expect(metadata.lineItems).toContainEqual(
    expect.objectContaining({
      name: '동원)양반영양닭죽285g',
      quantity: '2',
    }),
  );
});

test('extracts sparse convenience line item when quantity is isolated on the next line', () => {
  const sampleOcrText = [
    '7-ELEVEn.',
    '세븐일레븐 삼성8호점#10612',
    '(02-3443-4789)',
    '김홍침',
    'A .e님e Lu}.',
    '서울특별시 강남구 봉은사로 63길',
    '11 (삼성동)',
    '1208515430',
    '[판 매] 2025-05-28 (수) 20:26:01',
    '상품명 수량',
    '의계',
    '하림)맛5가슴살오징어 100',
    '8801492392480 3',
    '52980380',
    '과세물품가액',
    '부 가 세',
    '할',
    '승인번호 16777143',
    '금액',
    '-4, 700',
    '-4,700',
    '+ 신용승인정보[고객용] +*',
    '9,400',
    '인 -4,700',
    '9,400',
    'IBK비씨체크[ IBK비씨체크] 9,400',
    '8,545',
    '855',
    'P:01-01 CNT:0003 REG: 백경도',
    '(N)일시볼',
    '외',
    '세븐일레븐 고객센터 1577-0711',
    '71061201251483085438',
    'il 완/환별은 영수증 및 결세가드',
    '둘시참이시어 30일 이나 구매',
    '심보 방문',
    '선도유시밀요실물 및신즌기의',
    '상품 통 일부목',
  ].join('\n');

  const metadata = extractReceiptMetadata(sampleOcrText);

  expect(metadata.itemCount).toBeGreaterThan(0);
  expect(metadata.lineItems).toContainEqual(
    expect.objectContaining({
      name: '하림)맛5가슴살오징어 100',
      quantity: '3',
    }),
  );
});

test('extracts sparse convenience line items even when barcode lines appear before the name', () => {
  const sampleOcrText = [
    '7-ELEVEL.',
    '세븐일레븐 삼성8호점#10612',
    '(02-3443-4789)',
    '김홍철',
    '서울특별시 강남구 봉은사로 63길',
    '11 (삼성동)',
    '[판 매] 2025-06-16 (월) 20:02:35',
    'Aheie) Luh..',
    '상품명 수람 금 액',
    '8809778498154',
    '1208515430',
    '이스타)도쿠시마라면큰컵',
    '합계',
    '2,200',
    '삼립)쏙닭쪽 닭불랙폐퍼100 -4,500',
    '8801068396669',
    '2',
    '52980380',
    '1',
    '과세물품가액',
    '부가 세',
    '할',
    '승인번호 71550266',
    '4,500',
    '6,091',
    '##후 신용승인정보[고객용] **',
    'IBK비씨크IBK비씨체크] 6,700',
    '점포 방부',
    '609',
    '인 -4,500',
    '#6,700',
    'P:01-01 CNT:0003 REG: 백경도',
    '(N)일시물',
    '세일레븐고객터 1577-0711',
    '71061 12012516 674355133',
    '교 1환/환복은 영수즘 및 결제카드',
    '치참하시어 30일 이내 구매',
    '선도 유지,요상품 및 시즌 기획',
    '상품 등 일부품복 제외',
  ].join('\n');

  const metadata = extractReceiptMetadata(sampleOcrText);

  expect(metadata.itemCount).toBeGreaterThan(0);
  expect(metadata.lineItems).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: '이스타)도쿠시마라면큰컵',
      }),
      expect.objectContaining({
        name: '삼립)쏙닭쪽 닭불랙폐퍼100',
        quantity: '2',
      }),
    ]),
  );
});
