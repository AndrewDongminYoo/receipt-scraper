import * as React from 'react';
import {
  Image,
  NativeModules,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { type RouteProp, useRoute } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import DocumentScanner, {
  ResponseType,
  ScanDocumentResponseStatus,
} from 'react-native-document-scanner-plugin';
import type {
  Asset,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { type OcrResult, recognizeReceiptText } from '../api/ocr';
import {
  fetchReceipts,
  receiptQueryKeys,
  uploadReceipt,
  type UploadReceiptParams,
} from '../api/receipts';
import AppButton from '../components/AppButton';
import ScreenHeader from '../components/ScreenHeader';
import SectionCard from '../components/SectionCard';
import StateCard from '../components/StateCard';
import {
  extractReceiptMetadata,
  looksLikeReceiptText,
} from '../features/receipts/receiptValidation';
import type {
  ReceiptUploadLaunchMode,
  RootStackParamList,
} from '../navigation/RootNavigator';
import type { ReceiptItem } from '../types/receipt';
import {
  getUseLibraryPicker,
  setUseLibraryPicker,
} from '../utils/featureFlags';

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
  if (isAxiosError<{ message?: string }>(error)) {
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

type CaptureFailureKind =
  | 'cancelled'
  | 'duplicate'
  | 'ocr_failed'
  | 'refund'
  | 'wrong_type';

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
    onSuccess: response => {
      setSimulateFailure(false);
      queryClient.setQueryData<ReceiptItem[]>(receiptQueryKeys.all, current => {
        const nextReceipts = current ?? [];

        return [
          response.receipt,
          ...nextReceipts.filter(receipt => receipt.id !== response.receipt.id),
        ];
      });
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

      const extractedMetadata = extractReceiptMetadata(recognition.text);

      if (extractedMetadata.isRefund) {
        console.warn(
          '[ReceiptUploadScreen] Blocked refund receipt before upload',
          {
            extractedMetadata,
            fileName: nextAsset.fileName,
            ocrText: recognition.text,
          },
        );
        setCaptureFailure('refund');
        return;
      }

      if (!looksLikeReceiptText(recognition.text)) {
        console.warn(
          '[ReceiptUploadScreen] Rejected OCR text as non-itemized receipt',
          {
            extractedMetadata,
            fileName: nextAsset.fileName,
            ocrText: recognition.text,
          },
        );
        setCaptureFailure('wrong_type');
        return;
      }

      let existingReceipts =
        queryClient.getQueryData<ReceiptItem[]>(receiptQueryKeys.all) ?? [];

      if (existingReceipts.length === 0) {
        try {
          existingReceipts = await queryClient.fetchQuery({
            queryFn: fetchReceipts,
            queryKey: receiptQueryKeys.all,
          });
        } catch {
          existingReceipts = [];
        }
      }

      if (
        extractedMetadata.receiptFingerprint &&
        existingReceipts.some(
          receipt =>
            receipt.extractedMetadata?.receiptFingerprint ===
            extractedMetadata.receiptFingerprint,
        )
      ) {
        console.warn(
          '[ReceiptUploadScreen] Blocked duplicate receipt before upload',
          {
            extractedMetadata,
            fileName: nextAsset.fileName,
            receiptFingerprint: extractedMetadata.receiptFingerprint,
          },
        );
        setCaptureFailure('duplicate');
        return;
      }

      setOcrText(recognition.text);
    },
    [captureWithDocumentScanner, queryClient, uploadMutation, useLibraryPicker],
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
      style={styles.scrollView}
      testID="screen-receipt-upload"
    >
      <ScreenHeader
        description="Capture a receipt with the camera, verify it with on-device OCR, then upload."
        title="Upload Receipt"
        titleTestID="screen-receipt-upload-title"
      />

      {/* Step 1 — Capture */}
      <SectionCard
        description="The image is captured via the device camera and verified with on-device OCR before upload."
        title="1. Capture a receipt"
      >
        <View style={styles.buttonGroup}>
          <AppButton
            disabled={isUploading}
            onPress={() => {
              handleCaptureReceipt().then(() => undefined);
            }}
            size="lg"
            testID="pick-receipt-button"
            variant="primary"
          >
            Capture Receipt
          </AppButton>
          {__DEV__ ? (
            <AppButton
              onPress={async () => {
                const next = !useLibraryPicker;
                await setUseLibraryPicker(next);
                setUseLibraryPickerState(next);
              }}
              size="sm"
              testID="dev-flag-toggle"
              variant="ghost"
            >
              {`[DEV] Picker: ${useLibraryPicker ? 'Library' : 'Camera'}`}
            </AppButton>
          ) : null}
        </View>
      </SectionCard>

      {/* Step 2 — Preview */}
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
            <Text style={styles.emptyPreviewIcon}>🧾</Text>
            <Text style={styles.emptyPreviewText}>
              No receipt captured yet.
            </Text>
          </View>
        )}
      </SectionCard>

      {/* Step 3 — Upload */}
      <SectionCard
        description="Toggle mock failure when you want to exercise retry handling without a real backend."
        title="3. Trigger the upload request"
      >
        <View style={styles.buttonGroup}>
          <AppButton
            disabled={!selectedAsset || !ocrText || isUploading}
            onPress={() => setSimulateFailure(prev => !prev)}
            size="sm"
            testID="simulate-failure-toggle"
            variant="ghost"
          >
            {`Simulate Failure: ${simulateFailure ? 'On' : 'Off'}`}
          </AppButton>
          <AppButton
            disabled={!selectedAsset || !ocrText || isUploading}
            isLoading={isUploading}
            onPress={() => handleUpload()}
            size="lg"
            testID="upload-receipt-button"
            variant="primary"
          >
            {isUploading ? 'Uploading...' : 'Upload Receipt'}
          </AppButton>
          {uploadMutation.isError ? (
            <AppButton
              disabled={!selectedAsset || !ocrText || isUploading}
              onPress={() => handleUpload(false)}
              testID="retry-upload-button"
              variant="ghost"
            >
              Retry Upload
            </AppButton>
          ) : null}
        </View>
      </SectionCard>

      {/* Capture failure cards */}
      {captureFailure === 'ocr_failed' ? (
        <StateCard
          message="We couldn't read the receipt. Try again in better lighting."
          testID="receipt-capture-failure-ocr"
          title="Couldn't read the receipt"
          variant="error"
        />
      ) : null}
      {captureFailure === 'wrong_type' ? (
        <StateCard
          message="Only grocery and supermarket receipts are accepted."
          testID="receipt-capture-failure-wrong-type"
          title="Wrong receipt type"
          variant="error"
        />
      ) : null}
      {captureFailure === 'refund' ? (
        <StateCard
          message="Refund and cancellation receipts are not eligible for points."
          testID="receipt-capture-failure-refund"
          title="Refund receipt not accepted"
          variant="error"
        />
      ) : null}
      {captureFailure === 'duplicate' ? (
        <StateCard
          message="This receipt has already been submitted."
          testID="receipt-capture-failure-duplicate"
          title="Duplicate receipt"
          variant="error"
        />
      ) : null}
      {captureFailure === 'cancelled' ? (
        <StateCard
          message="Unable to access the camera. Check your permissions and try again."
          testID="receipt-capture-failure-cancelled"
          title="Camera unavailable"
          variant="error"
        />
      ) : null}

      {/* Upload status */}
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
    gap: 10,
  },
  contentContainer: {
    padding: 24,
  },
  emptyPreview: {
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 28, 0.03)',
    borderColor: '#eceae4',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 220,
    padding: 24,
  },
  emptyPreviewIcon: {
    fontSize: 40,
    marginBottom: 8,
    opacity: 0.4,
  },
  emptyPreviewText: {
    color: '#5f5f5d',
    fontSize: 15,
    textAlign: 'center',
  },
  fileName: {
    color: '#1c1c1c',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  metadata: {
    color: '#5f5f5d',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  previewImage: {
    backgroundColor: '#eceae4',
    borderRadius: 12,
    height: 220,
    width: '100%',
  },
  scrollView: {
    backgroundColor: '#f7f4ed',
  },
});

export default ReceiptUploadScreen;
