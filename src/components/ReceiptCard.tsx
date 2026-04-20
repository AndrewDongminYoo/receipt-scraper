import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ReceiptExtractedMetadata } from '../types/receipt';

type ReceiptStatus = 'approved' | 'pending' | 'failed';

interface ReceiptCardProps {
  amount?: string | null;
  date?: string;
  extractedMetadata?: ReceiptExtractedMetadata | null;
  onPress?: () => void;
  ocrText?: string | null;
  status?: ReceiptStatus;
  storeName: string;
  subtitle?: string | null;
  testID?: string;
}

const STATUS_LABEL: Record<ReceiptStatus, string> = {
  approved: 'Approved',
  failed: 'Failed',
  pending: 'Pending',
};

function ReceiptCard({
  amount,
  date,
  extractedMetadata,
  onPress,
  ocrText,
  status = 'pending',
  storeName,
  subtitle,
  testID,
}: ReceiptCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      testID={testID}
    >
      <View style={[styles.badge, badgeStyles[status]]}>
        <Text style={[styles.badgeText, badgeTextStyles[status]]}>
          {STATUS_LABEL[status]}
        </Text>
      </View>

      <Text style={styles.storeName}>{storeName}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {amount ? <Text style={styles.amount}>{amount}</Text> : null}

      {date ? <Text style={styles.date}>{date}</Text> : null}

      {extractedMetadata ? (
        <View style={styles.metadataSection}>
          {extractedMetadata.totalAmount ? (
            <Text style={styles.metaText}>
              Total: {extractedMetadata.totalAmount}
            </Text>
          ) : null}
          {extractedMetadata.vatAmount ? (
            <Text style={styles.metaText}>
              VAT: {extractedMetadata.vatAmount}
            </Text>
          ) : null}
          {extractedMetadata.paymentMethod ? (
            <Text style={styles.metaText}>
              Payment: {extractedMetadata.paymentMethod}
            </Text>
          ) : null}
          {extractedMetadata.lineItems.map((lineItem, index) => (
            <Text key={`line-item-${index}`} style={styles.metaText}>
              {`${lineItem.name} · Qty ${lineItem.quantity || '?'} · Unit ${lineItem.unitPrice || '?'} · Amount ${lineItem.amount || '?'}`}
            </Text>
          ))}
        </View>
      ) : null}

      {ocrText ? (
        <View style={styles.ocrSection}>
          <Text style={styles.ocrText}>{ocrText}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  amount: {
    color: '#92400e',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fcfbf8',
    borderColor: '#eceae4',
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardPressed: {
    opacity: 0.85,
  },
  date: {
    color: '#5f5f5d',
    fontSize: 13,
    marginTop: 6,
  },
  metadataSection: {
    borderTopColor: '#eceae4',
    borderTopWidth: 1,
    gap: 4,
    marginTop: 12,
    paddingTop: 10,
  },
  metaText: {
    color: '#5f5f5d',
    fontSize: 14,
    lineHeight: 20,
  },
  ocrSection: {
    borderTopColor: '#eceae4',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  ocrText: {
    color: '#5f5f5d',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  storeName: {
    color: '#1c1c1c',
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    color: '#5f5f5d',
    fontSize: 13,
    marginTop: 2,
  },
});

const badgeStyles = StyleSheet.create({
  approved: { backgroundColor: '#ecfdf5', borderColor: '#6ee7b7' },
  failed: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  pending: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
});

const badgeTextStyles = StyleSheet.create({
  approved: { color: '#065f46' },
  failed: { color: '#991b1b' },
  pending: { color: '#92400e' },
});

export default ReceiptCard;
