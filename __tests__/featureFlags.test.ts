import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type FeatureFlagStore,
  getUseLibraryPicker,
  resetFeatureFlagStore,
  setFeatureFlagStore,
  setUseLibraryPicker,
} from '../src/utils/featureFlags';

const mockedGetItem = AsyncStorage.getItem as jest.MockedFunction<
  typeof AsyncStorage.getItem
>;
const mockedSetItem = AsyncStorage.setItem as jest.MockedFunction<
  typeof AsyncStorage.setItem
>;

beforeEach(() => {
  jest.clearAllMocks();
  resetFeatureFlagStore();
});

afterEach(() => {
  resetFeatureFlagStore();
});

test('returns false when the configured store has no stored value', async () => {
  const store: FeatureFlagStore = {
    getFlag: jest.fn().mockResolvedValue(null),
    setFlag: jest.fn().mockResolvedValue(undefined),
  };
  setFeatureFlagStore(store);

  const result = await getUseLibraryPicker();

  expect(result).toBe(false);
  expect(store.getFlag).toHaveBeenCalledWith(
    'receipt_upload_use_library_picker',
  );
});

test('returns true when the configured store resolves true', async () => {
  const store: FeatureFlagStore = {
    getFlag: jest.fn().mockResolvedValue(true),
    setFlag: jest.fn().mockResolvedValue(undefined),
  };
  setFeatureFlagStore(store);

  const result = await getUseLibraryPicker();

  expect(result).toBe(true);
  expect(store.getFlag).toHaveBeenCalledWith(
    'receipt_upload_use_library_picker',
  );
});

test('returns false when the configured store resolves false', async () => {
  const store: FeatureFlagStore = {
    getFlag: jest.fn().mockResolvedValue(false),
    setFlag: jest.fn().mockResolvedValue(undefined),
  };
  setFeatureFlagStore(store);

  const result = await getUseLibraryPicker();

  expect(result).toBe(false);
  expect(store.getFlag).toHaveBeenCalledWith(
    'receipt_upload_use_library_picker',
  );
});

test('returns false (does not throw) when the configured store rejects', async () => {
  const store: FeatureFlagStore = {
    getFlag: jest.fn().mockRejectedValue(new Error('storage unavailable')),
    setFlag: jest.fn().mockResolvedValue(undefined),
  };
  setFeatureFlagStore(store);

  const result = await getUseLibraryPicker();

  expect(result).toBe(false);
});

test('passes writes through the configured store', async () => {
  const store: FeatureFlagStore = {
    getFlag: jest.fn().mockResolvedValue(null),
    setFlag: jest.fn().mockResolvedValue(undefined),
  };
  setFeatureFlagStore(store);

  await setUseLibraryPicker(true);

  expect(store.setFlag).toHaveBeenCalledWith(
    'receipt_upload_use_library_picker',
    true,
  );
});

test('returns false when AsyncStorage has no stored value by default', async () => {
  mockedGetItem.mockResolvedValueOnce(null);

  const result = await getUseLibraryPicker();

  expect(result).toBe(false);
});

test('returns true when AsyncStorage stores "true" by default', async () => {
  mockedGetItem.mockResolvedValueOnce('true');

  const result = await getUseLibraryPicker();

  expect(result).toBe(true);
});

test('returns false when AsyncStorage stores "false" by default', async () => {
  mockedGetItem.mockResolvedValueOnce('false');

  const result = await getUseLibraryPicker();

  expect(result).toBe(false);
});

test('returns false (does not throw) when AsyncStorage.getItem rejects by default', async () => {
  mockedGetItem.mockRejectedValueOnce(new Error('storage unavailable'));

  const result = await getUseLibraryPicker();

  expect(result).toBe(false);
});

test('stores "true" when setUseLibraryPicker is called with true', async () => {
  await setUseLibraryPicker(true);

  expect(mockedSetItem).toHaveBeenCalledWith(
    'feature_flag:receipt_upload_use_library_picker',
    'true',
  );
});

test('stores "false" when setUseLibraryPicker is called with false', async () => {
  await setUseLibraryPicker(false);

  expect(mockedSetItem).toHaveBeenCalledWith(
    'feature_flag:receipt_upload_use_library_picker',
    'false',
  );
});
