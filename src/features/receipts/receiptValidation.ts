import type {
  ReceiptExtractedMetadata,
  ReceiptLineItem,
} from '../../types/receipt';

const RECEIPT_AMOUNT_PATTERN =
  /(?:₩\s*)?\d{1,3}(?:,\d{3})+(?:\s*원)?|(?:₩\s*)?\d+\s*원|\$\s?\d+[.,]\d{2}|\d+[.,]\d{2}\s*(USD|GBP|EUR|KRW|JPY|원)?/i;

const RECEIPT_KEYWORD_PATTERN =
  /(합계|총액|총금액|결제|대상금액|받은금액|거스름돈|부가세|과세물품|과세|면세물품|면세|공급가액|상품명|영수증|교환|POS|단가|수량|금액|카드|구매|일시불|할부|승인|거래|매출|현금영수증|신용승인|판매|매장|품목|subtotal|total|tax|vat|receipt|cashier|transaction|qty|cash|card|visa|mastercard|invoice)/i;

const ITEM_HEADER_PATTERN =
  /(상품명|품목|description|item).*(단가|unit).*(수량|qty).*(금액|amount)|(item|description).*(qty).*(unit|price).*(amount)/i;
const SUMMARY_LINE_PATTERN =
  /(합계|총액|총금액|결제|대상금액|받은금액|거스름돈|부가세|과세물품|면세물품|공급가액|영수증|교환|승인|거래|매출|현금영수증|카드|일시불|할부|tax|vat|total|subtotal|receipt|cash|card|visa|mastercard|invoice)/i;
const STORE_LABEL_PATTERN = /(매장명|상호|점포명|지점|store|mart)/i;
const PAYMENT_METHOD_PATTERN =
  /(카드|현금|간편결제|pay|cash|card|visa|mastercard)/i;
const QUANTITY_TOKEN_PATTERN = /^\d+(?:\.\d+)?$/;

function splitReceiptLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function matchAmountToken(line: string): string | undefined {
  return line.match(RECEIPT_AMOUNT_PATTERN)?.[0];
}

function isMoneyToken(token: string): boolean {
  return RECEIPT_AMOUNT_PATTERN.test(token);
}

function isQuantityToken(token: string): boolean {
  return QUANTITY_TOKEN_PATTERN.test(token);
}

function parseItemLine(line: string): ReceiptLineItem | null {
  const cleaned = line.replace(/\s+/g, ' ').trim();

  if (
    !cleaned ||
    ITEM_HEADER_PATTERN.test(cleaned) ||
    SUMMARY_LINE_PATTERN.test(cleaned) ||
    !/[A-Za-z가-힣]/.test(cleaned)
  ) {
    return null;
  }

  const parts = cleaned.split(' ');

  if (parts.length < 4) {
    return null;
  }

  const tail = parts.slice(-3);
  const name = parts.slice(0, -3).join(' ').trim();

  if (!name) {
    return null;
  }

  const [first, second, third] = tail;

  if (isMoneyToken(first) && isQuantityToken(second) && isMoneyToken(third)) {
    return {
      amount: third,
      name,
      quantity: second,
      unitPrice: first,
    };
  }

  if (isQuantityToken(first) && isMoneyToken(second) && isMoneyToken(third)) {
    return {
      amount: third,
      name,
      quantity: first,
      unitPrice: second,
    };
  }

  return null;
}

export function normalizeReceiptText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function extractReceiptMetadata(text: string): ReceiptExtractedMetadata {
  const lines = splitReceiptLines(text);
  const normalized = normalizeReceiptText(text);
  const lineItems = lines
    .map(line => parseItemLine(line))
    .filter((item): item is ReceiptLineItem => item !== null);

  const totalLine = lines.find(line =>
    /(합계|총액|총금액|결제금액|total)/i.test(line),
  );
  const vatLine = lines.find(line => /(부가세|vat|tax)/i.test(line));
  const paymentLine = lines.find(line => PAYMENT_METHOD_PATTERN.test(line));
  const storeLine = lines.find(
    line =>
      !matchAmountToken(line) &&
      !ITEM_HEADER_PATTERN.test(line) &&
      !SUMMARY_LINE_PATTERN.test(line) &&
      /[A-Za-z가-힣]/.test(line),
  );

  return {
    itemCount: lineItems.length,
    lineItems,
    paymentMethod: paymentLine?.match(PAYMENT_METHOD_PATTERN)?.[0],
    storeName: STORE_LABEL_PATTERN.test(normalized) ? storeLine : storeLine,
    totalAmount: totalLine ? matchAmountToken(totalLine) : undefined,
    vatAmount: vatLine ? matchAmountToken(vatLine) : undefined,
  };
}

export function looksLikeReceiptText(text: string): boolean {
  const normalized = normalizeReceiptText(text);
  const metadata = extractReceiptMetadata(text);

  if (!normalized) {
    return false;
  }

  return (
    RECEIPT_AMOUNT_PATTERN.test(normalized) &&
    RECEIPT_KEYWORD_PATTERN.test(normalized) &&
    metadata.lineItems.length > 0 &&
    Boolean(metadata.totalAmount)
  );
}
