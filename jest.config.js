module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest/setup.js'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/jest/__mocks__/fileMock.js',
    '^react-native-svg$': '<rootDir>/jest/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-screens|react-native-safe-area-context|@react-native-async-storage/async-storage|@react-native-ml-kit|react-native-document-scanner-plugin|nativewind|@gluestack-ui|@gluestack-style|react-native-css-interop|@legendapp)/)',
  ],
};
