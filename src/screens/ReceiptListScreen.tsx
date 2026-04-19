import * as React from 'react';
import {
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useQuery } from '@tanstack/react-query';

import { fetchReceipts, receiptQueryKeys } from '../api/receipts';
import ScreenHeader from '../components/ScreenHeader';
import StateCard from '../components/StateCard';
import type { ReceiptItem } from '../types/receipt';
import { formatTimestamp } from '../utils/formatTimestamp';

function getReceiptsErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to load receipts right now.';
}

function renderReceiptItem({ item }: { item: ReceiptItem }) {
  return (
    <View style={styles.receiptCard} testID={`receipt-list-item-${item.id}`}>
      <Text style={styles.receiptFileName}>
        {item.fileName || 'Unnamed receipt'}
      </Text>
      <Text style={styles.receiptMeta}>{item.storeName}</Text>
      <Text style={styles.receiptMeta}>Status: {item.status}</Text>
      <Text style={styles.receiptMeta}>
        Uploaded: {formatTimestamp(item.purchasedAt)}
      </Text>

      {item.extractedMetadata ? (
        <View style={styles.metadataSection}>
          <Text style={styles.sectionLabel}>Extracted metadata</Text>
          {item.extractedMetadata.totalAmount ? (
            <Text style={styles.receiptMeta}>
              Total: {item.extractedMetadata.totalAmount}
            </Text>
          ) : null}
          {item.extractedMetadata.vatAmount ? (
            <Text style={styles.receiptMeta}>
              VAT: {item.extractedMetadata.vatAmount}
            </Text>
          ) : null}
          {item.extractedMetadata.paymentMethod ? (
            <Text style={styles.receiptMeta}>
              Payment: {item.extractedMetadata.paymentMethod}
            </Text>
          ) : null}

          {item.extractedMetadata.lineItems.map((lineItem, index) => (
            <Text
              key={`${item.id}-line-item-${index}`}
              style={styles.receiptMeta}
              testID={`receipt-line-item-${item.id}-${index}`}
            >
              {`${lineItem.name} · Qty ${lineItem.quantity || '?'} · Unit ${
                lineItem.unitPrice || '?'
              } · Amount ${lineItem.amount || '?'}`}
            </Text>
          ))}
        </View>
      ) : null}

      {item.ocrText ? (
        <View style={styles.metadataSection}>
          <Text style={styles.sectionLabel}>Extracted text</Text>
          <Text style={styles.ocrText}>{item.ocrText}</Text>
        </View>
      ) : null}
    </View>
  );
}

function ReceiptListScreen() {
  const { data, error, isError, isFetching, isLoading, refetch } = useQuery({
    queryFn: fetchReceipts,
    queryKey: receiptQueryKeys.all,
  });

  const isRefreshing = isFetching && !isLoading;

  const receipts = data ?? [];

  return (
    <View style={styles.container} testID="screen-receipt-list">
      <ScreenHeader
        description="Review the receipts currently stored in the mock server-state list."
        title="Receipt List"
        titleTestID="screen-receipt-list-title"
      />

      {isLoading ? (
        <StateCard
          message="Loading receipts..."
          showsActivityIndicator
          testID="receipt-list-loading"
          title="Loading receipts"
        />
      ) : null}

      {!isLoading && isError ? (
        <StateCard
          message={getReceiptsErrorMessage(error)}
          testID="receipt-list-error"
          title="Unable to load receipts"
          variant="error"
        >
          <View style={styles.retryButtonWrapper}>
            <Button
              onPress={() => refetch()}
              testID="retry-receipts-button"
              title="Try Again"
            />
          </View>
        </StateCard>
      ) : null}

      {!isLoading && !isError && receipts.length === 0 ? (
        <StateCard
          message="Upload one from the receipt flow to populate this list."
          testID="receipt-list-empty"
          title="No receipts uploaded yet."
        />
      ) : null}

      {!isLoading && !isError && receipts.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={receipts}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              onRefresh={refetch}
              refreshing={isRefreshing}
              testID="receipt-list-refresh-control"
            />
          }
          renderItem={renderReceiptItem}
          testID="receipt-list-success"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  receiptCard: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  receiptFileName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  receiptMeta: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  metadataSection: {
    borderTopColor: '#e5e7eb',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  ocrText: {
    color: '#374151',
    fontFamily: 'Courier',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  retryButtonWrapper: {
    width: '100%',
  },
  sectionLabel: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
});

export default ReceiptListScreen;
