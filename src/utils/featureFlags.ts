import AsyncStorage from '@react-native-async-storage/async-storage';

const RECEIPT_PICKER_FLAG_KEY =
  'feature_flag:receipt_upload_use_library_picker';

export async function getUseLibraryPicker(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(RECEIPT_PICKER_FLAG_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setUseLibraryPicker(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(RECEIPT_PICKER_FLAG_KEY, enabled.toString());
}
