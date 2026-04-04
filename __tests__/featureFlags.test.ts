import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUseLibraryPicker,
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
});

test('returns false when AsyncStorage has no stored value', async () => {
  mockedGetItem.mockResolvedValueOnce(null);

  const result = await getUseLibraryPicker();

  expect(result).toBe(false);
});

test('returns true when AsyncStorage stores "true"', async () => {
  mockedGetItem.mockResolvedValueOnce('true');

  const result = await getUseLibraryPicker();

  expect(result).toBe(true);
});

test('returns false when AsyncStorage stores "false"', async () => {
  mockedGetItem.mockResolvedValueOnce('false');

  const result = await getUseLibraryPicker();

  expect(result).toBe(false);
});

test('returns false (does not throw) when AsyncStorage.getItem rejects', async () => {
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
