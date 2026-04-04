import AsyncStorage from '@react-native-async-storage/async-storage';

export type FeatureFlagName = 'receipt_upload_use_library_picker';

export interface FeatureFlagStore {
  getFlag(flagName: FeatureFlagName): Promise<boolean | null>;
  setFlag(flagName: FeatureFlagName, enabled: boolean): Promise<void>;
}

const storageKeysByFlag: Record<FeatureFlagName, string> = {
  receipt_upload_use_library_picker:
    'feature_flag:receipt_upload_use_library_picker',
};

export function createAsyncStorageFeatureFlagStore(
  storage: Pick<typeof AsyncStorage, 'getItem' | 'setItem'> = AsyncStorage,
): FeatureFlagStore {
  return {
    async getFlag(flagName) {
      const value = await storage.getItem(storageKeysByFlag[flagName]);

      if (value === null) {
        return null;
      }

      return value === 'true';
    },
    async setFlag(flagName, enabled) {
      await storage.setItem(storageKeysByFlag[flagName], enabled.toString());
    },
  };
}

const defaultFeatureFlagStore = createAsyncStorageFeatureFlagStore();

let featureFlagStore: FeatureFlagStore = defaultFeatureFlagStore;

export function setFeatureFlagStore(store: FeatureFlagStore): void {
  featureFlagStore = store;
}

export function resetFeatureFlagStore(): void {
  featureFlagStore = defaultFeatureFlagStore;
}

export async function getUseLibraryPicker(): Promise<boolean> {
  try {
    return (
      (await featureFlagStore.getFlag('receipt_upload_use_library_picker')) ===
      true
    );
  } catch {
    return false;
  }
}

export async function setUseLibraryPicker(enabled: boolean): Promise<void> {
  await featureFlagStore.setFlag('receipt_upload_use_library_picker', enabled);
}
