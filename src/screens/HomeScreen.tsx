import * as React from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '../components/AppButton';
import type {
  ReceiptUploadLaunchMode,
  RootStackParamList,
} from '../navigation/RootNavigator';
import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens';

// ── Nav card data ────────────────────────────────────────────────────────────

const destinations: Array<{
  route: keyof Omit<RootStackParamList, 'Home'>;
  testID: string;
  title: string;
  subtitle: string;
  icon: string;
  primary?: boolean;
}> = [
  {
    route: 'ReceiptUpload',
    testID: 'nav-receipt-upload',
    title: '영수증 올리기',
    subtitle: '사진으로 포인트 적립',
    icon: '📷',
    primary: true,
  },
  {
    route: 'ReceiptList',
    testID: 'nav-receipt-list',
    title: '내 영수증',
    subtitle: '등록된 영수증 목록',
    icon: '📋',
  },
  {
    route: 'Survey',
    testID: 'nav-survey',
    title: '설문 참여',
    subtitle: '답하고 포인트 획득',
    icon: '📝',
  },
  {
    route: 'RewardResult',
    testID: 'nav-reward-result',
    title: '리워드 결과',
    subtitle: '포인트 내역 확인',
    icon: '🎁',
  },
];

// ── BounceCard ───────────────────────────────────────────────────────────────

function BounceCard({
  children,
  onPress,
  style,
  testID,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: object;
  testID?: string;
}) {
  const [scale] = React.useState(() => new Animated.Value(1));

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
            damping: 10,
            stiffness: 300,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            damping: 10,
            stiffness: 300,
          }).start()
        }
        style={[styles.navCard, ...(style ? [] : [])]}
        testID={testID}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ── ScanGuideIllustration ────────────────────────────────────────────────────

function ScanGuideIllustration() {
  return (
    <View style={illustrationStyles.wrapper}>
      <View style={illustrationStyles.paper}>
        {/* Corner markers */}
        <View
          style={[illustrationStyles.corner, illustrationStyles.cornerTL]}
        />
        <View
          style={[illustrationStyles.corner, illustrationStyles.cornerTR]}
        />
        <View
          style={[illustrationStyles.corner, illustrationStyles.cornerBL]}
        />
        <View
          style={[illustrationStyles.corner, illustrationStyles.cornerBR]}
        />

        {/* Header */}
        <View style={illustrationStyles.header}>
          <Text style={illustrationStyles.storeName}>YG Market</Text>
          <Text style={illustrationStyles.date}>2026/04/04</Text>
        </View>
        <View style={illustrationStyles.divider} />

        {/* Highlight scan band */}
        <View style={illustrationStyles.highlightBand} />

        {/* Mock line items */}
        <View style={illustrationStyles.lines}>
          <View style={illustrationStyles.line} />
          <View
            style={[illustrationStyles.line, illustrationStyles.lineShort]}
          />
          <View
            style={[illustrationStyles.line, illustrationStyles.lineMedium]}
          />
        </View>
      </View>
    </View>
  );
}

const illustrationStyles = StyleSheet.create({
  corner: {
    borderColor: colors.primary500,
    height: 16,
    position: 'absolute',
    width: 16,
  },
  cornerBL: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    bottom: 10,
    left: 10,
  },
  cornerBR: {
    borderBottomWidth: 2,
    borderRightWidth: 2,
    bottom: 10,
    right: 10,
  },
  cornerTL: {
    borderLeftWidth: 2,
    borderTopWidth: 2,
    left: 10,
    top: 10,
  },
  cornerTR: {
    borderRightWidth: 2,
    borderTopWidth: 2,
    right: 10,
    top: 10,
  },
  date: {
    color: colors.ink500,
    fontSize: 11,
    fontWeight: fontWeights.semibold,
  },
  divider: {
    backgroundColor: colors.ink300,
    height: 1,
    marginTop: space.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  highlightBand: {
    backgroundColor: colors.lavender200,
    borderRadius: 18,
    height: 40,
    left: 0,
    opacity: 0.7,
    position: 'absolute',
    right: 0,
    top: 56,
  },
  line: {
    backgroundColor: colors.ink300,
    borderRadius: radii.full,
    height: 6,
    width: '100%',
  },
  lineMedium: {
    width: '72%',
  },
  lineShort: {
    width: '56%',
  },
  lines: {
    gap: space.md,
    marginTop: space.xl,
  },
  paper: {
    backgroundColor: '#fdfcf9',
    borderRadius: radii.md,
    minHeight: 148,
    overflow: 'hidden',
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    shadowColor: colors.ink500,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    transform: [{ rotate: '2deg' }],
  },
  storeName: {
    color: colors.ink900,
    fontSize: 12,
    fontWeight: fontWeights.extrabold,
  },
  wrapper: {
    backgroundColor: colors.lavender200,
    borderRadius: radii.lg,
    paddingHorizontal: space.xl,
    paddingVertical: space.lg,
    marginVertical: space.lg,
  },
});

// ── HomeScreen ───────────────────────────────────────────────────────────────

function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isUploadSheetVisible, setUploadSheetVisible] = React.useState(false);
  const [isScannerGuideVisible, setScannerGuideVisible] = React.useState(false);

  const navigateToUpload = React.useCallback(
    (launchMode: ReceiptUploadLaunchMode) => {
      setUploadSheetVisible(false);
      setScannerGuideVisible(false);
      navigation.navigate('ReceiptUpload', {
        autoStart: true,
        launchMode,
      });
    },
    [navigation],
  );

  const openUploadSheet = React.useCallback(() => {
    setScannerGuideVisible(false);
    setUploadSheetVisible(true);
  }, []);

  const openScannerGuide = React.useCallback(() => {
    setUploadSheetVisible(false);
    setScannerGuideVisible(true);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        testID="screen-home"
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🧾</Text>
          <Text style={styles.appName} testID="screen-home-title">
            Receipt Club
          </Text>
          <Text style={styles.appSubtitle}>
            영수증을 올리고 포인트를 모아보세요
          </Text>
        </View>

        {/* 2x2 nav grid */}
        <View style={styles.grid}>
          {destinations.map(dest => (
            <BounceCard
              key={dest.route}
              onPress={() => {
                if (dest.route === 'ReceiptUpload') {
                  openUploadSheet();
                  return;
                }
                navigation.navigate(dest.route);
              }}
              style={styles.navCardWrapper}
              testID={dest.testID}
            >
              <View
                style={[styles.navCard, dest.primary && styles.navCardPrimary]}
              >
                <Text style={styles.navCardIcon}>{dest.icon}</Text>
                <Text
                  style={[
                    styles.navCardTitle,
                    dest.primary && styles.navCardTitleLight,
                  ]}
                >
                  {dest.title}
                </Text>
                <Text
                  style={[
                    styles.navCardSubtitle,
                    dest.primary && styles.navCardSubtitleLight,
                  ]}
                >
                  {dest.subtitle}
                </Text>
              </View>
            </BounceCard>
          ))}
        </View>
      </ScrollView>

      {/* ── Upload Sheet Modal ── */}
      <Modal
        animationType="slide"
        onRequestClose={() => setUploadSheetVisible(false)}
        transparent
        visible={isUploadSheetVisible}
      >
        <Pressable
          onPress={() => setUploadSheetVisible(false)}
          style={styles.sheetOverlay}
          testID="upload-sheet-overlay"
        >
          <Pressable
            onPress={() => {}}
            style={styles.sheet}
            testID="upload-source-sheet"
          >
            {/* Drag handle */}
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetEyebrow}>영수증 업로드</Text>
            <Text style={styles.sheetTitle}>어떻게 시작할까요?</Text>

            <View style={styles.sourceList}>
              {/* Gallery option */}
              <View style={styles.sourceRow}>
                <View style={styles.sourceBadge}>
                  <Text style={styles.sourceBadgeIcon}>🖼️</Text>
                </View>
                <View style={styles.sourceTextGroup}>
                  <Text style={styles.sourceTitle}>저장된 영수증 사진</Text>
                  <Text style={styles.sourceDescription}>
                    사진 라이브러리에서 영수증 이미지를 가져오세요.
                  </Text>
                </View>
                <AppButton
                  onPress={() => navigateToUpload('library')}
                  size="sm"
                  testID="upload-source-library"
                  title="갤러리"
                  variant="secondary"
                />
              </View>

              {/* Camera option */}
              <View style={[styles.sourceRow, styles.sourceRowHighlighted]}>
                <View style={styles.sourceBadge}>
                  <Text style={styles.sourceBadgeIcon}>📷</Text>
                </View>
                <View style={styles.sourceTextGroup}>
                  <Text style={styles.sourceTitle}>카메라로 스캔</Text>
                  <Text style={styles.sourceDescription}>
                    VisionKit으로 영수증을 스캔하고 업로드하세요.
                  </Text>
                </View>
                <AppButton
                  onPress={openScannerGuide}
                  size="sm"
                  testID="upload-source-camera"
                  title="카메라"
                  variant="primary"
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Scanner Guide Modal ── */}
      <Modal
        animationType="fade"
        onRequestClose={() => setScannerGuideVisible(false)}
        transparent
        visible={isScannerGuideVisible}
      >
        <View style={styles.guideOverlay} testID="scanner-guide-overlay">
          <View style={styles.guideCard} testID="scanner-guide-modal">
            {/* Close button */}
            <Pressable
              accessibilityRole="button"
              onPress={() => setScannerGuideVisible(false)}
              style={styles.closeButton}
              testID="scanner-guide-close"
            >
              <Text style={styles.closeButtonLabel}>✕</Text>
            </Pressable>

            <Text style={styles.guideTitle}>영수증을 명확하게 스캔하세요</Text>
            <Text style={styles.guideDescription}>
              한 장씩 촬영하고, 스캔 전에 페이지를 검토·자르기·회전할 수 있어요.
            </Text>

            <ScanGuideIllustration />

            <Text style={styles.guideFootnote}>
              해외 영수증은 현재 프로토타입에서 제외됩니다.
            </Text>

            <AppButton
              onPress={() => navigateToUpload('camera')}
              size="lg"
              testID="scanner-guide-start"
              title="스캔 시작"
              variant="primary"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appName: {
    color: colors.ink900,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.extrabold,
    marginTop: space.sm,
    textAlign: 'center',
  },
  appSubtitle: {
    color: colors.ink500,
    fontSize: fontSizes.md,
    marginTop: space.xs,
    textAlign: 'center',
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: colors.ink100,
    borderRadius: radii.full,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  closeButtonLabel: {
    color: colors.ink500,
    fontSize: 16,
    fontWeight: fontWeights.semibold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    marginTop: space.xl,
  },
  guideCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    maxWidth: 360,
    padding: space.xl,
    width: '100%',
  },
  guideDescription: {
    color: colors.ink500,
    fontSize: fontSizes.sm,
    lineHeight: 22,
    marginTop: space.sm,
    textAlign: 'center',
  },
  guideFootnote: {
    color: colors.ink500,
    fontSize: fontSizes.xs,
    lineHeight: 18,
    marginBottom: space.lg,
    textAlign: 'center',
  },
  guideOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: space.xl,
  },
  guideTitle: {
    color: colors.ink900,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
    marginTop: space.sm,
    textAlign: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: space['2xl'],
  },
  heroIcon: {
    fontSize: 56,
  },
  navCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    minHeight: 140,
    padding: space.lg,
    shadowColor: colors.ink500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  navCardIcon: {
    fontSize: 36,
    marginBottom: space.sm,
  },
  navCardPrimary: {
    backgroundColor: colors.primary500,
  },
  navCardSubtitle: {
    color: colors.ink500,
    fontSize: fontSizes.xs,
    lineHeight: 18,
    marginTop: space.xs,
  },
  navCardSubtitleLight: {
    color: 'rgba(255,255,255,0.75)',
  },
  navCardTitle: {
    color: colors.ink900,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  navCardTitleLight: {
    color: colors.surface,
  },
  navCardWrapper: {
    width: '47.5%',
  },
  safe: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
  scroll: {
    paddingHorizontal: space.xl,
    paddingBottom: space['3xl'],
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: space.xl,
  },
  sheetDescription: {
    color: colors.ink500,
    fontSize: fontSizes.sm,
    lineHeight: 22,
    marginTop: space.sm,
  },
  sheetEyebrow: {
    color: colors.primary500,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: colors.ink300,
    borderRadius: radii.full,
    height: 5,
    marginBottom: space.lg,
    width: 52,
  },
  sheetOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: space.xl,
  },
  sheetTitle: {
    color: colors.ink900,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
    marginTop: space.sm,
  },
  sourceBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    height: 44,
    justifyContent: 'center',
    marginRight: space.md,
    width: 44,
  },
  sourceBadgeIcon: {
    fontSize: 22,
  },
  sourceDescription: {
    color: colors.ink500,
    fontSize: fontSizes.xs,
    lineHeight: 18,
    marginTop: 3,
  },
  sourceList: {
    gap: space.md,
    marginTop: space.xl,
  },
  sourceRow: {
    alignItems: 'center',
    backgroundColor: colors.ink100,
    borderRadius: radii.md,
    flexDirection: 'row',
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
  },
  sourceRowHighlighted: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary200,
    borderWidth: 1,
  },
  sourceTextGroup: {
    flex: 1,
    marginRight: space.sm,
  },
  sourceTitle: {
    color: colors.ink900,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
});

export default HomeScreen;
