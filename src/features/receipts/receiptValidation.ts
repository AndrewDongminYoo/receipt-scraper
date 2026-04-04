import type {
  ReceiptExtractedMetadata,
  ReceiptLineItem,
} from '../../types/receipt';

const RECEIPT_AMOUNT_PATTERN =
  /[#-]?\s*(?:₩\s*)?\d{1,3}(?:[,.]\d{3})+(?:\s*원)?|[#-]?\s*(?:₩\s*)?\d+\s*원|\$\s?\d+[.,]\d{2}|[#-]?\s*\d+[.,]\d{2}\s*(USD|GBP|EUR|KRW|JPY|원)?/i;

const RECEIPT_KEYWORD_PATTERN =
  /(합계|총액|총금액|결제|대상금액|받은금액|거스름돈|부가세|과세물품|과세|면세물품|면세|공급가액|상품명|영수증|교환|POS|단가|수량|금액|카드|구매|일시불|할부|승인|거래|매출|현금영수증|신용승인|판매|매장|품목|subtotal|total|tax|vat|receipt|cashier|transaction|qty|cash|card|visa|mastercard|invoice)/i;

const ITEM_HEADER_PATTERN =
  /(상품명|품목|description|item).*(단가|unit).*(수량|qty).*(금액|amount)|(item|description).*(qty).*(unit|price).*(amount)/i;
const SUMMARY_LINE_PATTERN =
  /(합계|총액|총금액|결제|대상금액|받은금액|거스름돈|부가세|과세물품|면세물품|공급가액|영수증|교환|승인|거래|매출|현금영수증|카드|일시불|할부|tax|vat|total|subtotal|receipt|cash|card|visa|mastercard|invoice)/i;
const STORE_LABEL_PATTERN = /(매장명|상호|점포명|지점|store|mart)/i;
const PAYMENT_METHOD_PATTERN =
  /(카드|현금|간편결제|pay|cash|card|visa|mastercard|일시불|할부)/i;
const BUSINESS_NUMBER_PATTERN = /\b\d{3}-\d{2}-\d{5}\b/;
const PURCHASE_DATE_TIME_PATTERN =
  /(\d{4}[./-]\d{2}[./-]\d{2})(?:\s*\([^)]+\))?(?:\s+)(\d{2}:\d{2}(?::\d{2})?)/;
const ADDRESS_LINE_PATTERN =
  /^(?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주|[가-힣]+특별시|[가-힣]+광역시|[가-힣]+자치시|[가-힣]+도).*(?:로|길|동|읍|면|리)/;
const REFUND_RECEIPT_PATTERN =
  /(환불영수증|환불금액|환불합계|반품완료|거래취소|승인취소|카드취소|결제취소|취소영수증|refund|cancel)/i;
const REFUND_EXCLUSION_PATTERN =
  /(교환환불|환불규정|영수증지참|구매점방문|점포방문|30일이내구매|결제카드지참|정부방침으로교환환불시영수증)/i;
const QUANTITY_TOKEN_PATTERN = /^\d+(?:\.\d+)?$/;
const BARCODE_TOKEN_PATTERN = /^\d{8,14}$/;
const PROMOTION_TOKEN_PATTERN = /^\d+\+\d+$/;
const NON_ITEM_LINE_PATTERN =
  /(고객센터|영수증|교환|환불|구매점|점포방문|점포|구매|고객|고객용|승인번호|카드번호|사업자등록번호|과세물품|부가세|합계|결제|일시물|일시불|할부|정부방침|담당|전화|tel|포인트|reg:|cnt:|객층|신용승인정보|비씨|체크|ibk|방문|선도유지|일부품목)/i;
const ITEM_SECTION_TERMINATOR_PATTERN =
  /(과세물품|부가세|신용승인정보|고객용|카드번호|카드회사|고객센터|객층|담당|reg:|cnt:|p:\d|비씨|체크|ibk)/i;

function splitReceiptLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function collapseReceiptText(text: string): string {
  return text.replace(/\s+/g, '').toLowerCase();
}

function compactReceiptText(text: string): string {
  return text.replace(/[^0-9a-zA-Z가-힣]+/g, '').toLowerCase();
}

function normalizeNumericSpacing(text: string): string {
  return text.replace(/(\d)\s*([,.])\s*(\d)/g, '$1$2$3');
}

function matchAmountToken(line: string): string | undefined {
  return normalizeNumericSpacing(line)
    .match(RECEIPT_AMOUNT_PATTERN)?.[0]
    ?.trim();
}

function isMoneyToken(token: string): boolean {
  return RECEIPT_AMOUNT_PATTERN.test(normalizeNumericSpacing(token));
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
  return normalizeNumericSpacing(line)
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function parseAmountNumber(value: string): number | null {
  const normalized = normalizeNumericSpacing(value).replace(/[^\d.,]/g, '');

  if (!normalized) {
    return null;
  }

  const parsed = /^\d{1,3}(?:[,.]\d{3})+$/.test(normalized)
    ? Number(normalized.replace(/[,.]/g, ''))
    : Number(normalized.replace(/,/g, ''));

  return Number.isFinite(parsed) ? parsed : null;
}

function formatAmountNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeFingerprintText(value?: string): string | undefined {
  const normalized = value?.replace(/[^0-9a-zA-Z가-힣]/g, '').toLowerCase();

  return normalized || undefined;
}

function normalizeAmountValue(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = parseAmountNumber(value);

  return parsed === null ? undefined : String(parsed);
}

function normalizeDateTimeValue(value?: string): string | undefined {
  const normalized = value?.replace(/[^\d]/g, '');

  return normalized || undefined;
}

function hashReceiptSeed(seed: string): string {
  let hash = 17;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(index)) % 2147483647;
  }

  return `receipt_${hash.toString(16).padStart(8, '0')}`;
}

function inferAmount(unitPrice: string, quantity: string): string | undefined {
  const parsedUnitPrice = parseAmountNumber(unitPrice);
  const parsedQuantity = Number(quantity);

  if (!parsedUnitPrice || !Number.isFinite(parsedQuantity)) {
    return undefined;
  }

  return formatAmountNumber(parsedUnitPrice * parsedQuantity);
}

function extractBusinessNumber(lines: string[]): string | undefined {
  for (const line of lines) {
    const matchedBusinessNumber = line.match(BUSINESS_NUMBER_PATTERN)?.[0];

    if (matchedBusinessNumber) {
      return matchedBusinessNumber;
    }
  }

  return undefined;
}

function extractPurchaseDateTime(lines: string[]): string | undefined {
  for (const line of lines) {
    const matchedDateTime = line.match(PURCHASE_DATE_TIME_PATTERN);

    if (!matchedDateTime) {
      continue;
    }

    const normalizedDate = matchedDateTime[1].replace(/[./]/g, '-');
    const normalizedTime =
      matchedDateTime[2].length === 5
        ? `${matchedDateTime[2]}:00`
        : matchedDateTime[2];

    return `${normalizedDate}T${normalizedTime}`;
  }

  return undefined;
}

function isAddressLine(line: string): boolean {
  return (
    ADDRESS_LINE_PATTERN.test(line) &&
    !isItemHeaderLine(line) &&
    !isSummaryLine(line) &&
    !BUSINESS_NUMBER_PATTERN.test(line) &&
    !/\bPOS\b/i.test(line)
  );
}

function extractStoreAddress(lines: string[]): string | undefined {
  return lines.find(isAddressLine);
}

function isRefundReceiptLine(line: string): boolean {
  const collapsed = compactReceiptText(line);

  if (REFUND_EXCLUSION_PATTERN.test(collapsed)) {
    return false;
  }

  return (
    REFUND_RECEIPT_PATTERN.test(collapsed) ||
    /^환불(?:\d|$)/.test(collapsed) ||
    /^반품(?:\d|$)/.test(collapsed)
  );
}

function buildReceiptFingerprint(
  metadata: ReceiptExtractedMetadata,
  originalText: string,
): string | undefined {
  const lineItemSignature = metadata.lineItems
    .map(lineItem =>
      [
        normalizeAmountValue(lineItem.unitPrice),
        lineItem.quantity?.trim(),
        normalizeAmountValue(lineItem.amount),
      ]
        .filter(Boolean)
        .join(':'),
    )
    .filter(Boolean)
    .join('|');
  const hasStructuredIdentity = Boolean(
    normalizeDateTimeValue(metadata.purchaseDateTime) &&
    normalizeAmountValue(metadata.totalAmount) &&
    (normalizeFingerprintText(metadata.businessNumber) ||
      normalizeFingerprintText(metadata.storeAddress) ||
      normalizeFingerprintText(metadata.storeName)),
  );

  if (hasStructuredIdentity) {
    return hashReceiptSeed(
      [
        normalizeFingerprintText(metadata.storeName),
        normalizeFingerprintText(metadata.storeAddress),
        normalizeFingerprintText(metadata.businessNumber),
        normalizeDateTimeValue(metadata.purchaseDateTime),
        normalizeAmountValue(metadata.totalAmount),
        normalizeAmountValue(metadata.vatAmount),
        normalizeFingerprintText(metadata.paymentMethod),
        String(metadata.itemCount),
        lineItemSignature,
      ]
        .filter(Boolean)
        .join('::'),
    );
  }

  const collapsedText = collapseReceiptText(originalText);

  return collapsedText ? hashReceiptSeed(collapsedText) : undefined;
}

function parseItemDetailTokens(
  tokens: string[],
  options?: {
    allowInferredAmount?: boolean;
    allowInferredQuantity?: boolean;
    allowQuantityOnly?: boolean;
  },
): Omit<ReceiptLineItem, 'name'> | null {
  const filtered = tokens.filter(
    token => !isBarcodeToken(token) && !isPromotionToken(token),
  );

  for (let index = 0; index <= filtered.length - 3; index += 1) {
    const [first, second, third] = filtered.slice(index, index + 3);

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
  }

  if (options?.allowInferredAmount && filtered.length >= 2) {
    for (let index = 0; index <= filtered.length - 2; index += 1) {
      const [first, second] = filtered.slice(index, index + 2);

      if (isMoneyToken(first) && isQuantityToken(second)) {
        return {
          amount: inferAmount(first, second),
          quantity: second,
          unitPrice: first,
        };
      }

      if (isQuantityToken(first) && isMoneyToken(second)) {
        return {
          amount: inferAmount(second, first),
          quantity: first,
          unitPrice: second,
        };
      }
    }
  }

  if (options?.allowInferredQuantity) {
    const firstMoneyToken = filtered.find(token => isMoneyToken(token));

    if (firstMoneyToken) {
      return {
        amount: firstMoneyToken,
        quantity: '1',
        unitPrice: firstMoneyToken,
      };
    }
  }

  if (options?.allowQuantityOnly) {
    const firstQuantityToken = filtered.find(token => isQuantityToken(token));

    if (firstQuantityToken) {
      return {
        quantity: firstQuantityToken,
      };
    }
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

  const detailTokens: string[] = [];
  const consumedIndices = [index];

  for (let offset = 1; offset <= 5; offset += 1) {
    const detailLine = lines[index + offset];

    if (!detailLine) {
      break;
    }

    const normalizedDetailLine = detailLine.replace(/\s+/g, ' ').trim();

    if (/^\d{1,2}\s+/.test(normalizedDetailLine)) {
      break;
    }

    if (
      isSummaryLine(normalizedDetailLine) ||
      isItemHeaderLine(normalizedDetailLine)
    ) {
      break;
    }

    detailTokens.push(...tokenizeLine(normalizedDetailLine));
    consumedIndices.push(index + offset);
  }

  const details = parseItemDetailTokens(detailTokens, {
    allowInferredAmount: true,
    allowInferredQuantity: true,
    allowQuantityOnly: true,
  });

  if (!details) {
    return null;
  }

  return {
    consumedIndices,
    item: {
      name,
      ...details,
    },
  };
}

function isLikelyItemNameLine(line: string): boolean {
  const cleaned = line.replace(/\s+/g, ' ').trim();

  return (
    Boolean(cleaned) &&
    cleaned.length >= 5 &&
    /[A-Za-z가-힣]/.test(cleaned) &&
    !isItemHeaderLine(cleaned) &&
    !isSummaryLine(cleaned) &&
    !PAYMENT_METHOD_PATTERN.test(cleaned) &&
    !BUSINESS_NUMBER_PATTERN.test(cleaned) &&
    !PURCHASE_DATE_TIME_PATTERN.test(cleaned) &&
    !isAddressLine(cleaned) &&
    !NON_ITEM_LINE_PATTERN.test(cleaned)
  );
}

function isItemSectionTerminatorLine(line: string): boolean {
  return ITEM_SECTION_TERMINATOR_PATTERN.test(line);
}

function isLikelyDetailLine(line: string): boolean {
  const cleaned = line.replace(/\s+/g, ' ').trim();

  if (
    !cleaned ||
    isItemHeaderLine(cleaned) ||
    isLikelyItemNameLine(cleaned) ||
    PAYMENT_METHOD_PATTERN.test(cleaned)
  ) {
    return false;
  }

  return tokenizeLine(cleaned).every(token => {
    const compactToken = token.replace(/^[#*-]+/, '');

    return (
      isBarcodeToken(compactToken) ||
      isQuantityToken(compactToken) ||
      isMoneyToken(compactToken) ||
      /^-?\d+$/.test(compactToken)
    );
  });
}

function splitSparseItemNameAndInlineDetails(line: string): {
  inlineDetailTokens: string[];
  name: string;
} {
  const tokens = tokenizeLine(line);
  const inlineDetailTokens: string[] = [];

  while (tokens.length > 1) {
    const lastToken = tokens[tokens.length - 1].replace(/^[#*-]+/, '');

    if (!isMoneyToken(lastToken)) {
      break;
    }

    inlineDetailTokens.unshift(lastToken);
    tokens.pop();
  }

  return {
    inlineDetailTokens,
    name: tokens.join(' ').trim(),
  };
}

function parseSparseItemLine(
  lines: string[],
  index: number,
): { item: ReceiptLineItem; consumedIndices: number[] } | null {
  const currentLine = lines[index];
  const cleaned = currentLine.replace(/\s+/g, ' ').trim();

  if (!isLikelyItemNameLine(cleaned)) {
    return null;
  }

  const { inlineDetailTokens, name } =
    splitSparseItemNameAndInlineDetails(cleaned);

  if (!name) {
    return null;
  }

  const detailTokens = [...inlineDetailTokens];
  const consumedIndices = [index];

  for (let offset = 2; offset >= 1; offset -= 1) {
    const previousLine = lines[index - offset];

    if (!previousLine) {
      continue;
    }

    if (isLikelyDetailLine(previousLine)) {
      detailTokens.unshift(...tokenizeLine(previousLine));
      consumedIndices.unshift(index - offset);
    }
  }

  for (let offset = 1; offset <= 3; offset += 1) {
    const nextLine = lines[index + offset];

    if (!nextLine) {
      break;
    }

    const normalizedNextLine = nextLine.replace(/\s+/g, ' ').trim();

    if (isLikelyItemNameLine(normalizedNextLine)) {
      break;
    }

    if (isSummaryLine(normalizedNextLine)) {
      const amountLine = lines[index + offset + 1];

      if (amountLine && isLikelyDetailLine(amountLine)) {
        detailTokens.push(...tokenizeLine(amountLine));
        consumedIndices.push(index + offset + 1);
      }
      break;
    }

    if (!isLikelyDetailLine(normalizedNextLine)) {
      break;
    }

    detailTokens.push(...tokenizeLine(normalizedNextLine));
    consumedIndices.push(index + offset);
  }

  const detailEvidenceExists = detailTokens.some(
    token =>
      isBarcodeToken(token.replace(/^[#*-]+/, '')) ||
      isQuantityToken(token.replace(/^[#*-]+/, '')) ||
      isMoneyToken(token.replace(/^[#*-]+/, '')),
  );

  if (!detailEvidenceExists) {
    return null;
  }

  const details = parseItemDetailTokens(detailTokens, {
    allowInferredAmount: true,
    allowInferredQuantity: true,
    allowQuantityOnly: true,
  });

  return {
    consumedIndices,
    item: {
      name,
      ...details,
    },
  };
}

function parseSummaryAmountItemLine(
  lines: string[],
  index: number,
): { item: ReceiptLineItem; consumedIndices: number[] } | null {
  const currentLine = lines[index];
  const cleaned = currentLine.replace(/\s+/g, ' ').trim();
  const summaryLine = lines[index + 1];
  const amountLine = lines[index + 2];

  if (
    !isLikelyItemNameLine(cleaned) ||
    !summaryLine ||
    !isSummaryLine(summaryLine) ||
    !amountLine ||
    !isLikelyDetailLine(amountLine)
  ) {
    return null;
  }

  const detailTokens: string[] = [...tokenizeLine(amountLine)];
  const consumedIndices = [index, index + 2];

  for (let offset = 2; offset >= 1; offset -= 1) {
    const previousLine = lines[index - offset];

    if (!previousLine || !isLikelyDetailLine(previousLine)) {
      continue;
    }

    detailTokens.unshift(...tokenizeLine(previousLine));
    consumedIndices.unshift(index - offset);
  }

  const details = parseItemDetailTokens(detailTokens, {
    allowInferredAmount: true,
    allowInferredQuantity: true,
    allowQuantityOnly: true,
  });

  if (!details) {
    return null;
  }

  return {
    consumedIndices,
    item: {
      name: cleaned,
      ...details,
    },
  };
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
  const itemSectionStartIndex = lines.findIndex(isItemHeaderLine);
  const parsingStartIndex =
    itemSectionStartIndex >= 0 ? itemSectionStartIndex + 1 : 0;

  for (let index = parsingStartIndex; index < lines.length; index += 1) {
    if (consumedIndices.has(index)) {
      continue;
    }

    if (lineItems.length > 0 && isItemSectionTerminatorLine(lines[index])) {
      break;
    }

    const directItem = parseItemLine(lines[index]);

    if (directItem) {
      lineItems.push(directItem);
      consumedIndices.add(index);
      continue;
    }

    const splitItem = parseSplitItemLine(lines, index);

    if (splitItem) {
      lineItems.push(splitItem.item);
      splitItem.consumedIndices.forEach(consumedIndex =>
        consumedIndices.add(consumedIndex),
      );
      continue;
    }

    const summaryAmountItem = parseSummaryAmountItemLine(lines, index);

    if (summaryAmountItem) {
      lineItems.push(summaryAmountItem.item);
      summaryAmountItem.consumedIndices.forEach(consumedIndex =>
        consumedIndices.add(consumedIndex),
      );
      continue;
    }

    const sparseItem = parseSparseItemLine(lines, index);

    if (!sparseItem) {
      continue;
    }

    lineItems.push(sparseItem.item);
    sparseItem.consumedIndices.forEach(consumedIndex =>
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
  const metadata: ReceiptExtractedMetadata = {
    businessNumber: extractBusinessNumber(lines),
    itemCount: lineItems.length,
    isRefund: lines.some(isRefundReceiptLine),
    lineItems,
    paymentMethod: paymentLine?.match(PAYMENT_METHOD_PATTERN)?.[0],
    purchaseDateTime: extractPurchaseDateTime(lines),
    storeAddress: extractStoreAddress(lines),
    storeName: STORE_LABEL_PATTERN.test(normalized) ? storeLine : storeLine,
    totalAmount,
    vatAmount,
  };

  metadata.receiptFingerprint = buildReceiptFingerprint(metadata, text);

  return metadata;
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
    Boolean(
      metadata.totalAmount ||
      metadata.purchaseDateTime ||
      metadata.storeAddress ||
      metadata.businessNumber,
    )
  );
}
