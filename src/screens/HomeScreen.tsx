import * as React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import type {
  ReceiptUploadLaunchMode,
  RootStackParamList,
} from '../navigation/RootNavigator';

const EMOJIS: Record<string, string> = {
  ReceiptList: '📋',
  ReceiptUpload: '📷',
  RewardResult: '🎁',
  Survey: '📝',
};

const destinations: Array<{
  route: keyof Omit<RootStackParamList, 'Home'>;
  testID: string;
  title: string;
}> = [
  {
    route: 'ReceiptUpload',
    testID: 'nav-receipt-upload',
    title: 'Upload Receipt',
  },
  { route: 'ReceiptList', testID: 'nav-receipt-list', title: 'Receipt List' },
  { route: 'Survey', testID: 'nav-survey', title: 'Survey' },
  {
    route: 'RewardResult',
    testID: 'nav-reward-result',
    title: 'Reward Result',
  },
];

function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isUploadSheetVisible, setUploadSheetVisible] = React.useState(false);
  const [isScannerGuideVisible, setScannerGuideVisible] = React.useState(false);

  const navigateToUpload = React.useCallback(
    (launchMode: ReceiptUploadLaunchMode) => {
      setUploadSheetVisible(false);
      setScannerGuideVisible(false);
      navigation.navigate('ReceiptUpload', { autoStart: true, launchMode });
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
    <View style={styles.container} testID="screen-home">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🧾</Text>
        <Text style={styles.appName}>Receipt Club</Text>
        <Text style={styles.subtitle}>
          Upload receipts and collect your points
        </Text>
      </View>

      {/* Hidden accessible title for navigation/testing */}
      <Text style={styles.sectionTitle} testID="screen-home-title">
        Home
      </Text>

      {/* Nav cards grid */}
      <View style={styles.grid}>
        {destinations.map(dest => (
          <Pressable
            key={dest.route}
            onPress={() => {
              if (dest.route === 'ReceiptUpload') {
                openUploadSheet();
                return;
              }
              navigation.navigate(dest.route);
            }}
            style={({ pressed }) => [
              styles.card,
              dest.route === 'ReceiptUpload' && styles.cardPrimary,
              pressed && styles.cardPressed,
            ]}
            testID={dest.testID}
          >
            <Text style={styles.cardEmoji}>{EMOJIS[dest.route]}</Text>
            <Text
              style={[
                styles.cardTitle,
                dest.route === 'ReceiptUpload' && styles.cardTitleLight,
              ]}
            >
              {dest.title}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Upload source sheet */}
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
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>How would you like to start?</Text>
            <Text style={styles.sheetDescription}>
              Use the device scanner or pick an existing receipt photo.
            </Text>
            <View style={styles.sourceList}>
              {/* Gallery option */}
              <View style={styles.sourceRow}>
                <View style={styles.sourceCopyGroup}>
                  <Text style={styles.sourceEmoji}>🖼️</Text>
                  <View style={styles.sourceTextGroup}>
                    <Text style={styles.sourceTitle}>Saved receipt photo</Text>
                    <Text style={styles.sourceDesc}>
                      Import from photo library.
                    </Text>
                  </View>
                </View>
                <AppButton
                  onPress={() => navigateToUpload('library')}
                  size="sm"
                  testID="upload-source-library"
                  variant="ghost"
                >
                  Gallery
                </AppButton>
              </View>

              {/* Camera option */}
              <View style={[styles.sourceRow, styles.sourceRowHighlight]}>
                <View style={styles.sourceCopyGroup}>
                  <Text style={styles.sourceEmoji}>📷</Text>
                  <View style={styles.sourceTextGroup}>
                    <Text style={styles.sourceTitle}>Scan with camera</Text>
                    <Text style={styles.sourceDesc}>
                      Review pages before upload.
                    </Text>
                  </View>
                </View>
                <AppButton
                  onPress={openScannerGuide}
                  size="sm"
                  testID="upload-source-camera"
                  variant="primary"
                >
                  Camera
                </AppButton>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Scanner guide modal */}
      <Modal
        animationType="fade"
        onRequestClose={() => setScannerGuideVisible(false)}
        transparent
        visible={isScannerGuideVisible}
      >
        <View style={styles.guideOverlay} testID="scanner-guide-overlay">
          <View style={styles.guideCard} testID="scanner-guide-modal">
            <Pressable
              accessibilityRole="button"
              onPress={() => setScannerGuideVisible(false)}
              style={styles.closeButton}
              testID="scanner-guide-close"
            >
              <Text style={styles.closeButtonLabel}>✕</Text>
            </Pressable>
            <Text style={styles.guideTitle}>Scan the receipt clearly</Text>
            <Text style={styles.guideDescription}>
              Capture one receipt per shot. You can review and retake pages
              before upload.
            </Text>
            {/* Receipt preview illustration */}
            <View style={styles.guidePreview}>
              <View style={styles.guidePreviewFrame}>
                <View style={styles.guideReceiptPaper}>
                  <View style={styles.guideReceiptHeader}>
                    <Text style={styles.guideReceiptStore}>YG Market</Text>
                    <Text style={styles.guideReceiptDate}>2026/04/04</Text>
                  </View>
                  <View style={styles.guideReceiptDivider} />
                  <View style={styles.guideReceiptHighlightBand} />
                  <View style={styles.guideReceiptLineGroup}>
                    <View style={styles.guideReceiptLine} />
                    <View style={[styles.guideReceiptLine, styles.lineShort]} />
                    <View
                      style={[styles.guideReceiptLine, styles.lineMedium]}
                    />
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.guideFootnote}>
              Overseas receipts are excluded in this prototype flow.
            </Text>
            <AppButton
              onPress={() => navigateToUpload('camera')}
              style={styles.ctaButton}
              testID="scanner-guide-start"
              variant="primary"
            >
              Start scan
            </AppButton>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  appName: {
    color: '#1c1c1c',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 6,
    textAlign: 'center',
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#fcfbf8',
    borderColor: '#eceae4',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 100,
    padding: 16,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardPressed: {
    opacity: 0.75,
  },
  cardPrimary: {
    backgroundColor: '#1c1c1c',
    borderColor: 'rgba(0, 0, 0, 0.35)',
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardTitle: {
    color: '#1c1c1c',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardTitleLight: {
    color: '#fcfbf8',
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(28, 28, 28, 0.06)',
    borderRadius: 9999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeButtonLabel: {
    color: '#5f5f5d',
    fontSize: 15,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#f7f4ed',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  ctaButton: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  guideCard: {
    backgroundColor: '#fcfbf8',
    borderColor: '#eceae4',
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 360,
    padding: 24,
    width: '100%',
  },
  guideDescription: {
    color: '#5f5f5d',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  guideFootnote: {
    color: 'rgba(28, 28, 28, 0.4)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  guideOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 28, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  guidePreview: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 18,
  },
  guidePreviewFrame: {
    backgroundColor: 'rgba(28, 28, 28, 0.04)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    width: '100%',
  },
  guideReceiptDate: {
    color: '#5f5f5d',
    fontSize: 11,
    fontWeight: '600',
  },
  guideReceiptDivider: {
    backgroundColor: '#eceae4',
    height: 1,
    marginTop: 10,
  },
  guideReceiptHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  guideReceiptHighlightBand: {
    backgroundColor: 'rgba(28, 28, 28, 0.06)',
    borderRadius: 8,
    height: 44,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 18,
  },
  guideReceiptLine: {
    backgroundColor: '#eceae4',
    borderRadius: 999,
    height: 6,
    width: '100%',
  },
  guideReceiptLineGroup: {
    gap: 12,
    marginTop: 22,
    position: 'relative',
  },
  guideReceiptPaper: {
    backgroundColor: '#fcfbf8',
    borderColor: '#eceae4',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 148,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  guideReceiptStore: {
    color: '#1c1c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  guideTitle: {
    color: '#1c1c1c',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  lineMedium: { width: '72%' },
  lineShort: { width: '56%' },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  sheet: {
    backgroundColor: '#fcfbf8',
    borderColor: '#eceae4',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  sheetDescription: {
    color: '#5f5f5d',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: '#eceae4',
    borderRadius: 9999,
    height: 4,
    marginBottom: 18,
    width: 48,
  },
  sheetOverlay: {
    backgroundColor: 'rgba(28, 28, 28, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  sheetTitle: {
    color: '#1c1c1c',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  sourceDesc: {
    color: '#5f5f5d',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  sourceEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  sourceCopyGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: 12,
  },
  sourceList: {
    gap: 10,
    marginTop: 20,
  },
  sourceRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 28, 0.03)',
    borderColor: '#eceae4',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sourceRowHighlight: {
    borderColor: 'rgba(28, 28, 28, 0.4)',
  },
  sourceTextGroup: {
    flex: 1,
  },
  sourceTitle: {
    color: '#1c1c1c',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#1c1c1c',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    opacity: 0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#5f5f5d',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default HomeScreen;
