module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest/setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-screens|react-native-safe-area-context|@react-native-async-storage/async-storage|@react-native-ml-kit|react-native-document-scanner-plugin)/)',
  ],
};
