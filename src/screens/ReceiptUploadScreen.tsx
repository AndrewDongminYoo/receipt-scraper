import * as React from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type {
  Asset,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DocumentScanner, {
  ResponseType,
  ScanDocumentResponseStatus,
} from 'react-native-document-scanner-plugin';
import {
  Button,
  Image,
  NativeModules,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  receiptQueryKeys,
  uploadReceipt,
  type UploadReceiptParams,
} from '../api/receipts';
import { recognizeReceiptText, type OcrResult } from '../api/ocr';
import type {
  ReceiptUploadLaunchMode,
  RootStackParamList,
} from '../navigation/RootNavigator';
import {
  getUseLibraryPicker,
  setUseLibraryPicker,
} from '../utils/featureFlags';
import ScreenHeader from '../components/ScreenHeader';
import SectionCard from '../components/SectionCard';
import StateCard from '../components/StateCard';

const cameraOptions: CameraOptions = {
  mediaType: 'photo',
  quality: 0.8,
  saveToPhotos: false,
};

const imageLibraryOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
  selectionLimit: 1,
};

const PRICE_PATTERN = /\$\d+[.,]\d{2}|\d+[.,]\d{2}\s*(USD|GBP|EUR|KRW|JPY)?/i;
const RECEIPT_KEYWORD_PATTERN =
  /\b(total|subtotal|tax|gst|vat|receipt|invoice|cashier|transaction|qty|cash|card|visa|mastercard)\b/i;

function looksLikeReceipt(text: string): boolean {
  return PRICE_PATTERN.test(text) && RECEIPT_KEYWORD_PATTERN.test(text);
}

function formatFileSize(fileSize?: number) {
  if (!fileSize) {
    return 'Unknown size';
  }

  if (fileSize < 1024 * 1024) {
    return `${Math.round(fileSize / 1024)} KB`;
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
}

function getUploadErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      'Receipt upload failed. Please try again.'
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Receipt upload failed. Please try again.';
}

type CaptureFailureKind = 'cancelled' | 'ocr_failed' | 'wrong_type';

function createAssetFromUri(uri: string): Asset {
  const fileName =
    decodeURIComponent(uri).split('/').pop() || 'scanned-receipt.jpg';
  const extension = fileName.split('.').pop()?.toLowerCase();

  return {
    fileName,
    type:
      extension === 'png'
        ? 'image/png'
        : extension === 'heic' || extension === 'heif'
          ? 'image/heic'
          : 'image/jpeg',
    uri,
  };
}

function ReceiptUploadScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ReceiptUpload'>>();
  const queryClient = useQueryClient();
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);
  const [simulateFailure, setSimulateFailure] = React.useState(false);
  const [ocrText, setOcrText] = React.useState('');
  const [captureFailure, setCaptureFailure] =
    React.useState<CaptureFailureKind | null>(null);
  const [useLibraryPicker, setUseLibraryPickerState] = React.useState(false);

  React.useEffect(() => {
    getUseLibraryPicker().then(value => setUseLibraryPickerState(value));
  }, []);

  const uploadMutation = useMutation({
    mutationFn: (params: UploadReceiptParams) => uploadReceipt(params),
    onSuccess: () => {
      setSimulateFailure(false);
      queryClient.invalidateQueries({ queryKey: receiptQueryKeys.all });
    },
  });

  const isUploading = uploadMutation.isPending;

  const displayMessage = isUploading
    ? 'Uploading receipt...'
    : uploadMutation.isSuccess
      ? uploadMutation.data.message
      : uploadMutation.isError
        ? getUploadErrorMessage(uploadMutation.error)
        : selectedAsset && ocrText
          ? `Ready to upload ${selectedAsset.fileName || 'the captured receipt'}.`
          : 'Capture a receipt using the camera to start the upload flow.';

  const captureWithDocumentScanner =
    React.useCallback(async (): Promise<Asset | null> => {
      try {
        const scanned = await DocumentScanner.scanDocument({
          croppedImageQuality: 95,
          responseType: ResponseType.ImageFilePath,
        });

        if (
          scanned.status === ScanDocumentResponseStatus.Cancel ||
          !scanned.scannedImages?.length
        ) {
          return null;
        }

        return createAssetFromUri(scanned.scannedImages[0]);
      } catch {
        return null;
      }
    }, []);

  const handleCaptureReceipt = React.useCallback(
    async (launchModeOverride?: ReceiptUploadLaunchMode) => {
      setCaptureFailure(null);
      uploadMutation.reset();
      setOcrText('');

      let nextAsset: Asset;
      const shouldUseLibrary =
        launchModeOverride === 'library' ||
        (launchModeOverride === undefined && useLibraryPicker);

      if (shouldUseLibrary) {
        const result = await launchImageLibrary(imageLibraryOptions);

        if (result.didCancel) {
          return;
        }

        if (result.errorCode || !result.assets?.[0]?.uri) {
          setCaptureFailure('cancelled');
          return;
        }

        nextAsset = result.assets[0];
      } else {
        if (Platform.OS === 'ios') {
          const scannedAsset = await captureWithDocumentScanner();

          if (scannedAsset) {
            nextAsset = scannedAsset;
          } else {
            const fallbackResult = await launchCamera(cameraOptions);

            if (fallbackResult.didCancel) {
              return;
            }

            if (fallbackResult.errorCode || !fallbackResult.assets?.[0]?.uri) {
              setCaptureFailure('cancelled');
              return;
            }

            nextAsset = fallbackResult.assets[0];
          }
        } else {
          const result = await launchCamera(cameraOptions);

          if (result.didCancel) {
            return;
          }

          if (result.errorCode || !result.assets?.[0]?.uri) {
            setCaptureFailure('cancelled');
            return;
          }

          nextAsset = result.assets[0];
        }
      }

      setSelectedAsset(nextAsset);

      let recognition: OcrResult;
      try {
        recognition = await recognizeReceiptText(nextAsset.uri!);
      } catch {
        setCaptureFailure('ocr_failed');
        return;
      }

      if (recognition.isEmpty) {
        setCaptureFailure('ocr_failed');
        return;
      }

      if (!looksLikeReceipt(recognition.text)) {
        setCaptureFailure('wrong_type');
        return;
      }

      setOcrText(recognition.text);
    },
    [captureWithDocumentScanner, uploadMutation, useLibraryPicker],
  );

  const didAutoStartRef = React.useRef(false);

  React.useEffect(() => {
    if (!route.params?.autoStart || didAutoStartRef.current) {
      return;
    }

    didAutoStartRef.current = true;
    handleCaptureReceipt(route.params.launchMode).then(() => undefined);
  }, [handleCaptureReceipt, route.params?.autoStart, route.params?.launchMode]);

  const handleUpload = (shouldFailOverride?: boolean) => {
    if (!selectedAsset || !ocrText || isUploading) {
      return;
    }

    uploadMutation.mutate({
      asset: selectedAsset,
      ocrText,
      captureDate: new Date().toISOString(),
      deviceLocale: NativeModules.I18nManager?.localeIdentifier ?? 'en-US',
      shouldFail: shouldFailOverride ?? simulateFailure,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      testID="screen-receipt-upload"
    >
      <ScreenHeader
        description="Capture a receipt with the camera, verify it with on-device OCR, then upload."
        title="Upload Receipt"
        titleTestID="screen-receipt-upload-title"
      />

      <SectionCard
        description="The image is captured via the device camera and verified with on-device OCR before upload."
        title="1. Capture a receipt"
      >
        <View style={styles.buttonGroup}>
          <View style={styles.buttonWrapper}>
            <Button
              disabled={isUploading}
              onPress={() => {
                handleCaptureReceipt().then(() => undefined);
              }}
              testID="pick-receipt-button"
              title="Capture Receipt"
            />
          </View>
          {__DEV__ ? (
            <View style={styles.buttonWrapper}>
              <Button
                title={`[DEV] Picker: ${useLibraryPicker ? 'Library' : 'Camera'}`}
                onPress={async () => {
                  const next = !useLibraryPicker;
                  await setUseLibraryPicker(next);
                  setUseLibraryPickerState(next);
                }}
                testID="dev-flag-toggle"
              />
            </View>
          ) : null}
        </View>
      </SectionCard>

      <SectionCard title="2. Preview the selected file">
        {selectedAsset?.uri ? (
          <>
            <Image
              source={{ uri: selectedAsset.uri }}
              style={styles.previewImage}
              testID="receipt-preview-image"
            />
            <Text style={styles.fileName} testID="receipt-file-name">
              {selectedAsset.fileName || 'Unnamed receipt'}
            </Text>
            <Text style={styles.metadata}>
              {selectedAsset.type || 'Unknown type'} ·{' '}
              {formatFileSize(selectedAsset.fileSize)}
            </Text>
          </>
        ) : (
          <View style={styles.emptyPreview} testID="receipt-preview-empty">
            <Text style={styles.emptyPreviewText}>
              No receipt captured yet.
            </Text>
          </View>
        )}
      </SectionCard>

      <SectionCard
        description="Toggle mock failure when you want to exercise retry handling without a real backend."
        title="3. Trigger the upload request"
      >
        <View style={styles.buttonGroup}>
          <View style={styles.buttonWrapper}>
            <Button
              disabled={!selectedAsset || !ocrText || isUploading}
              onPress={() =>
                setSimulateFailure(previousState => !previousState)
              }
              testID="simulate-failure-toggle"
              title={`Simulate Failure: ${simulateFailure ? 'On' : 'Off'}`}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              disabled={!selectedAsset || !ocrText || isUploading}
              onPress={() => handleUpload()}
              testID="upload-receipt-button"
              title={isUploading ? 'Uploading...' : 'Upload Receipt'}
            />
          </View>
          {uploadMutation.isError ? (
            <View style={styles.buttonWrapper}>
              <Button
                disabled={!selectedAsset || !ocrText || isUploading}
                onPress={() => handleUpload(false)}
                testID="retry-upload-button"
                title="Retry Upload"
              />
            </View>
          ) : null}
        </View>
      </SectionCard>

      {captureFailure === 'ocr_failed' ? (
        <StateCard
          variant="error"
          title="Couldn't read the receipt"
          message="We couldn't read the receipt. Try again in better lighting."
          testID="receipt-capture-failure-ocr"
        />
      ) : null}
      {captureFailure === 'wrong_type' ? (
        <StateCard
          variant="error"
          title="Wrong receipt type"
          message="Only grocery and supermarket receipts are accepted."
          testID="receipt-capture-failure-wrong-type"
        />
      ) : null}
      {captureFailure === 'cancelled' ? (
        <StateCard
          variant="error"
          title="Camera unavailable"
          message="Unable to access the camera. Check your permissions and try again."
          testID="receipt-capture-failure-cancelled"
        />
      ) : null}

      <StateCard
        message={displayMessage}
        showsActivityIndicator={isUploading}
        testID="receipt-upload-status"
        title="Upload status"
        variant={
          uploadMutation.isSuccess
            ? 'success'
            : uploadMutation.isError
              ? 'error'
              : 'info'
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    gap: 12,
  },
  buttonWrapper: {
    width: '100%',
  },
  contentContainer: {
    padding: 24,
  },
  emptyPreview: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 220,
    padding: 24,
  },
  emptyPreviewText: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
  },
  fileName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  metadata: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 6,
  },
  previewImage: {
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    height: 220,
    width: '100%',
  },
});

export default ReceiptUploadScreen;
