const RECEIPT_AMOUNT_PATTERN =
  /(?:₩\s*)?\d{1,3}(?:,\d{3})+(?:\s*원)?|(?:₩\s*)?\d{4,}(?:\s*원)|\$\s?\d+[.,]\d{2}|\d+[.,]\d{2}\s*(USD|GBP|EUR|KRW|JPY|원)?/i;

const RECEIPT_KEYWORD_PATTERN =
  /(합계|총액|총금액|결제|대상금액|받은금액|거스름돈|부가세|과세물품|과세|면세물품|면세|공급가액|상품명|영수증|교환|POS|단가|수량|금액|카드|구매|일시불|할부|승인|거래|매출|현금영수증|신용승인|판매|매장|품목|subtotal|total|tax|vat|receipt|cashier|transaction|qty|cash|card|visa|mastercard|invoice)/i;

export function normalizeReceiptText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function looksLikeReceiptText(text: string): boolean {
  const normalized = normalizeReceiptText(text);

  if (!normalized) {
    return false;
  }

  return (
    RECEIPT_AMOUNT_PATTERN.test(normalized) &&
    RECEIPT_KEYWORD_PATTERN.test(normalized)
  );
}
