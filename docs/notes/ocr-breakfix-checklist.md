# OCR Native Module Break/Fix Checklist

This checklist covers the four most common failure scenarios when working with
the `@react-native-ml-kit/text-recognition` native module in this project.

The OCR path flows through:

```plaintext
ReceiptUploadScreen.tsx
  → src/api/ocr.ts (recognizeReceiptText)
    → @react-native-ml-kit/text-recognition (TextRecognition.recognize)
      → Native: MLKit on iOS (via CocoaPods), ML Kit on Android (via Gradle)
```

---

## 1. `pod install` Fails

**Symptoms:** `pod install` exits with an error about missing specs, version
conflicts, or platform incompatibility.

**Recovery steps:**

1. Run `pod repo update` to refresh the local CocoaPods spec cache.
2. Check the `platform :ios` version in `ios/Podfile`. ML Kit requires iOS 15.1
   or higher.
3. Delete `ios/Pods` and `ios/Podfile.lock`, then re-run
   `cd ios && bundle exec pod install`.
4. If a specific pod version conflicts, check the ML Kit package's
   `react-native-ml-kit-text-recognition.podspec` for its dependency
   constraints.
5. Verify that `use_frameworks!` is not set (ML Kit uses static linking by
   default with React Native).

---

## 2. iOS Build Fails After Native Dependency Change

**Symptoms:** Xcode build errors referencing missing headers, undefined symbols,
or framework search path issues after adding, updating, or removing a native
dependency.

**Recovery steps:**

1. Clean the Xcode build folder: Product > Clean Build Folder (Cmd+Shift+K).
2. Delete Derived Data:
   `rm -rf ~/Library/Developer/Xcode/DerivedData/receiptScraper-*`
3. Re-run `cd ios && bundle exec pod install`.
4. Open the `.xcworkspace` file (not `.xcodeproj`) and rebuild.
5. Check that the iOS deployment target in both `Podfile` and Xcode project
   settings matches the native dependency's minimum requirement.
6. If headers are missing, verify the pod was correctly linked by checking
   `ios/Podfile.lock` for the expected entry.

---

## 3. Gradle Sync or Android Build Fails

**Symptoms:** Gradle sync errors, compilation failures, or `Could not resolve`
errors when building the Android app.

**Recovery steps:**

1. Run `./gradlew clean` from `android/`.
2. Check `android/app/build.gradle`:
   - `compileSdkVersion` should be 34 or higher for current ML Kit.
   - `minSdkVersion` should be 21 or higher.
3. Check that `android/settings.gradle` includes the autolinking include for
   the ML Kit package.
4. Run `npx react-native-autolinking` (or check
   `node_modules/@react-native-ml-kit/text-recognition/android/`) to verify
   the native Android module exists.
5. If the error is a manifest merge conflict, check
   `android/app/src/main/AndroidManifest.xml` for duplicate `<uses-permission>`
   or `<meta-data>` entries.
6. Delete `android/.gradle` and `android/app/build` and rebuild from scratch.

---

## 4. Module Links but Runtime Call Fails

**Symptoms:** The app builds and launches, but calling
`TextRecognition.recognize()` at runtime throws a JS error like
`TypeError: Cannot read property 'recognize' of undefined` or a native crash.

**Recovery steps:**

1. Verify the JS import path: `import TextRecognition from
'@react-native-ml-kit/text-recognition'` should resolve to the correct
   module.
2. Check that the native module is registered:
   - iOS: the pod should be in `Podfile.lock` and the module should appear in
     the autolinking output.
   - Android: the package should be in `settings.gradle` and the module should
     be listed in `MainApplication.java` or `MainApplication.kt` packages.
3. Run `npx react-native info` to verify the package appears in the installed
   native modules list.
4. If using Hermes, ensure the JS bundle is up to date. Clear Metro cache:
   `yarn start --reset-cache`.
5. Check the device/simulator logs (Xcode console for iOS, `adb logcat` for
   Android) for native-side crash traces.
6. On a real device, verify the app has the required runtime permissions (camera
   access is separate from OCR, but some ML Kit features may need network for
   initial model download on Android).
