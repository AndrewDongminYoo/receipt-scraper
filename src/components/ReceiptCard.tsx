import * as React from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens';
import type { ReceiptItem } from '../types/receipt';
import { formatTimestamp } from '../utils/formatTimestamp';

type StatusBadgeVariant = 'approved' | 'pending' | 'failed';

function StatusBadge({ status }: { status: string }) {
  const variant: StatusBadgeVariant =
    status === 'approved'
      ? 'approved'
      : status === 'pending'
        ? 'pending'
        : 'failed';

  const label =
    variant === 'approved' ? 'Approved' : variant === 'pending' ? 'Pending' : 'Failed';

  return (
    <View style={[styles.statusBadge, statusBadgeStyles[variant]]}>
      <Text style={[styles.statusBadgeText, statusTextStyles[variant]]}>{label}</Text>
    </View>
  );
}

interface ReceiptCardProps {
  item: ReceiptItem;
  testID?: string;
}

function ReceiptCard({ item, testID }: ReceiptCardProps) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const [expanded, setExpanded] = React.useState(false);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 1.02,
      useNativeDriver: true,
      damping: 10,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 10,
      stiffness: 300,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <Pressable
        onPress={() => setExpanded(prev => !prev)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
        testID={testID}
      >
        {/* Perforated top edge */}
        <View style={styles.perforationRow}>
          <View style={styles.perforation} />
          <View style={styles.perfDashContainer}>
            {Array.from({ length: 18 }).map((_, i) => (
              <View key={i} style={styles.perfDash} />
            ))}
          </View>
          <View style={styles.perforation} />
        </View>

        {/* Card body */}
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text style={styles.storeName} numberOfLines={1}>
              {item.storeName || item.fileName || 'Unknown store'}
            </Text>
            <StatusBadge status={item.status} />
          </View>

          {item.extractedMetadata?.totalAmount ? (
            <Text style={styles.amount}>{item.extractedMetadata.totalAmount}</Text>
          ) : null}

          <Text style={styles.date}>{formatTimestamp(item.purchasedAt)}</Text>

          {expanded && item.ocrText ? (
            <View style={styles.ocrSection}>
              <View style={styles.divider} />
              <Text style={styles.ocrLabel}>OCR 원문</Text>
              <Text style={styles.ocrText}>{item.ocrText}</Text>
            </View>
          ) : null}

          {item.ocrText ? (
            <Text style={styles.toggleHint}>
              {expanded ? '접기 ▲' : 'OCR 원문 보기 ▼'}
            </Text>
          ) : null}
        </View>

        {/* Jagged receipt bottom */}
        <View style={styles.jaggedRow}>
          {Array.from({ length: 24 }).map((_, i) => (
            <View
              key={i}
              style={[styles.jaggedTooth, i % 2 === 0 ? styles.jaggedToothUp : styles.jaggedToothDown]}
            />
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  amount: {
    color: colors.gold500,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    marginTop: space.xs,
  },
  body: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  card: {
    backgroundColor: '#FDFCF9',
    borderRadius: radii.md,
    overflow: 'hidden',
    shadowColor: colors.ink500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  date: {
    color: colors.ink500,
    fontSize: fontSizes.xs,
    marginTop: space.xs,
  },
  divider: {
    backgroundColor: colors.ink300,
    height: 1,
    marginBottom: space.sm,
    marginTop: space.sm,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jaggedRow: {
    flexDirection: 'row',
    height: 10,
    overflow: 'hidden',
  },
  jaggedTooth: {
    flex: 1,
  },
  jaggedToothDown: {
    backgroundColor: '#FDFCF9',
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5,
    height: 10,
    marginTop: 0,
  },
  jaggedToothUp: {
    backgroundColor: colors.canvas,
    borderTopEndRadius: 5,
    borderTopStartRadius: 5,
    height: 10,
  },
  ocrLabel: {
    color: colors.ink500,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    marginBottom: space.xs,
  },
  ocrSection: {
    marginTop: space.sm,
  },
  ocrText: {
    color: colors.ink700,
    fontFamily: 'Courier',
    fontSize: 11,
    lineHeight: 16,
  },
  perfDash: {
    backgroundColor: colors.ink300,
    height: 1,
    width: 6,
  },
  perfDashContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  perforation: {
    backgroundColor: colors.canvas,
    borderRadius: radii.full,
    height: 16,
    width: 16,
    marginTop: -8,
  },
  perforationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: space.sm,
  },
  statusBadge: {
    borderRadius: radii.full,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  statusBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
  storeName: {
    color: colors.ink900,
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.extrabold,
    marginRight: space.sm,
  },
  toggleHint: {
    color: colors.ink500,
    fontSize: fontSizes.xs,
    marginTop: space.sm,
  },
});

const statusBadgeStyles = StyleSheet.create({
  approved: {
    backgroundColor: colors.successBg,
  },
  failed: {
    backgroundColor: colors.errorBg,
  },
  pending: {
    backgroundColor: colors.gold300,
  },
});

const statusTextStyles = StyleSheet.create({
  approved: {
    color: colors.successText,
  },
  failed: {
    color: colors.errorText,
  },
  pending: {
    color: colors.ink700,
  },
});

export default ReceiptCard;
