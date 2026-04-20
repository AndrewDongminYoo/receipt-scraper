import * as React from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { fetchReceipts, receiptQueryKeys } from '../api/receipts';
import AppButton from '../components/AppButton';
import ReceiptCard from '../components/ReceiptCard';
import StateCard from '../components/StateCard';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens';
import type { ReceiptItem } from '../types/receipt';

function getReceiptsErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to load receipts right now.';
}

/** Shimmering skeleton card for loading state */
function SkeletonCard() {
  const [opacity] = React.useState(() => new Animated.Value(0.4));

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View style={[skeletonStyles.card, { opacity }]}>
      <View style={skeletonStyles.header} />
      <View style={skeletonStyles.line} />
      <View style={[skeletonStyles.line, skeletonStyles.lineShort]} />
    </Animated.View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    gap: space.sm,
    height: 88,
    padding: space.lg,
  },
  header: {
    backgroundColor: colors.ink300,
    borderRadius: radii.sm,
    height: 16,
    width: '60%',
  },
  line: {
    backgroundColor: colors.ink100,
    borderRadius: radii.sm,
    height: 12,
    width: '100%',
  },
  lineShort: {
    width: '40%',
  },
});

/** Empty state illustration — three overlapping receipt-like cards */
function EmptyIllustration() {
  return (
    <View style={emptyStyles.stack}>
      <View style={[emptyStyles.card, emptyStyles.cardBack2]} />
      <View style={[emptyStyles.card, emptyStyles.cardBack1]} />
      <View style={[emptyStyles.card, emptyStyles.cardFront]}>
        <Text style={emptyStyles.questionMark}>?</Text>
      </View>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.ink300,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 88,
    width: 160,
  },
  cardBack1: {
    position: 'absolute',
    transform: [{ rotate: '-6deg' }, { translateY: 4 }],
  },
  cardBack2: {
    position: 'absolute',
    transform: [{ rotate: '6deg' }, { translateY: 4 }],
  },
  cardFront: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionMark: {
    color: colors.ink300,
    fontSize: 36,
    fontWeight: fontWeights.extrabold,
  },
  stack: {
    alignItems: 'center',
    height: 100,
    justifyContent: 'center',
    marginBottom: space.xl,
    position: 'relative',
    width: 180,
  },
});

function renderReceiptItem({ item }: { item: ReceiptItem }) {
  return <ReceiptCard item={item} testID={`receipt-list-item-${item.id}`} />;
}

function ReceiptListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, error, isError, isFetching, isLoading, refetch } = useQuery({
    queryFn: fetchReceipts,
    queryKey: receiptQueryKeys.all,
  });

  const isRefreshing = isFetching && !isLoading;
  const receipts = data ?? [];

  return (
    <View style={styles.container} testID="screen-receipt-list">
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.title} testID="screen-receipt-list-title">
          내 영수증 📋
        </Text>
        {receipts.length > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{receipts.length}장</Text>
          </View>
        ) : null}
      </View>

      {/* Loading skeletons */}
      {isLoading ? (
        <View style={styles.skeletonList} testID="receipt-list-loading">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : null}

      {/* Error */}
      {!isLoading && isError ? (
        <StateCard
          message={getReceiptsErrorMessage(error)}
          testID="receipt-list-error"
          title="영수증을 불러올 수 없어요"
          variant="error"
        >
          <AppButton
            onPress={() => refetch()}
            size="md"
            testID="retry-receipts-button"
            title="다시 시도"
            variant="secondary"
          />
        </StateCard>
      ) : null}

      {/* Empty state */}
      {!isLoading && !isError && receipts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyIllustration />
          <Text style={styles.emptyTitle}>아직 영수증이 없어요</Text>
          <Text style={styles.emptyDescription}>
            첫 영수증을 올리고 포인트를 받아보세요
          </Text>
          <AppButton
            onPress={() =>
              navigation.navigate('ReceiptUpload', { autoStart: false })
            }
            size="lg"
            testID="receipt-list-empty"
            title="영수증 올리기"
            variant="primary"
          />
        </View>
      ) : null}

      {/* Receipt list */}
      {!isLoading && !isError && receipts.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={receipts}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              onRefresh={refetch}
              refreshing={isRefreshing}
              tintColor={colors.primary500}
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
    backgroundColor: colors.canvas,
    flex: 1,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
  },
  countBadge: {
    backgroundColor: colors.lavender200,
    borderRadius: radii.full,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  countBadgeText: {
    color: colors.lavender700,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: space['2xl'],
  },
  emptyDescription: {
    color: colors.ink500,
    fontSize: fontSizes.sm,
    marginBottom: space.xl,
    textAlign: 'center',
  },
  emptyTitle: {
    color: colors.ink700,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    marginBottom: space.sm,
    textAlign: 'center',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: space.lg,
  },
  listContent: {
    gap: space.md,
    paddingBottom: space['2xl'],
  },
  skeletonList: {
    gap: space.md,
  },
  title: {
    color: colors.ink900,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
  },
});

export default ReceiptListScreen;
