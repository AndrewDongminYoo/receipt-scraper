# SDK Initialization Memo

This memo documents where push notifications, analytics, ad SDKs, and remote
config would be initialized in the current app architecture. Nothing below is
integrated yet. The purpose is to have the initialization points decided before
any provider is chosen.

---

## Initialization Points

### Push Notifications

- **Initialize:** in `App.tsx`, after `SafeAreaProvider` mounts.
- **Request permission:** after the user's first meaningful interaction (e.g.
  after completing the first receipt upload), not on cold launch.
- **Store token:** via a `useMutation` that sends the device token to the
  backend.
- **Refresh token:** on app foreground via an `AppState` change listener in
  `App.tsx`. Re-register the token if it changed.
- **Handle incoming notification:** in a top-level handler registered in
  `index.js` (before `AppRegistry.registerComponent`).

### Analytics

- **Initialize:** in `App.tsx`, before the navigation container mounts.
- **Screen tracking:** wrap the navigation container with an `onStateChange`
  listener that fires a `screen_view` event on every route change.
- **Event tracking:** fire events in TanStack Query mutation `onSuccess` and
  `onError` callbacks. Do not fire events from UI components directly.
- **User properties:** set after login or first launch, using device locale and
  app version as default properties.

### Ad SDK

- **Initialize:** in `App.tsx`, with a test mode flag gated by `__DEV__`.
- **Load interstitial:** after the receipt list screen mounts (preload in
  background).
- **Show interstitial:** after survey completion, before navigating to the
  reward result screen.
- **Handle callbacks:**
  - `onAdLoaded` — mark ad ready
  - `onAdFailedToLoad` — log error, do not block the user flow
  - `onAdClosed` — continue navigation to reward result
- **Frequency cap:** show at most one interstitial per session. Use a
  session-level flag in `useState` or `useRef`.

### Remote Config

- **Initialize:** in `App.tsx`, on mount.
- **Fetch:** on app launch with a minimum fetch interval (e.g. 12 hours).
- **Fallback:** use hardcoded defaults if the fetch fails or times out.
- **Apply:** cache fetched values in memory for the current session. Do not
  persist to AsyncStorage (Remote Config handles its own cache).
- **Current flag:** `receipt_upload_use_library_picker` (boolean, default
  `false`). This flag is already implemented locally via AsyncStorage. The
  migration path is: read from Remote Config first, fall back to AsyncStorage,
  then fall back to `false`.

---

## Lifecycle Checkpoints

| Checkpoint            | Timing                               | Owner                                       |
| --------------------- | ------------------------------------ | ------------------------------------------- |
| App launch            | `App.tsx` mount                      | Push, analytics, remote config, ad SDK init |
| Permission prompt     | After first upload or survey         | Push token request                          |
| Token refresh         | `AppState` foreground listener       | Push re-registration                        |
| Screen-view event     | Navigation `onStateChange`           | Analytics                                   |
| Upload success event  | `uploadReceipt` mutation `onSuccess` | Analytics                                   |
| Upload failure event  | `uploadReceipt` mutation `onError`   | Analytics                                   |
| Survey complete event | `submitSurvey` mutation `onSuccess`  | Analytics                                   |
| Ad load               | Receipt list screen mount            | Ad SDK                                      |
| Ad show               | Post-survey, pre-reward navigation   | Ad SDK                                      |
| Ad fail               | `onAdFailedToLoad` callback          | Ad SDK (log, don't block)                   |
| Remote config fetch   | App launch                           | Feature flags                               |
| Privacy boundary      | No location, no contacts             | All SDKs                                    |

---

## Privacy Boundaries

- **No location data.** Do not request location permission for any SDK.
- **No contacts.** Do not request contacts permission.
- **Camera only when needed.** Camera permission is requested only when the
  user initiates a receipt capture.
- **No background activity.** Push notification handling is foreground-only in
  the prototype. Background fetch or silent notifications are out of scope.
- **Minimal metadata in uploads.** Upload payload includes only the image, OCR
  text, capture date, and device locale. No GPS, no camera EXIF beyond what
  the image picker strips.
