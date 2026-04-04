# Team Onboarding Plan

## Summary

- Hard deadline: Sunday, April 5, 2026
- Start date assumption: Monday, April 6, 2026
- Goal: use the existing `receipt-scraper` prototype as a short React Native CLI rehearsal set for the Team Limited JD, with native confidence as the top priority
- Rule: do not add new scope just to feel busy; use the code and native files already present in this repository as the main rehearsal surface

## JD Coverage Map

- React Native iOS and Android app development and deployment: `P0` native configuration audit, `P1` release-signing and distribution rehearsal
- New content planning participation: `P2` content and event-contract notes
- Backend API integration and service feature work: `P0` API contract audit
- In-app ad management: `P0` initialization-point memo, `P1` ad lifecycle drill
- Push notifications and user tracking with marketing: `P0` lifecycle memo, `P1` provider rehearsal
- Code maintenance and CS bug fixes: `P0` reproduce-collect-fix-verify drill
- Android and iOS native basics: `P0` Podfile, plist, Manifest, and Gradle review
- TypeScript comfort: `P0` typed request, response, and state review
- Basic CS understanding: `P0` async flow and failure-path review
- State-management understanding: `P0` TanStack Query vs local state audit
- Communication outside development: `P2` contract and rollout notes
- Native plug-in experience: `P0` OCR native module path trace
- Tracking-driven usability improvement: `P1` analytics event review
- Other 3rd-party library experience: `P1` push, analytics, ads, and remote config rehearsal

Note:

- The JD's "3+ years of React Native and mobile experience" requirement cannot be manufactured in one weekend.
- This plan is about refreshing the evidence areas that make that experience visible on day one.

## P0 Must Finish By 2026-04-05

These are the mandatory drills to finish by Sunday, April 5, 2026. If time is tight, do these before any extra polish or new feature work.

### Saturday, April 4, 2026: Native Surface Audit

1. Read the current iOS and Android configuration files and explain, in your own notes, what each file controls.
   - `ios/Podfile`
   - `ios/receiptScraper/Info.plist`
   - `android/app/build.gradle`
   - `android/app/src/main/AndroidManifest.xml`
   - `android/settings.gradle`
2. Write a short "change map" that answers these questions:
   - where camera and photo permission copy changes go
   - where iOS deployment-target changes go
   - where Android SDK, manifest, and signing changes go
   - where a native library can fail during install, build, or startup
3. Trace the current OCR path end to end:
   - `src/screens/ReceiptUploadScreen.tsx`
   - `src/api/ocr.ts`
   - `@react-native-ml-kit/text-recognition`
   - native install surfaces in CocoaPods and Gradle
4. Build an OCR native module break/fix checklist.
   - pod install fails
   - iOS build fails after native dependency change
   - Gradle sync or Android build fails
   - module links but runtime call fails
5. Rehearse the minimum build and debug command set you should know without looking anything up.
   - Metro start and reset
   - iOS build run
   - Android build run
   - lint and test
   - one clean rebuild path for each platform

### Sunday, April 5, 2026: App Contract And Operations Drill

1. Audit the current typed app flow and write one-page notes for each contract.
   - receipt upload request and response
   - receipt list query shape
   - survey submit request and reward-result response
   - visible success, failure, loading, empty, and retry states
2. Write the current error-state map for the app.
   - upload failure
   - duplicate receipt response
   - OCR empty result
   - OCR failure
   - wrong receipt type
   - reward-result fetch failure
3. Write the future SDK initialization memo.
   - where push setup would live
   - where analytics setup would live
   - where ad SDK setup would live
   - where remote-config fetch or fallback would live
   - which lifecycle hooks should own token refresh, screen tracking, and ad
     callbacks
4. Run one CS-style maintenance drill using the current codebase.
   - reproduce one known failure path
   - state whether the issue is JS, API-contract, or native-surface related
   - note what logs you would collect
   - note how you would verify the fix on both iOS and Android
5. Review state-management boundaries one more time.
   - server state stays in TanStack Query
   - temporary UI state stays local
   - do not duplicate query data into another store

### P0 Deliverables

- A native configuration change map you can explain out loud
- An OCR native module break/fix checklist
- An API and error-state contract note for the current app flow
- A push, analytics, ads, and remote-config initialization memo
- A CS bug-response checklist with reproduce, collect, fix, and verify steps

## P1 Stretch If Time Remains

These are valuable next, but they should not displace `P0`.

1. Rehearse release signing and distribution basics.
   - Android keystore and release signing flow
   - iOS archive, signing, and distribution vocabulary
   - what changes between debug and release behavior
2. Draft a first-pass event dictionary for analytics and marketing.
   - screen-view events
   - upload success and failure events
   - survey completion events
   - reward-view events
3. Draft the ad lifecycle note.
   - app open or interstitial load point
   - test mode requirements
   - failure fallback behavior
   - frequency and UX guardrails
4. Pick one real provider in each category and record integration constraints.
   - push
   - analytics
   - ads
   - remote config

## P2 First-Week Reinforcement

These items are appropriate for the first week after joining if the pre-start window runs out.

1. Turn cross-team coordination into concrete artifacts.
   - backend request and response contract sheet
   - marketing event and payload sheet
   - content-copy ownership and rollout checklist
2. Integrate one real third-party SDK in a safe branch and document the result.
3. Build a first-pass operations view.
   - what errors should be tracked
   - what user events matter
   - what rollout or rollback levers are needed
4. Review one real CS-style bug from intake to verification and write the timeline down.

## Default Decision Rules

- Prefer native confidence over extra feature scope.
- Prefer typed contracts and explicit error handling over clever abstractions.
- Prefer lightweight notes that you can explain out loud over long study docs you will not revisit.
- Prefer using this repository's current OCR, feature-flag, TanStack Query, and native configuration surfaces as rehearsal assets rather than introducing new libraries before Monday, April 6, 2026.
