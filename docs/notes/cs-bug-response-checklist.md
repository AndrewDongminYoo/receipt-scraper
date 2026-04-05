# CS Bug-Response Checklist

A repeatable loop for handling CS-grade bugs in this React Native app:
reproduce, classify, collect, fix, verify.

---

## Step 1: Reproduce

- Get the exact conditions: device model, OS version, app version, exact user
  steps.
- Reproduce on a simulator or device that matches the report.
- Confirm which platform is affected: iOS only, Android only, or both.
- If the bug cannot be reproduced, ask for a screen recording or screenshot
  before proceeding.

---

## Step 2: Classify the Layer

Determine which layer the bug lives in:

| Layer                 | Symptoms                                                     | Examples in this app                      |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------- |
| **JS logic**          | Wrong state, missing UI update, navigation error             | Receipt list not refreshing after upload  |
| **API contract**      | Wrong response shape, unexpected status code, missing field  | Upload response missing `receipt` field   |
| **Native surface**    | Permission denied, camera crash, build failure, module error | OCR returns undefined, camera not opening |
| **Platform-specific** | Works on iOS but not Android (or vice versa)                 | DocumentScanner only available on iOS     |

---

## Step 3: Collect Logs

| Log source              | How to access                                    | What to look for                         |
| ----------------------- | ------------------------------------------------ | ---------------------------------------- |
| Metro console           | Terminal running `yarn start`                    | JS errors, warnings, console.warn/error  |
| Xcode console           | Xcode > Debug area > Console                     | Native iOS crashes, permission logs      |
| `adb logcat`            | `adb logcat -s ReactNativeJS ReactNative`        | Native Android crashes, JS bridge errors |
| Network inspector       | React Native Debugger or Flipper                 | Request/response shape mismatches        |
| TanStack Query DevTools | (if configured) or `queryClient.getQueryCache()` | Stale data, missing invalidation         |

**Minimum capture for any bug report:**

1. The exact error message or stack trace
2. Which layer it came from (JS, native, network)
3. Whether it reproduces on both platforms

---

## Step 4: Fix

- Make the minimal patch in the identified layer. Do not shotgun-fix multiple
  things at once.
- If the fix is in JS: update the component, hook, or API function directly.
- If the fix is in native config: update `Info.plist`, `AndroidManifest.xml`,
  `Podfile`, or `build.gradle` as needed.
- If the fix is in a third-party dependency: check GitHub Issues for the
  package first, then decide whether to patch, pin, or replace.

**Rules:**

- One fix per commit
- Include the reproduction steps and expected behavior in the commit message
- Do not introduce new dependencies to fix a bug unless absolutely necessary

---

## Step 5: Verify

1. Run `yarn test` — all existing tests must still pass.
2. Run `yarn lint` — no new lint errors.
3. Test the fix on the **affected platform** using the exact reproduction steps.
4. Test the fix on the **other platform** to confirm no regression.
5. If the bug involved a specific device or OS version, verify on that
   configuration if possible.

**Verification is not optional.** A fix that passes tests but has not been
manually verified on the affected platform is not done.

---

## Example Drill (Using This Codebase)

**Bug:** "Upload succeeds but the receipt list doesn't update."

1. **Reproduce:** Upload a receipt, navigate to the receipt list, observe that
   the new receipt is not shown.
2. **Classify:** JS logic — the `onSuccess` callback in `uploadMutation` may
   not be invalidating the query correctly.
3. **Collect:** Check Metro console for the `setQueryData` and
   `invalidateQueries` calls. Check if the receipt list query is using the
   correct query key.
4. **Fix:** Verify that `receiptQueryKeys.all` matches between the upload
   mutation's `invalidateQueries` call and the list screen's `useQuery` call.
5. **Verify:** Run `yarn test`, then manually test the upload-to-list flow on
   both iOS and Android.
