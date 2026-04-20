import * as React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { useQuery } from '@tanstack/react-query';

import { fetchReceipts, receiptQueryKeys } from '../api/receipts';
import AppButton from '../components/AppButton';
import ReceiptCard from '../components/ReceiptCard';
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
    <ReceiptCard
      date={formatTimestamp(item.purchasedAt)}
      extractedMetadata={item.extractedMetadata}
      ocrText={item.ocrText}
      status={item.status as 'approved' | 'pending' | 'failed'}
      storeName={item.storeName || item.fileName || 'Unnamed receipt'}
      subtitle={item.storeName ? item.fileName : null}
      testID={`receipt-list-item-${item.id}`}
    />
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
      <View style={styles.headerRow}>
        <ScreenHeader
          description="Review the receipts currently stored in the mock server-state list."
          title="Receipt List"
          titleTestID="screen-receipt-list-title"
        />
        {receipts.length > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{receipts.length}</Text>
          </View>
        ) : null}
      </View>

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
          <AppButton
            onPress={() => refetch()}
            testID="retry-receipts-button"
            variant="ghost"
          >
            Try Again
          </AppButton>
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
              tintColor="#1c1c1c"
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
    backgroundColor: '#f7f4ed',
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  countBadge: {
    backgroundColor: 'rgba(28, 28, 28, 0.06)',
    borderColor: '#eceae4',
    borderRadius: 9999,
    borderWidth: 1,
    marginBottom: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countBadgeText: {
    color: '#5f5f5d',
    fontSize: 13,
    fontWeight: '500',
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
});

export default ReceiptListScreen;
