/* global jest */

jest.mock('react-native-screens', () => {
  const screens = jest.requireActual('react-native-screens');
  const React = require('react');
  const { View } = require('react-native');
  const createScreenWrapper = () =>
    React.forwardRef(({ children, ...props }, ref) => (
      <View ref={ref} {...props}>
        {children}
      </View>
    ));

  return {
    ...screens,
    compatibilityFlags: {},
    isSearchBarAvailableForCurrentPlatform: jest.fn(() => false),
    Screen: createScreenWrapper(),
    ScreenFooter: createScreenWrapper(),
    ScreenStack: createScreenWrapper(),
    ScreenStackHeaderBackButtonImage: createScreenWrapper(),
    ScreenStackHeaderCenterView: createScreenWrapper(),
    ScreenStackHeaderLeftView: createScreenWrapper(),
    ScreenStackHeaderRightView: createScreenWrapper(),
    ScreenStackHeaderSearchBarView: createScreenWrapper(),
    ScreenStackItem: createScreenWrapper(),
    SearchBar: createScreenWrapper(),
  };
});

jest.mock('react-native/src/private/animated/NativeAnimatedHelper');

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-document-scanner-plugin', () => ({
  __esModule: true,
  ResponseType: {
    Base64: 'base64',
    ImageFilePath: 'imageFilePath',
  },
  ScanDocumentResponseStatus: {
    Success: 'success',
    Cancel: 'cancel',
  },
  default: {
    scanDocument: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-ml-kit/text-recognition', () => ({
  __esModule: true,
  TextRecognitionScript: {
    CHINESE: 'Chinese',
    DEVANAGARI: 'Devanagari',
    JAPANESE: 'Japanese',
    KOREAN: 'Korean',
    LATIN: 'Latin',
  },
  default: { recognize: jest.fn() },
}));
