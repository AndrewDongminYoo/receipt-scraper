import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  receiptQueryKeys,
  uploadReceipt,
  type UploadReceiptParams,
} from '../api/receipts';
import ScreenHeader from '../components/ScreenHeader';
import SectionCard from '../components/SectionCard';
import StateCard from '../components/StateCard';

const imagePickerOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
  selectionLimit: 1,
};

const defaultPickerMessage =
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
  const queryClient = useQueryClient();
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);
  const [simulateFailure, setSimulateFailure] = React.useState(false);
  const [pickerMessage, setPickerMessage] =
    React.useState(defaultPickerMessage);

  const uploadMutation = useMutation({
    mutationFn: ({ asset, shouldFail }: UploadReceiptParams) =>
      uploadReceipt({ asset, shouldFail }),
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
        : pickerMessage;

  const handlePickReceipt = async () => {
    const result = await launchImageLibrary(imagePickerOptions);

    if (result.didCancel) {
      setPickerMessage(
        selectedAsset
          ? 'Selection was cancelled. Keeping the current receipt preview.'
          : defaultPickerMessage,
      );
      return;
    }

    if (result.errorCode || !result.assets?.[0]?.uri) {
      setPickerMessage(
        result.errorMessage ||
          'Unable to access the selected receipt. Please choose a different image.',
      );
      return;
    }

    const nextAsset = result.assets[0];

    setSelectedAsset(nextAsset);
    uploadMutation.reset();
    setPickerMessage(
      `Ready to upload ${nextAsset.fileName || 'the selected receipt'}.`,
    );
  };

  const submitUpload = (shouldFail: boolean) => {
    if (!selectedAsset || isUploading) {
      return;
    }

    uploadMutation.mutate({
      asset: selectedAsset,
      shouldFail,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      testID="screen-receipt-upload"
    >
      <ScreenHeader
        description="Pick one receipt image, preview it locally, and push a mock multipart upload request through the Day 2 flow."
        title="Upload Receipt"
        titleTestID="screen-receipt-upload-title"
      />

      <SectionCard
        description="The image comes from the system photo library via `react-native-image-picker`."
        title="1. Pick a receipt"
      >
        <View style={styles.buttonWrapper}>
          <Button
            disabled={isUploading}
            onPress={handlePickReceipt}
            testID="pick-receipt-button"
            title="Choose From Library"
          />
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
              No receipt selected yet.
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
          {uploadMutation.isError ? (
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
      </SectionCard>

      <StateCard
        testID="receipt-upload-status"
        title="Upload status"
        variant={
          uploadMutation.isSuccess
            ? 'success'
            : uploadMutation.isError
              ? 'error'
              : 'info'
        }
      >
        <View testID="receipt-upload-status-message">
          <Text style={styles.statusMessage}>{displayMessage}</Text>
        </View>
      </StateCard>
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
  statusMessage: {
    fontSize: 15,
    lineHeight: 22,
  },
});

export default ReceiptUploadScreen;
