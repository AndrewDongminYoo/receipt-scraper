# Remaining Gaps Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close every gap between BLUEPRINT.md / PLAN.md requirements and the current implementation before the hard deadline of Sunday, April 5, 2026.

**Architecture:** No structural changes. All tasks are localized fixes, missing features from the blueprint spec, lint hygiene, and documentation accuracy updates.

**Tech Stack:** React Native CLI, TypeScript, React Navigation, TanStack Query, Jest, Testing Library

---

## Gap Analysis Summary

| #   | Gap                                                                          | Source                 | Severity       |
| --- | ---------------------------------------------------------------------------- | ---------------------- | -------------- |
| 1   | Pull-to-refresh missing on ReceiptListScreen                                 | BLUEPRINT.md Day 3     | **Code gap**   |
| 2   | `console.debug(item)` left in ReceiptListScreen production render            | Code hygiene           | **Code gap**   |
| 3   | Lint fails on `vendor/` and `coverage/` directories (not project code)       | Day 5 verification     | **Config gap** |
| 4   | README "Prototype Boundary" section contradicts actual implementation        | Day 5 README accuracy  | **Doc gap**    |
| 5   | README "Installed Now" table missing 3 production dependencies               | Day 5 README accuracy  | **Doc gap**    |
| 6   | PLAN.md P0: Native configuration change map not created                      | PLAN.md Saturday drill | **Doc gap**    |
| 7   | PLAN.md P0: OCR native module break/fix checklist not created                | PLAN.md Saturday drill | **Doc gap**    |
| 8   | PLAN.md P0: API and error-state contract note not created                    | PLAN.md Sunday drill   | **Doc gap**    |
| 9   | PLAN.md P0: Push/analytics/ads/remote-config initialization memo not created | PLAN.md Sunday drill   | **Doc gap**    |
| 10  | PLAN.md P0: CS bug-response checklist not created                            | PLAN.md Sunday drill   | **Doc gap**    |

---

## Task 1: Add pull-to-refresh to ReceiptListScreen

BLUEPRINT.md Day 3 explicitly requires: "Pull-to-refresh" and "Automatic list refresh after upload". Auto-refresh after upload exists, but pull-to-refresh does not. There is no `RefreshControl` anywhere in the codebase.

### Files:

- Modify: `src/screens/ReceiptListScreen.tsx`
- Modify: `__tests__/ReceiptListScreen.test.tsx`

### Step 1: Write the failing test

Add a test to `__tests__/ReceiptListScreen.test.tsx` that:

1. Renders the list with data
2. Finds the `FlatList` by `testID="receipt-list-success"`
3. Asserts that `refreshControl` prop exists (or triggers the `onRefresh` callback)
4. Verifies `refreshing` state transitions

```tsx
it('supports pull-to-refresh', async () => {
  // Mock fetchReceipts to return data
  // Render the screen
  // Wait for data to load
  // Find the FlatList
  // Verify onRefresh prop is present
  // Trigger onRefresh
  // Verify refetch was called
});
```

### Step 2: Run test to verify it fails

Run: `yarn test __tests__/ReceiptListScreen.test.tsx`
Expected: FAIL — no `onRefresh` or `RefreshControl` on the FlatList.

### Step 3: Implement pull-to-refresh

In `src/screens/ReceiptListScreen.tsx`:

1. Import `RefreshControl` from `react-native`
2. Add `refreshing` state derived from query's `isRefetching`
3. Pass `refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}` to the `FlatList`

### Step 4: Run test to verify it passes

Run: `yarn test __tests__/ReceiptListScreen.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/screens/ReceiptListScreen.tsx __tests__/ReceiptListScreen.test.tsx
git commit -m "feat: ✨ add pull-to-refresh to receipt list"
```

---

## Task 2: Remove stale `console.debug` from ReceiptListScreen

`src/screens/ReceiptListScreen.tsx:19` has `console.debug(item)` inside `renderReceiptItem`. This logs every receipt item on every render. It should be removed for Day 5 cleanup.

### Files:

- Modify: `src/screens/ReceiptListScreen.tsx`

### Step 1: Delete line 19

Remove `console.debug(item);` from the `renderReceiptItem` function.

### Step 2: Run tests

Run: `yarn test __tests__/ReceiptListScreen.test.tsx`
Expected: PASS (no test depends on console.debug output)

### Step 3: Commit

```bash
git add src/screens/ReceiptListScreen.tsx
git commit -m "chore: 🧹 remove debug log from receipt list render"
```

---

## Task 3: Fix lint by excluding `vendor/` and `coverage/` directories

All 70 lint problems are from `vendor/bundle/ruby/` (Ruby gem JS files) and `coverage/lcov-report/` (Jest coverage output). Zero lint errors exist in project source code.

### Files:

- Create: `.eslintignore`

### Step 1: Create `.eslintignore`

```plaintext
vendor/
coverage/
```

### Step 2: Verify lint passes

Run: `yarn lint`
Expected: 0 errors, 0 warnings

### Step 3: Commit

```bash
git add .eslintignore
git commit -m "chore: 🔧 exclude vendor and coverage from eslint"
```

---

## Task 4: Fix README to reflect actual implementation

The README has two categories of stale information:

**Problem A — "Prototype Boundary" section (lines 110-125)**

The section says the prototype does NOT include:

- native camera capture
- on-device OCR
- receipt corner detection
- perspective flattening

But the implementation ALREADY HAS:

- `DocumentScanner` (VisionKit) for iOS camera capture with perspective correction
- `@react-native-ml-kit/text-recognition` for on-device OCR
- `launchCamera` fallback for Android

The section needs rewriting to reflect what the prototype actually does and what remains outside its boundary.

**Problem B — "Installed Now" table (lines 132-145)**

Missing three production dependencies:

- `react-native-document-scanner-plugin` — VisionKit document scanning (iOS)
- `@react-native-ml-kit/text-recognition` — on-device OCR
- `@react-native-async-storage/async-storage` — feature flag persistence

**Problem C — "Intentional Technical Debt" section (lines 254-261)**

Some debt items are now resolved (OCR exists, camera capture exists). The list needs updating.

### Files:

- Modify: `README.md`

### Step 1: Update "Prototype Boundary" section

Rewrite to reflect the current implementation:

- Camera capture works via VisionKit (iOS) and launchCamera (Android)
- On-device OCR is implemented via ML Kit
- Receipt validation, refund detection, and duplicate detection exist
- What remains outside: real backend, persistent storage, production release signing

### Step 2: Update "Installed Now" table

Add the three missing dependencies.

### Step 3: Update "Intentional Technical Debt" section

Revise to reflect current state accurately.

### Step 4: Run tests (sanity check nothing else broke)

Run: `yarn test`
Expected: All 67 tests pass

### Step 5: Commit

```bash
git add README.md
git commit -m "docs: 📝 update README to reflect current implementation"
```

---

## Task 5: Write native configuration change map

PLAN.md P0, Saturday drill item 2. This is a quick-reference document that answers: where do specific native config changes go?

### Files:

- Create: `docs/notes/native-config-change-map.md`

### Step 1: Write the change map

Document:

- Camera and photo permission copy: `ios/receiptScraper/Info.plist` keys, `android/app/src/main/AndroidManifest.xml` `<uses-permission>` tags
- iOS deployment target: `ios/Podfile` `platform :ios` line, Xcode project settings
- Android SDK, manifest, and signing: `android/app/build.gradle` `compileSdkVersion`/`targetSdkVersion`/`minSdkVersion`, `android/app/src/main/AndroidManifest.xml`, `android/app/build.gradle` `signingConfigs`
- Native library failure points: CocoaPods `pod install`, Gradle sync, autolinking in `react-native.config.js`, runtime native module resolution

### Step 2: Commit

```bash
git add docs/notes/native-config-change-map.md
git commit -m "docs: 📝 add native configuration change map"
```

---

## Task 6: Write OCR native module break/fix checklist

PLAN.md P0, Saturday drill item 4.

### Files:

- Create: `docs/notes/ocr-breakfix-checklist.md`

### Step 1: Write the checklist

Cover the four failure scenarios with recovery steps:

1. `pod install` fails — clear derived data, `pod repo update`, check Podfile platform version
2. iOS build fails after native dependency change — clean build folder, re-run `pod install`, check minimum iOS version
3. Gradle sync or Android build fails — `./gradlew clean`, check `build.gradle` compile SDK, verify autolink entries
4. Module links but runtime call fails — check `react-native.config.js`, verify native module is registered, check JS import path

### Step 2: Commit

```bash
git add docs/notes/ocr-breakfix-checklist.md
git commit -m "docs: 📝 add OCR native module break/fix checklist"
```

---

## Task 7: Write API and error-state contract note

PLAN.md P0, Sunday drill items 1-2.

### Files:

- Create: `docs/notes/api-error-state-contracts.md`

### Step 1: Write the contract note

Document each flow's request/response shape and every visible error state:

- **Upload**: `POST multipart/form-data` with `receipt` file + `ocrText` + `captureDate` + `deviceLocale` headers → `{ receipt: ReceiptItem, message: string }`
- **Receipt list**: `GET` → `ReceiptItem[]` with `id`, `imageUrl`, `storeName`, `purchasedAt`, `status`, `extractedMetadata`, `ocrText`
- **Survey submit**: `POST { visitPurpose, purchaseFor, paymentMethod }` → `{ rewardResult: RewardResult }`
- **Reward result**: `GET` → `RewardResult` with `title`, `points`, `message`, `submittedAt`, `surveyAnswers`

Error state map:

- Upload failure (network) → "Receipt upload failed. Please try again." + retry button
- Duplicate receipt → "This receipt has already been submitted."
- OCR empty/failed → "We couldn't read the receipt. Try again in better lighting."
- Wrong receipt type → "Only grocery and supermarket receipts are accepted."
- Refund receipt → "Refund and cancellation receipts are not eligible for points."
- Receipt list fetch error → error card + "Try Again" button
- Reward result fetch error → error card + retry
- Survey validation → inline per-field error messages

### Step 2: Commit

```bash
git add docs/notes/api-error-state-contracts.md
git commit -m "docs: 📝 add API and error-state contract note"
```

---

## Task 8: Write SDK initialization memo

PLAN.md P0, Sunday drill item 3.

### Files:

- Create: `docs/notes/sdk-initialization-memo.md`

### Step 1: Write the memo

Document where each SDK initialization would live, without integrating anything:

- **Push notifications**: initialize in `App.tsx` after `SafeAreaProvider` mount, request permission after first meaningful interaction, store token via `useMutation`, refresh on app foreground
- **Analytics**: initialize in `App.tsx`, wrap navigation container with screen tracking listener, fire events in mutation `onSuccess` callbacks
- **Ad SDK**: initialize in `App.tsx` with test mode flag, load interstitial after receipt list view, show after survey completion, handle load/show/fail callbacks
- **Remote config**: fetch in `App.tsx` on mount with fallback defaults, gate `receipt_upload_use_library_picker` flag, cache in-memory for session

Lifecycle checkpoints:

- App launch → push + analytics + remote config init
- Permission prompt → after first upload or survey
- Token refresh → on app foreground via `AppState` listener
- Screen-view events → navigation state change listener
- Ad callbacks → load on screen mount, show on action, retry on fail
- Privacy → no location, no contacts, camera permission only when needed

### Step 2: Commit

```bash
git add docs/notes/sdk-initialization-memo.md
git commit -m "docs: 📝 add SDK initialization memo"
```

---

## Task 9: Write CS bug-response checklist

PLAN.md P0, Sunday drill item 4.

### Files:

- Create: `docs/notes/cs-bug-response-checklist.md`

### Step 1: Write the checklist

Steps for a typical CS-grade bug:

1. **Reproduce**: get device, OS version, app version, exact steps. Reproduce on simulator/device. Confirm which platform (iOS, Android, both).
2. **Classify the layer**: JS logic error (React state, navigation, query)? API contract mismatch (wrong shape, missing field, HTTP error)? Native surface issue (permission, build, module crash)?
3. **Collect logs**: Metro console for JS errors, Xcode console for iOS native crashes, `adb logcat` for Android native crashes, network inspector for API mismatches.
4. **Fix**: minimal patch in the identified layer, no shotgun changes.
5. **Verify**: run `yarn test`, run on the affected platform, run on the other platform, confirm the original reproduction steps no longer fail.

### Step 2: Commit

```bash
git add docs/notes/cs-bug-response-checklist.md
git commit -m "docs: 📝 add CS bug-response checklist"
```

---

## Task 10: Final verification pass

### Files:

- Verify only

### Step 1: Run all tests

Run: `yarn test`
Expected: All tests pass (67+)

### Step 2: Run lint

Run: `yarn lint`
Expected: 0 errors, 0 warnings (after `.eslintignore` is in place)

### Step 3: Verify git status is clean

Run: `git status`
Expected: clean working tree

### Step 4: Report final verification results

Print exact pass/fail counts and any residual risks.
