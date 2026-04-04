import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
          style={styles.overlay}
          testID="upload-sheet-overlay"
        >
          <Pressable
            onPress={() => {}}
            style={styles.sheet}
            testID="upload-source-sheet"
          >
            <Text style={styles.sheetTitle}>Choose receipt source</Text>
            <Text style={styles.sheetDescription}>
              Start with the camera scanner or import a saved receipt photo.
            </Text>
            <View style={styles.sheetButtonGroup}>
              <Pressable
                onPress={() => navigateToUpload('library')}
                style={[styles.sheetButton, styles.secondaryButton]}
                testID="upload-source-library"
              >
                <Text style={styles.secondaryButtonText}>Gallery</Text>
              </Pressable>
              <Pressable
                onPress={openScannerGuide}
                style={[styles.sheetButton, styles.primaryButton]}
                testID="upload-source-camera"
              >
                <Text style={styles.primaryButtonText}>Camera</Text>
              </Pressable>
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
        <View style={styles.overlay} testID="scanner-guide-overlay">
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
              Capture one full receipt per shot. You can review and retake pages
              in the system scanner before upload.
            </Text>
            <View style={styles.guidePreview}>
              <View style={styles.guidePreviewPaper}>
                <View style={styles.guideHighlight} />
              </View>
            </View>
            <Text style={styles.guideFootnote}>
              Overseas receipts are not eligible for points in this prototype.
            </Text>
            <Pressable
              onPress={() => navigateToUpload('camera')}
              style={[styles.sheetButton, styles.primaryButton]}
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
  guideHighlight: {
    alignSelf: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.28)',
    borderRadius: 18,
    height: 56,
    marginTop: 34,
    width: '88%',
  },
  guidePreview: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 18,
  },
  guidePreviewPaper: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    height: 136,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  guideTitle: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
    marginTop: 8,
    textAlign: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  primaryButton: {
    backgroundColor: '#8b1cf7',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
  },
  sheetButton: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  sheetButtonGroup: {
    gap: 12,
    marginTop: 24,
  },
  sheetDescription: {
    color: '#6b7280',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  sheetTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default HomeScreen;
