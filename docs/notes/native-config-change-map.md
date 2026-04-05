# Native Configuration Change Map

Quick reference for where specific native configuration changes live in this
repository.

---

## Camera and Photo Permissions

### iOS

- **File:** `ios/receiptScraper/Info.plist`
- **Keys:**
  - `NSCameraUsageDescription` — user-facing copy shown when the app requests
    camera access
  - `NSPhotoLibraryUsageDescription` — user-facing copy shown when the app
    requests photo library access
- **Effect:** changing the string value updates the permission dialog copy. No
  rebuild required if only the string changes, but a clean install on the device
  may be needed to see the updated dialog.

### Android

- **File:** `android/app/src/main/AndroidManifest.xml`
- **Tags:**
  - `<uses-permission android:name="android.permission.CAMERA" />`
  - `<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />`
    (API 33+)
  - `<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
android:maxSdkVersion="32" />` (API 32 and below)
- **Effect:** adding or removing a `<uses-permission>` tag changes what the app
  can request at runtime. The runtime permission dialog text is controlled by the
  OS, not by the app.

---

## iOS Deployment Target

- **File:** `ios/Podfile` — `platform :ios, '<version>'` line
- **File:** Xcode project settings — `IPHONEOS_DEPLOYMENT_TARGET` in the build
  settings of the `receiptScraper` target
- **Rule:** both must agree. If the Podfile says `'15.1'`, the Xcode project
  target should also be `15.1` or higher.
- **After change:** run `cd ios && bundle exec pod install` to regenerate the
  Pods project with the new minimum version.

---

## Android SDK, Manifest, and Signing

### SDK Versions

- **File:** `android/app/build.gradle`
- **Properties:**
  - `compileSdkVersion` — the SDK version used to compile the app
  - `targetSdkVersion` — the SDK version the app declares it targets
  - `minSdkVersion` — the lowest SDK version the app can install on
- **After change:** Gradle sync is required. Run `./gradlew clean` from
  `android/` if the build cache is stale.

### Manifest

- **File:** `android/app/src/main/AndroidManifest.xml`
- **Contains:** permissions, activity declarations, intent filters, application
  metadata
- **Common change:** adding a new `<uses-permission>` or `<meta-data>` tag for a
  third-party SDK

### Signing

- **File:** `android/app/build.gradle` — `signingConfigs` block
- **File:** `android/gradle.properties` or environment variables for keystore
  path, alias, and passwords
- **Note:** debug signing uses the default debug keystore. Release signing
  requires a separate keystore and explicit config.

---

## Native Library Failure Points

| Failure scenario                         | Where it happens                                 |
| ---------------------------------------- | ------------------------------------------------ |
| `pod install` fails                      | `ios/Podfile` version mismatch, missing repo     |
| iOS build fails after dependency change  | Xcode build, Derived Data cache, min iOS version |
| Gradle sync fails                        | `android/app/build.gradle` SDK or dependency     |
| Android build fails                      | Gradle compilation, manifest merge conflicts     |
| Module links but runtime call fails      | JS import path, native module registration       |
| Autolinking does not pick up new package | `react-native.config.js`, `settings.gradle`      |

### Recovery checklist

1. Clear Derived Data (iOS) or run `./gradlew clean` (Android)
2. Re-run `pod install` (iOS) or Gradle sync (Android)
3. Check that the native package version matches the JS package version
4. Verify autolinking entries in `ios/Podfile.lock` or
   `android/settings.gradle`
5. If all else fails: delete `node_modules`, `ios/Pods`, and
   `android/.gradle`, then reinstall everything from scratch
