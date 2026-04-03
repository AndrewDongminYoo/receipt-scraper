import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchReceipts, receiptQueryKeys } from '../api/receipts';
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
    </View>
  );
}

function ReceiptListScreen() {
  const { data, error, isError, isLoading, refetch } = useQuery({
    queryFn: fetchReceipts,
    queryKey: receiptQueryKeys.all,
  });

  const receipts = data ?? [];

  return (
    <View style={styles.container} testID="screen-receipt-list">
      <Text style={styles.title} testID="screen-receipt-list-title">
        Receipt List
      </Text>

      {isLoading ? (
        <View style={styles.stateCard} testID="receipt-list-loading">
          <ActivityIndicator size="small" />
          <Text style={styles.description}>Loading receipts...</Text>
        </View>
      ) : null}

      {!isLoading && isError ? (
        <View style={styles.stateCard} testID="receipt-list-error">
          <Text style={styles.description}>
            {getReceiptsErrorMessage(error)}
          </Text>
          <View style={styles.retryButtonWrapper}>
            <Button
              onPress={() => refetch()}
              testID="retry-receipts-button"
              title="Try Again"
            />
          </View>
        </View>
      ) : null}

      {!isLoading && !isError && receipts.length === 0 ? (
        <View style={styles.stateCard} testID="receipt-list-empty">
          <Text style={styles.description}>No receipts uploaded yet.</Text>
          <Text style={styles.supportingText}>
            Upload one from the receipt flow to populate this list.
          </Text>
        </View>
      ) : null}

      {!isLoading && !isError && receipts.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={receipts}
          keyExtractor={item => item.id}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'left',
  },
  description: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'left',
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
  retryButtonWrapper: {
    marginTop: 16,
    width: '100%',
  },
  stateCard: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  supportingText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ReceiptListScreen;
