import * as React from 'react';
import axios from 'axios';
import type { Asset, ImageLibraryOptions } from 'react-native-image-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { uploadReceipt } from '../api/receipts';

const imagePickerOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
  selectionLimit: 1,
};

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const defaultStatusMessage =
  'Choose a receipt image from your library to start the upload flow.';

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

function ReceiptUploadScreen() {
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);
  const [simulateFailure, setSimulateFailure] = React.useState(false);
  const [uploadState, setUploadState] = React.useState<UploadState>('idle');
  const [statusMessage, setStatusMessage] =
    React.useState(defaultStatusMessage);

  const isUploading = uploadState === 'uploading';

  const handlePickReceipt = async () => {
    const result = await launchImageLibrary(imagePickerOptions);

    if (result.didCancel) {
      setStatusMessage(
        selectedAsset
          ? 'Selection was cancelled. Keeping the current receipt preview.'
          : defaultStatusMessage,
      );
      return;
    }

    if (result.errorCode || !result.assets?.[0]?.uri) {
      setUploadState('error');
      setStatusMessage(
        result.errorMessage ||
          'Unable to access the selected receipt. Please choose a different image.',
      );
      return;
    }

    const nextAsset = result.assets[0];

    setSelectedAsset(nextAsset);
    setUploadState('idle');
    setStatusMessage(
      `Ready to upload ${nextAsset.fileName || 'the selected receipt'}.`,
    );
  };

  const submitUpload = async (shouldFail: boolean) => {
    if (!selectedAsset) {
      return;
    }

    setUploadState('uploading');
    setStatusMessage('Uploading receipt...');

    try {
      const response = await uploadReceipt({
        asset: selectedAsset,
        shouldFail,
      });

      setSimulateFailure(false);
      setUploadState('success');
      setStatusMessage(response.message);
    } catch (error) {
      setUploadState('error');
      setStatusMessage(getUploadErrorMessage(error));
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      testID="screen-receipt-upload"
    >
      <Text style={styles.title} testID="screen-receipt-upload-title">
        Upload Receipt
      </Text>
      <Text style={styles.description}>
        Pick one receipt image, preview it locally, and push a mock multipart
        upload request through the Day 2 flow.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. Pick a receipt</Text>
        <Text style={styles.supportingText}>
          The image comes from the system photo library via
          `react-native-image-picker`.
        </Text>
        <View style={styles.buttonWrapper}>
          <Button
            disabled={isUploading}
            onPress={handlePickReceipt}
            testID="pick-receipt-button"
            title="Choose From Library"
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>2. Preview the selected file</Text>
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
              No receipt selected yet.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>3. Trigger the upload request</Text>
        <Text style={styles.supportingText}>
          Toggle mock failure when you want to exercise retry handling without a
          real backend.
        </Text>
        <View style={styles.buttonGroup}>
          <View style={styles.buttonWrapper}>
            <Button
              disabled={!selectedAsset || isUploading}
              onPress={() =>
                setSimulateFailure(previousState => !previousState)
              }
              testID="simulate-failure-toggle"
              title={`Simulate Failure: ${simulateFailure ? 'On' : 'Off'}`}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              disabled={!selectedAsset || isUploading}
              onPress={() => submitUpload(simulateFailure)}
              testID="upload-receipt-button"
              title={isUploading ? 'Uploading...' : 'Upload Receipt'}
            />
          </View>
          {uploadState === 'error' ? (
            <View style={styles.buttonWrapper}>
              <Button
                disabled={!selectedAsset || isUploading}
                onPress={() => submitUpload(false)}
                testID="retry-upload-button"
                title="Retry Upload"
              />
            </View>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.statusCard,
          uploadState === 'success' && styles.statusCardSuccess,
          uploadState === 'error' && styles.statusCardError,
        ]}
        testID="receipt-upload-status"
      >
        <Text style={styles.sectionTitle}>Upload status</Text>
        <Text
          style={styles.statusMessage}
          testID="receipt-upload-status-message"
        >
          {statusMessage}
        </Text>
      </View>
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
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
  },
  contentContainer: {
    padding: 24,
  },
  description: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'left',
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
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  statusCardError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  statusCardSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
  },
  statusMessage: {
    color: '#1f2937',
    fontSize: 15,
    lineHeight: 22,
  },
  supportingText: {
    color: '#4b5563',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'left',
  },
});

export default ReceiptUploadScreen;
