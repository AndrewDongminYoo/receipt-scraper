# BLUEPRINT.md

## Purpose

This repository exists to rebuild practical React Native CLI muscle memory in 5 days before starting a new job next Monday.

This is not a study plan, a portfolio exercise, or an architecture experiment. It is a short recovery sprint whose only real goal is this:

> By the end of the week, a React Native CLI codebase should feel familiar enough that you can open it, run it, debug it, and modify it without hesitation.

The fastest way to get there is not by reading more. It is by shipping one small but complete app flow with real screens, real navigation, real native setup, and a small amount of network-style interaction.

The schedule below keeps the existing `Day 0` through `Day 5` labels used elsewhere in this repository. Treat `Day 0` as the setup reset phase and `Day 1` through `Day 5` as the delivery sequence.

---

## What Success Looks Like

By the end of this sprint, all of the following should be true:

- You created a modern React Native CLI project yourself.
- You ran the app on both iOS and Android yourself.
- You touched both native configuration and shared TypeScript code.
- You built a small receipt rewards prototype from start to finish.
- You kept state management and structure intentionally minimal.

If those things are true, the sprint succeeded. Anything beyond that is optional.

---

## Project Positioning

This project is a receipt rewards mini-clone.

It should feel close enough to a real product that the work resembles what a team might actually ship, but small enough to finish in 5 days without drifting into over-engineering.

This app is:

- A working prototype
- A React Native CLI practice project
- A vehicle for recovering implementation speed

This app is not:

- A production-ready app
- A polished portfolio piece
- A testbed for architecture experiments
- A reason to introduce unnecessary libraries

---

## Core Principles

### 1. Implementation Over Study

Reading alone will not rebuild the feel of React Native CLI. Every day must end with something running on a device or simulator.

### 2. Minimum Structure First

Do not start with Redux, Clean Architecture, design systems, DI containers, monorepo tooling, or abstraction-heavy folder structures.

### 3. Product-Like Flow Over Toy Examples

Even though this is practice, the app flow should resemble a real business flow:

- land on a screen
- upload a receipt
- see the receipt in a list
- complete a survey
- receive a reward result

### 4. Daily Verifiability

At the end of each day, both iOS and Android should have something tappable and testable.

### 5. Done Criteria Are Mandatory

"Good enough for today" is not a feeling. Each day has explicit exit criteria. Once they are met, stop and move on.

---

## Product Scope

Build a minimal receipt rewards app with the following end-to-end flow.

### In Scope

- One onboarding or home screen
- Receipt image selection or camera capture
- Upload request with visible status
- Receipt list screen
- Survey response screen
- Reward result screen or success toast

### Out of Scope

- Real authentication
- Real login
- Push notifications
- Payments
- Complex animation
- Complex global state management
- Premature component extraction
- Deep folder abstraction before the features exist

---

## Technical Baseline

If the target work environment may not use Expo, the practice environment should match that reality. Use React Native CLI.

### Base Stack

Only add dependencies when the corresponding day requires them.

| Package                                                       | Planned Day | Purpose                                |
| ------------------------------------------------------------- | ----------- | -------------------------------------- |
| React Native CLI                                              | Day 0       | Native project creation and build flow |
| TypeScript                                                    | Day 0       | Type-safe shared code                  |
| `@react-navigation/native` + `@react-navigation/native-stack` | Day 1       | Navigation skeleton                    |
| `axios`                                                       | Day 2       | HTTP client for upload-style requests  |
| `react-native-image-picker`                                   | Day 2       | Camera or gallery access               |
| `@tanstack/react-query`                                       | Day 3       | Server state and invalidation          |
| `react-hook-form`                                             | Day 4       | Form state management                  |
| `zod`                                                         | Day 4       | Input validation                       |

### State Management Rules

- Server data belongs in TanStack Query.
- Temporary screen state belongs in `useState` or `useReducer`.
- Shared UI state should stay as local as possible.
- Global state should be introduced only if local state is clearly insufficient.

Avoid this specific mistake from the beginning:

- Do not copy TanStack Query data into local state or a global store.

The query cache is the source of truth for server state.

---

## Recommended Folder Evolution

Do not build the full structure upfront. Start small and let the structure appear as features are added.

Target structure:

```text
src/
  api/
  components/
  features/
    receipts/
    survey/
    rewards/
  navigation/
  screens/
  types/
  utils/
```

Guidelines:

- Start with `screens`, `navigation`, `api`, and `features` only when they become necessary.
- Do not create empty folders just to satisfy the blueprint.
- Extract a shared component only after it is repeated in 3 or more places.
- Prefer shared TypeScript and JS logic over platform-specific code unless native files are genuinely required.

---

## Learning Targets

The sprint is mainly meant to recover these 8 abilities:

1. Creating and running a modern React Native CLI project
2. Verifying the iOS and Android native environments
3. Rebuilding navigation setup instincts
4. Handling image selection, capture, and permission flow
5. Implementing multipart upload flow
6. Using server-state query, mutation, and invalidation correctly
7. Rebuilding mobile form UX instincts
8. Recovering list rendering and baseline performance awareness

---

## Fixed Implementation Order

Do not change the implementation order.

1. Environment setup
2. Navigation skeleton
3. Upload flow
4. Receipt list
5. Survey flow
6. Polish and cleanup

Changing the order usually leads to wasted time on structure, state management, or abstractions before the app flow exists. That is explicitly out of scope for this sprint.

---

## 5-Day Execution Plan

Each day below defines the target, scope, tasks, and exit criteria. Do not move to the next day until the current day is genuinely done.

### Day 0: Environment Recovery

#### Goal

Create a fresh React Native CLI TypeScript project and run it on both iOS and Android locally.

#### Why This Day Matters

This is the foundation for everything else. If iOS or Android setup is unstable, later feature work becomes noisy and misleading.

#### Tasks

- Verify local Node, Watchman, CocoaPods, JDK, Android SDK, and Android Studio state
- Create a new React Native CLI TypeScript project
- Run the app on iOS
- Run the app on Android
- Confirm Metro, cache clearing, debug menu, and fast refresh basics

#### Example Commands

```bash
npx react-native@latest init receiptScraper --template react-native-template-typescript
cd receiptScraper
npx react-native start
npx react-native run-ios
npx react-native run-android
```

#### Verification Checklist

- iOS builds successfully
- Android emulator or device launches successfully
- Metro connection is stable
- Fast Refresh works
- You can reproduce and recover from at least one build failure or environment hiccup on your own

#### Done

- The default React Native app runs on both iOS and Android
- The local build environment is no longer mysterious

---

### Day 1: Navigation Skeleton

#### Goal

Create the minimum screen structure that feels like a real app.

#### Required Screens

- `HomeScreen`
- `ReceiptUploadScreen`
- `ReceiptListScreen`
- `SurveyScreen`
- `RewardResultScreen`

#### Tasks

- Install React Navigation dependencies
- Create a stack navigator
- Define shared navigation types
- Add temporary routes with dummy data
- Implement only basic layouts and placeholders

#### Rules

- Do not over-design the folder structure
- Do not extract shared components too early
- The purpose of this day is app shape, not polish

#### Deliverable

A tappable 5-screen app shell with obvious route transitions.

#### Done

- All 5 screens are reachable
- The app builds cleanly with TypeScript
- Every screen shows meaningful placeholder UI

---

### Day 2: Receipt Upload Flow

#### Goal

Connect image selection to an upload request flow.

#### Scope

- Camera or gallery access
- Image preview
- Upload button
- Uploading state
- Retry on failure

#### Tasks

- Install and wire an image picker library
- Add iOS permission copy
- Verify Android permission behavior and SDK differences
- Connect to a mock API or temporary upload endpoint
- Send a multipart/form-data request

#### Practical Constraints

- Large images should not make the UI feel broken
- Rapid repeated taps should not create duplicate uploads
- Permission denial should not dead-end the screen
- Cancel and retry paths should not leave stale state behind

#### If a Real Backend Is Not Ready

Use a temporary endpoint, mock API adapter, or simulated request layer inside `src/api/`. The point of the day is to exercise the flow, not to wait for infrastructure.

#### Done

- One image can be selected or captured
- An upload request is actually triggered
- Success and failure states are visible in the UI

---

### Day 3: Receipt List and Server State

#### Goal

Reflect uploaded receipts in a list backed by query-style server state.

#### Scope

- Recent receipt list
- Status badges such as pending, approved, and rejected
- Pull-to-refresh
- Automatic list refresh after upload

#### Tasks

- Install and configure TanStack Query
- Define query keys clearly
- Invalidate the receipt list after upload mutation success
- Implement empty, loading, and error states

#### Example Types

```ts
export type ReceiptStatus = 'pending' | 'approved' | 'rejected';

export interface ReceiptItem {
  id: string;
  imageUrl: string;
  storeName: string;
  purchasedAt: string;
  status: ReceiptStatus;
  rewardPoint?: number;
}
```

#### Rules

- Do not duplicate receipt data into local or global state
- Make refresh behavior explicit, not accidental
- Keep `FlatList` keys stable

#### Done

- The list fetches successfully
- The list refreshes after a successful upload
- Empty, loading, error, and pull-to-refresh states work

---

### Day 4: Survey and Reward Flow

#### Goal

Finish the final input and reward outcome flow.

#### Scope

- 3 to 5 multiple-choice survey questions
- Basic validation
- Submit button
- Reward result UI after success

#### Tasks

- Install and wire React Hook Form
- Define a Zod schema
- Disable repeated submit while a request is in flight
- Show a success result screen or toast
- Handle failure cleanly

#### Example Schema

```ts
import { z } from 'zod';

export const surveySchema = z.object({
  visitPurpose: z.string().min(1),
  purchaseFor: z.string().min(1),
  paymentMethod: z.string().min(1),
});
```

#### Practical Constraints

- Prevent duplicate submission
- Keep error messages human-readable
- Verify keyboard and scrolling behavior on mobile

#### Done

- The survey can be submitted
- Successful submission leads to a reward result
- Invalid input is blocked with basic validation feedback

---

### Day 5: Polish and Cleanup

#### Goal

Bring the project to a state that still feels like practice work, but clearly written by someone who can ship.

#### Tasks

- Clean up error messages
- Improve loading UX
- Extract only 2 or 3 obviously reusable components
- Write a practical README
- Prepare a basic environment-variable boundary if needed
- Run a final pass on both iOS and Android

#### The README Must Explain

- Why the structure stayed minimal
- Why state management stayed minimal
- Where the app would be extended in a real product
- At least 3 known technical debts intentionally left behind

#### Done

- The full app flow can be demonstrated from start to finish
- A README exists
- Clear expansion points are documented

---

## Definition of Done for the Whole Sprint

The sprint is complete when all of the following are true:

- A React Native CLI app was created from scratch
- iOS and Android were both run directly
- Image selection or capture works
- An upload request can be sent
- Upload results are reflected in the receipt list
- Survey submission and reward result display work
- Network failure and empty states are handled
- The README documents structure, trade-offs, and technical debt

If these conditions are met, the sprint is done. Do not move the goalposts.

---

## React Native Friction Points to Rebuild Before Starting the Job

If you have been working in Flutter for a long time, React Native CLI usually feels rusty in the following places.

### 1. Native Configuration Is More Exposed

Compared with Flutter, React Native CLI makes `Info.plist`, `Podfile`, Gradle files, permissions, and platform configuration more visible and more hands-on.

### 2. Library Quality Is Less Consistent

Package behavior can vary between iOS and Android, and documentation is often incomplete. Expect to check GitHub Issues, not only the README.

### 3. Server State Discipline Matters More

It is easy to think in large screen-plus-state bundles when coming from Riverpod or Bloc habits. In this project, server state and UI state must stay clearly separated.

### 4. List Performance Shows Up Quickly

Even if a screen works, real data quickly exposes unstable keys, unnecessary re-renders, and sloppy list assumptions.

### 5. Debugging Is Distributed

You often need to inspect multiple layers together:

- JavaScript logs
- Metro
- native logs
- Xcode
- Android Studio
- device permission state

---

## What Is Worth Reviewing Before the Job

### High Priority

- React Navigation basics
- TanStack Query query, mutation, and invalidation flow
- React Native image picker usage
- iOS permission copy and Android permission handling
- `FlatList` basics and stability

### Lower Priority

- Comparing advanced state-management libraries
- Micro-interactions and animation polish
- Building a design system
- Full test-automation strategy
- Deep internal study of the New Architecture

The goal right now is not mastery. It is regained execution speed.

---

## JD Alignment

The fixed `Day 0` through `Day 5` sprint above does not change. This section is an appendix that maps the current practice app to the JD so the remaining prep time before Monday, April 6, 2026 can be used intentionally.

A short constraint matters here:

- A weekend cannot create "3+ years of React Native experience."
- It can refresh the exact behaviors that make that experience legible on day one: native debugging, TypeScript fluency, API integration, state discipline, third-party SDK caution, and cross-team communication.

### Current Practice Assets Already In This Repository

Treat these as hands-on rehearsal assets, not as reasons to expand scope before
the core flow feels natural:

- Native iOS practice surface already exists in `ios/Podfile`, `ios/receiptScraper/Info.plist`, the CocoaPods lock state, and the current permission copy.
- Native Android practice surface already exists in `android/app/build.gradle`, `android/settings.gradle`, and `android/app/src/main/AndroidManifest.xml`.
- Native plug-in rehearsal already exists through `@react-native-ml-kit/text-recognition` and `src/api/ocr.ts`.
- Feature-flag rehearsal already exists through `src/utils/featureFlags.ts` and the `receipt_upload_use_library_picker` fallback semantics.
- API and state rehearsal already exists through `src/api/receipts.ts`, `src/api/rewards.ts`, TanStack Query invalidation, and visible success, failure, retry, loading, and empty states.

### 1. Native Ops

This practice axis covers the JD areas around React Native iOS and Android
development and deployment, native Android and iOS understanding, and native
plug-in experience.

Focus:

- Read and explain where permissions, deployment targets, autolinking, and release-related settings live in `Podfile`, `Info.plist`, `AndroidManifest.xml`, and Gradle.
- Trace the OCR path from screen code into `src/api/ocr.ts`, then into the linked native dependency, and rehearse how to recover from pod install, Gradle sync, or autolinking failures.
- Rebuild comfort with build, clean, reinstall, and release-signing basics on both iOS and Android.

### 2. API Collaboration

This practice axis covers the JD areas around backend collaboration for API
integration, TypeScript fluency, and state-management understanding.

Focus:

- Keep request and response contracts explicit for upload, receipt list, survey, and reward-result flows.
- Rehearse error classification, retry behavior, idempotency expectations, and query invalidation without copying server state into local state.
- Be able to explain where a real API client, authentication header, or backend contract change would land in the current repository.

### 3. Growth SDK Readiness

This practice axis covers the JD areas around in-app ad management, push
notifications, user tracking, tracking-driven usability improvement, and
third-party SDK experience.

Focus:

- Decide the future initialization points for push, analytics, attribution, remote config, and ad SDKs before integrating anything.
- Write down lifecycle checkpoints: app launch, permission prompt timing, token refresh, screen-view events, ad load/show/fail callbacks, and privacy boundaries.
- Use the current OCR package and feature-flag surface as rehearsal for how to evaluate third-party SDK risk before production adoption.

### 4. Maintenance & CS

This practice axis covers the JD areas around code maintenance, CS bug fixes,
basic CS understanding, and mobile debugging across JS and native layers.

Focus:

- Rehearse a repeatable loop: reproduce, narrow the layer, capture JS and native logs, patch safely, and verify on both iOS and Android.
- Review async flows, loading states, list stability, and failure handling as system behavior, not only as screen code.
- Keep regression checks lightweight but real: one change, one verification, both platforms.

### 5. Cross-team Communication

This practice axis covers the JD areas around content planning participation,
backend collaboration, marketing collaboration, and general communication
outside pure implementation work.

Focus:

- Practice proposing event names, payload shapes, error-copy ownership, and fallback behavior in plain language.
- Treat content, marketing, and backend requirements as contract inputs that must be written down before SDK or API work starts.
- Practice stating what is ready now, what is deferred, and what evidence is still needed before making the next implementation call.

### Before Day 1 At Team Limited

#### P0: Must Be Comfortable By Sunday, April 5, 2026

- `Native Ops` is non-negotiable because the likely day-one friction is in permissions, builds, native configuration, and native module break/fix work.
- `API Collaboration` is also P0 because real feature work will depend on typed contracts, error mapping, and correct TanStack Query discipline.
- `Maintenance & CS` is also P0 because fixing CS-grade bugs requires a stable reproduce-collect-verify loop across JS and native layers.
- The planning surface of `Growth SDK Readiness` is also P0: know where push, analytics, and ad SDK initialization would live even if the real providers are still deferred.

#### P1: Stretch If Time Remains Before Monday, April 6, 2026

- Go deeper on `Growth SDK Readiness`, especially ad lifecycle handling, push token lifecycle, screen tracking shape, and privacy boundaries.
- Rehearse release-signing and store-distribution basics once the native configuration surface feels familiar.

#### P2: First-Week Reinforcement

- Use `Cross-team Communication` as the first-week force multiplier after the technical surfaces above feel comfortable.
- Turn content, marketing, and backend coordination notes into concrete event dictionaries, payload agreements, and rollout checklists.

---

## Explicit Anti-Patterns

These are banned for this sprint.

### Anti-Pattern 1: Perfecting Structure Before the App Exists

This almost always slows the sprint down without improving the outcome.

### Anti-Pattern 2: Adding Global State First

Most likely, it is unnecessary. If the need becomes real later, add it later.

### Anti-Pattern 3: Spending Time on Visual Polish Before the Flow Works

The point is not a pretty app. The point is to get your hands moving confidently again in React Native CLI.

### Anti-Pattern 4: Over-Comparing Libraries

Pick a reasonable library, integrate it, and move on.

### Anti-Pattern 5: Trying to Perfect Testing During the Recovery Sprint

The main target this week is implementation fluency. Testing can be expanded after the core flow exists.

---

## Daily Retrospective Template

At the end of each day, write only this:

```md
## What I Did Today

-

## What Blocked Me

-

## My Current Theory

-

## First Task Tomorrow

-
```

Keep it short. Five lines of honest notes are enough.

---

## Immediate Next 3 Actions

If starting from zero, do this in order:

1. Create a fresh React Native CLI TypeScript project and run it on both iOS and Android.
2. Add React Navigation and build only the 5-screen shell.
3. On the following day, wire image selection and a mock upload flow.

---

## Final Standard

Success is not "I studied React Native a lot."

Success is this:

> On Monday, when you open a React Native CLI project at work, it no longer feels foreign, and you can start making changes immediately.

Everything else is secondary.
