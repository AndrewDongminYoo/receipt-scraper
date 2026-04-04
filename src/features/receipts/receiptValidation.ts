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
  /(카드|현금|간편결제|pay|cash|card|visa|mastercard|일시불|할부)/i;
const QUANTITY_TOKEN_PATTERN = /^\d+(?:\.\d+)?$/;
const BARCODE_TOKEN_PATTERN = /^\d{8,14}$/;
const PROMOTION_TOKEN_PATTERN = /^\d+\+\d+$/;

function splitReceiptLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function collapseReceiptText(text: string): string {
  return text.replace(/\s+/g, '').toLowerCase();
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

function isBarcodeToken(token: string): boolean {
  return BARCODE_TOKEN_PATTERN.test(token);
}

function isPromotionToken(token: string): boolean {
  return PROMOTION_TOKEN_PATTERN.test(token);
}

function isItemHeaderLine(line: string): boolean {
  const collapsed = collapseReceiptText(line);

  return (
    ITEM_HEADER_PATTERN.test(collapsed) ||
    collapsed.includes('상품명') ||
    collapsed.includes('품목') ||
    collapsed.includes('단가수량금액') ||
    (collapsed.includes('단가') &&
      collapsed.includes('수량') &&
      collapsed.includes('금액'))
  );
}

function isSummaryLine(line: string): boolean {
  return SUMMARY_LINE_PATTERN.test(collapseReceiptText(line));
}

function tokenizeLine(line: string): string[] {
  return line.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
}

function parseItemDetailTokens(
  tokens: string[],
): Omit<ReceiptLineItem, 'name'> | null {
  const filtered = tokens.filter(
    token => !isBarcodeToken(token) && !isPromotionToken(token),
  );

  if (filtered.length < 3) {
    return null;
  }

  const tail = filtered.slice(-3);
  const [first, second, third] = tail;

  if (isMoneyToken(first) && isQuantityToken(second) && isMoneyToken(third)) {
    return {
      amount: third,
      quantity: second,
      unitPrice: first,
    };
  }

  if (isQuantityToken(first) && isMoneyToken(second) && isMoneyToken(third)) {
    return {
      amount: third,
      quantity: first,
      unitPrice: second,
    };
  }

  return null;
}

function parseItemLine(line: string): ReceiptLineItem | null {
  const cleaned = line.replace(/\s+/g, ' ').trim();

  if (
    !cleaned ||
    isItemHeaderLine(cleaned) ||
    isSummaryLine(cleaned) ||
    !/[A-Za-z가-힣]/.test(cleaned)
  ) {
    return null;
  }

  const parts = tokenizeLine(cleaned);

  if (parts.length < 4) {
    return null;
  }

  const name = parts
    .slice(0, -3)
    .join(' ')
    .replace(/^\d{1,2}\s+/, '')
    .trim();
  const details = parseItemDetailTokens(parts);

  if (!name || !details) {
    return null;
  }

  return { name, ...details };
}

function parseSplitItemLine(
  lines: string[],
  index: number,
): { item: ReceiptLineItem; consumedIndices: number[] } | null {
  const currentLine = lines[index];
  const cleaned = currentLine.replace(/\s+/g, ' ').trim();

  if (
    !cleaned ||
    isItemHeaderLine(cleaned) ||
    isSummaryLine(cleaned) ||
    !/[A-Za-z가-힣]/.test(cleaned) ||
    !/^\d{1,2}\s+/.test(cleaned)
  ) {
    return null;
  }

  const name = cleaned.replace(/^\d{1,2}\s+/, '').trim();

  if (!name) {
    return null;
  }

  for (let offset = 1; offset <= 3; offset += 1) {
    const detailLine = lines[index + offset];

    if (
      !detailLine ||
      isSummaryLine(detailLine) ||
      isItemHeaderLine(detailLine)
    ) {
      continue;
    }

    const details = parseItemDetailTokens(tokenizeLine(detailLine));

    if (!details) {
      continue;
    }

    return {
      consumedIndices: [index, index + offset],
      item: {
        name,
        ...details,
      },
    };
  }

  return null;
}

function findAmountNearKeyword(
  lines: string[],
  keywordPattern: RegExp,
): string | undefined {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!keywordPattern.test(collapseReceiptText(line))) {
      continue;
    }

    const sameLineAmount = matchAmountToken(line);

    if (sameLineAmount) {
      return sameLineAmount;
    }

    for (let offset = 1; offset <= 3; offset += 1) {
      const nextLine = lines[index + offset];

      if (!nextLine) {
        break;
      }

      const nextAmount = matchAmountToken(nextLine);

      if (nextAmount) {
        return nextAmount;
      }
    }
  }

  return undefined;
}

export function normalizeReceiptText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function extractReceiptMetadata(text: string): ReceiptExtractedMetadata {
  const lines = splitReceiptLines(text);
  const normalized = normalizeReceiptText(text);
  const lineItems: ReceiptLineItem[] = [];
  const consumedIndices = new Set<number>();

  for (let index = 0; index < lines.length; index += 1) {
    if (consumedIndices.has(index)) {
      continue;
    }

    const directItem = parseItemLine(lines[index]);

    if (directItem) {
      lineItems.push(directItem);
      consumedIndices.add(index);
      continue;
    }

    const splitItem = parseSplitItemLine(lines, index);

    if (!splitItem) {
      continue;
    }

    lineItems.push(splitItem.item);
    splitItem.consumedIndices.forEach(consumedIndex =>
      consumedIndices.add(consumedIndex),
    );
  }

  const paymentLine = lines.find(line => PAYMENT_METHOD_PATTERN.test(line));
  const storeLine = lines.find(
    line =>
      !matchAmountToken(line) &&
      !isItemHeaderLine(line) &&
      !isSummaryLine(line) &&
      /[A-Za-z가-힣]/.test(line),
  );
  const totalAmount =
    findAmountNearKeyword(
      lines,
      /(일시불|할부|결제금액|합계|총액|총금액|total)/i,
    ) || matchAmountToken(paymentLine || '');
  const vatAmount = findAmountNearKeyword(lines, /(부가세|vat|tax)/i);

  return {
    itemCount: lineItems.length,
    lineItems,
    paymentMethod: paymentLine?.match(PAYMENT_METHOD_PATTERN)?.[0],
    storeName: STORE_LABEL_PATTERN.test(normalized) ? storeLine : storeLine,
    totalAmount,
    vatAmount,
  };
}

export function looksLikeReceiptText(text: string): boolean {
  const normalized = normalizeReceiptText(text);
  const collapsed = collapseReceiptText(text);
  const metadata = extractReceiptMetadata(text);

  if (!normalized) {
    return false;
  }

  return (
    RECEIPT_AMOUNT_PATTERN.test(normalized) &&
    RECEIPT_KEYWORD_PATTERN.test(collapsed) &&
    metadata.lineItems.length > 0 &&
    Boolean(metadata.totalAmount)
  );
}
