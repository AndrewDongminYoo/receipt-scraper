const isTest = Boolean(process.env.JEST_WORKER_ID);

module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    // NativeWind replaces the JSX transform; skip in Jest to avoid conflicts
    // with the react-native preset's own JSX configuration.
    ...(isTest ? [] : ['nativewind/babel']),
  ],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    // Reanimated must be last; not needed during tests.
    ...(isTest ? [] : ['react-native-worklets/plugin']),
  ],
};
