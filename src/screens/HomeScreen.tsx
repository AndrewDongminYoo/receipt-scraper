import * as React from 'react';
import { Button, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type {
  ReceiptUploadLaunchMode,
  RootStackParamList,
} from '../navigation/RootNavigator';

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
  {
    route: 'ReceiptList',
    testID: 'nav-receipt-list',
    title: 'Receipt List',
  },
  {
    route: 'Survey',
    testID: 'nav-survey',
    title: 'Survey',
  },
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
    <View style={styles.container} testID="screen-home">
      <Text style={styles.title} testID="screen-home-title">
        Home
      </Text>
      <Text style={styles.description}>
        Choose a destination to preview the current practice app flow.
      </Text>
      <View style={styles.buttonGroup}>
        {destinations.map(destination => (
          <View key={destination.route} style={styles.buttonWrapper}>
            <Button
              onPress={() => {
                if (destination.route === 'ReceiptUpload') {
                  openUploadSheet();
                  return;
                }

                navigation.navigate(destination.route);
              }}
              testID={destination.testID}
              title={destination.title}
            />
          </View>
        ))}
      </View>

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
            <Text style={styles.sheetEyebrow}>Receipt upload</Text>
            <Text style={styles.sheetTitle}>Choose how to start</Text>
            <Text style={styles.sheetDescription}>
              Use the iOS document scanner first, or bring in a receipt you
              already saved.
            </Text>
            <View style={styles.sourceList}>
              <View style={styles.sourceRow}>
                <View style={styles.sourceCopyGroup}>
                  <View style={[styles.sourceBadge, styles.galleryBadge]} />
                  <View style={styles.sourceTextGroup}>
                    <Text style={styles.sourceTitle}>Saved receipt photo</Text>
                    <Text style={styles.sourceDescription}>
                      Import a receipt image from the photo library.
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => navigateToUpload('library')}
                  style={[styles.sourceAction, styles.primaryButton]}
                  testID="upload-source-library"
                >
                  <Text style={styles.primaryButtonText}>Gallery</Text>
                </Pressable>
              </View>

              <View style={styles.sourceRow}>
                <View style={styles.sourceCopyGroup}>
                  <View style={[styles.sourceBadge, styles.cameraBadge]} />
                  <View style={styles.sourceTextGroup}>
                    <Text style={styles.sourceTitle}>Scan with camera</Text>
                    <Text style={styles.sourceDescription}>
                      Open VisionKit and review pages before upload.
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={openScannerGuide}
                  style={[styles.sourceAction, styles.primaryButton]}
                  testID="upload-source-camera"
                >
                  <Text style={styles.primaryButtonText}>Camera</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
              <Text style={styles.closeButtonLabel}>x</Text>
            </Pressable>
            <Text style={styles.guideTitle}>Scan the receipt clearly</Text>
            <Text style={styles.guideDescription}>
              Capture one receipt per shot. You can review, crop, rotate, and
              retake pages in the system scanner before upload.
            </Text>
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
                    <View
                      style={[
                        styles.guideReceiptLine,
                        styles.guideReceiptLineShort,
                      ]}
                    />
                    <View
                      style={[
                        styles.guideReceiptLine,
                        styles.guideReceiptLineMedium,
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.guideFootnote}>
              Overseas receipts are excluded in this prototype flow.
            </Text>
            <Pressable
              onPress={() => navigateToUpload('camera')}
              style={[styles.ctaButton, styles.primaryButton]}
              testID="scanner-guide-start"
            >
              <Text style={styles.primaryButtonText}>Start scan</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    gap: 12,
  },
  buttonWrapper: {
    width: '100%',
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeButtonLabel: {
    color: '#6b7280',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  description: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  guideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    maxWidth: 360,
    padding: 24,
    width: '100%',
  },
  guideDescription: {
    color: '#6b7280',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  guideFootnote: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  guideOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
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
    backgroundColor: '#eef2ff',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    width: '100%',
  },
  guideReceiptDate: {
    color: '#4b5563',
    fontSize: 11,
    fontWeight: '600',
  },
  guideReceiptDivider: {
    backgroundColor: '#d1d5db',
    height: 1,
    marginTop: 10,
  },
  guideReceiptHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  guideReceiptHighlightBand: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 18,
    height: 44,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 18,
  },
  guideReceiptLine: {
    backgroundColor: '#9ca3af',
    borderRadius: 999,
    height: 6,
    width: '100%',
  },
  guideReceiptLineGroup: {
    gap: 12,
    marginTop: 22,
    position: 'relative',
  },
  guideReceiptLineMedium: {
    width: '72%',
  },
  guideReceiptLineShort: {
    width: '56%',
  },
  guideReceiptPaper: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    minHeight: 148,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#cbd5e1',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
  guideReceiptStore: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
  guideTitle: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
    marginTop: 8,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#8b1cf7',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cameraBadge: {
    backgroundColor: '#e0f2fe',
  },
  ctaButton: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    width: '100%',
  },
  galleryBadge: {
    backgroundColor: '#ede9fe',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
  },
  sheetDescription: {
    color: '#6b7280',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  sheetEyebrow: {
    color: '#8b5cf6',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: '#d1d5db',
    borderRadius: 999,
    height: 5,
    marginBottom: 18,
    width: 52,
  },
  sheetOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  sheetTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  sourceAction: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 104,
    paddingHorizontal: 18,
  },
  sourceBadge: {
    borderRadius: 14,
    height: 42,
    width: 42,
  },
  sourceCopyGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    marginRight: 12,
  },
  sourceDescription: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  sourceList: {
    gap: 12,
    marginTop: 24,
  },
  sourceRow: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 22,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sourceTextGroup: {
    flex: 1,
  },
  sourceTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default HomeScreen;
