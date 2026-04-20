import * as React from 'react';
import {
  Animated,
  Image,
  NativeModules,
  Platform,
  Pressable,
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
import PointsBadge from '../components/PointsBadge.tsx';
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
import { colors, fontSizes, fontWeights, radii, space } from '../theme/tokens';
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

/** Indeterminate progress bar for uploading state */
function IndeterminateBar() {
  const [anim] = React.useState(() => new Animated.Value(-1));

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={barStyles.track}>
      <Animated.View
        style={[barStyles.fill, { transform: [{ translateX }] }]}
      />
    </View>
  );
}

const barStyles = StyleSheet.create({
  fill: {
    backgroundColor: colors.lavender400,
    borderRadius: radii.full,
    height: '100%',
    width: 120,
  },
  track: {
    backgroundColor: colors.lavender200,
    borderRadius: radii.full,
    height: 6,
    marginTop: space.sm,
    overflow: 'hidden',
    width: '100%',
  },
});

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
    ? '업로드 중...'
    : uploadMutation.isSuccess
      ? uploadMutation.data.message
      : uploadMutation.isError
        ? getUploadErrorMessage(uploadMutation.error)
        : selectedAsset && ocrText
          ? `${selectedAsset.fileName || '영수증'} 업로드 준비 완료`
          : '카메라로 영수증을 촬영하면 업로드할 수 있어요.';

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
      style={styles.scroll}
      testID="screen-receipt-upload"
    >
      <ScreenHeader
        description="카메라로 영수증을 촬영하고, 기기 OCR로 확인한 뒤 업로드하세요."
        title="영수증 올리기 📷"
        titleTestID="screen-receipt-upload-title"
      />

      {/* Step 1 — Capture */}
      <SectionCard title="1. 영수증 촬영">
        <View style={styles.buttonGroup}>
          <AppButton
            disabled={isUploading}
            onPress={() => {
              handleCaptureReceipt().then(() => undefined);
            }}
            size="lg"
            testID="pick-receipt-button"
            title="영수증 스캔하기"
            variant="primary"
          />
          {__DEV__ ? (
            <AppButton
              onPress={async () => {
                const next = !useLibraryPicker;
                await setUseLibraryPicker(next);
                setUseLibraryPickerState(next);
              }}
              size="sm"
              testID="dev-flag-toggle"
              title={`[DEV] ${useLibraryPicker ? 'Library' : 'Camera'}`}
              variant="ghost"
            />
          ) : null}
        </View>
      </SectionCard>

      {/* Step 2 — Preview */}
      <SectionCard title="2. 미리보기">
        {selectedAsset?.uri ? (
          <View>
            <View>
              <Image
                source={{ uri: selectedAsset.uri }}
                style={styles.previewImage}
                testID="receipt-preview-image"
              />
              <Pressable
                onPress={() => handleCaptureReceipt()}
                style={styles.retakeButton}
              >
                <Text style={styles.retakeButtonLabel}>다시 찍기</Text>
              </Pressable>
            </View>
            <Text style={styles.fileName} testID="receipt-file-name">
              {selectedAsset.fileName || 'Unnamed receipt'}
            </Text>
            <Text style={styles.metadata}>
              {selectedAsset.type || 'Unknown type'} ·{' '}
              {formatFileSize(selectedAsset.fileSize)}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyPreview} testID="receipt-preview-empty">
            <Text style={styles.emptyPreviewIcon}>🧾</Text>
            <Text style={styles.emptyPreviewText}>
              영수증을 촬영하면 여기 표시돼요
            </Text>
          </View>
        )}
      </SectionCard>

      {/* Step 3 — Upload */}
      <SectionCard title="3. 업로드">
        <View style={styles.buttonGroup}>
          <AppButton
            disabled={!selectedAsset || !ocrText || isUploading}
            onPress={() => setSimulateFailure(prev => !prev)}
            size="sm"
            testID="simulate-failure-toggle"
            title={`실패 시뮬레이션: ${simulateFailure ? 'ON' : 'OFF'}`}
            variant="ghost"
          />
          <AppButton
            disabled={!selectedAsset || !ocrText || isUploading}
            loading={isUploading}
            onPress={() => handleUpload()}
            size="lg"
            testID="upload-receipt-button"
            title={isUploading ? '업로드 중...' : '영수증 업로드'}
            variant="primary"
          />
          {isUploading ? <IndeterminateBar /> : null}
          {uploadMutation.isError ? (
            <AppButton
              disabled={!selectedAsset || !ocrText || isUploading}
              onPress={() => handleUpload(false)}
              size="md"
              testID="retry-upload-button"
              title="다시 시도"
              variant="secondary"
            />
          ) : null}
        </View>
      </SectionCard>

      {/* Capture failure cards */}
      {captureFailure === 'ocr_failed' ? (
        <StateCard
          variant="error"
          title="영수증을 읽을 수 없어요"
          message="더 밝은 곳에서 다시 시도해 주세요."
          testID="receipt-capture-failure-ocr"
        />
      ) : null}
      {captureFailure === 'wrong_type' ? (
        <StateCard
          variant="error"
          title="지원하지 않는 영수증 유형"
          message="식료품·마트 영수증만 접수돼요."
          testID="receipt-capture-failure-wrong-type"
        />
      ) : null}
      {captureFailure === 'refund' ? (
        <StateCard
          variant="error"
          title="환불 영수증은 불가해요"
          message="환불·취소 영수증은 포인트 적립 대상이 아니에요."
          testID="receipt-capture-failure-refund"
        />
      ) : null}
      {captureFailure === 'duplicate' ? (
        <StateCard
          variant="error"
          title="이미 등록된 영수증이에요"
          message="동일한 영수증이 이미 제출되었어요."
          testID="receipt-capture-failure-duplicate"
        />
      ) : null}
      {captureFailure === 'cancelled' ? (
        <StateCard
          variant="error"
          title="카메라를 사용할 수 없어요"
          message="권한을 확인하고 다시 시도해 주세요."
          testID="receipt-capture-failure-cancelled"
        />
      ) : null}

      {/* Upload status card */}
      <StateCard
        message={displayMessage}
        showsActivityIndicator={isUploading}
        testID="receipt-upload-status"
        title="업로드 상태"
        variant={
          uploadMutation.isSuccess
            ? 'success'
            : uploadMutation.isError
              ? 'error'
              : isUploading
                ? 'loading'
                : 'info'
        }
      >
        {uploadMutation.isSuccess ? <PointsBadge points={50} /> : null}
      </StateCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    gap: space.md,
  },
  contentContainer: {
    padding: space.xl,
    paddingBottom: space['3xl'],
  },
  emptyPreview: {
    alignItems: 'center',
    backgroundColor: colors.ink100,
    borderColor: colors.ink300,
    borderRadius: radii.md,
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 220,
    padding: space.xl,
  },
  emptyPreviewIcon: {
    fontSize: 56,
    marginBottom: space.md,
    opacity: 0.35,
  },
  emptyPreviewText: {
    color: colors.ink500,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  fileName: {
    color: colors.ink900,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    marginTop: space.md,
  },
  metadata: {
    color: colors.ink500,
    fontSize: fontSizes.sm,
    marginTop: space.xs,
  },
  previewImage: {
    backgroundColor: colors.ink100,
    borderRadius: radii.md,
    height: 220,
    width: '100%',
  },
  retakeButton: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radii.full,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    position: 'absolute',
    right: space.sm,
    top: space.sm,
  },
  retakeButtonLabel: {
    color: colors.surface,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
  scroll: {
    backgroundColor: colors.canvas,
  },
});

export default ReceiptUploadScreen;
