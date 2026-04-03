# receipt-scraper

`receipt-scraper` is a React Native CLI practice project for rebuilding hands-on React Native muscle memory before starting a new job.

The project goal is not to study React Native in the abstract. The goal is to ship one small, realistic mobile flow end to end so that a React Native CLI codebase stops feeling unfamiliar.

This repository follows the day-by-day plan in [`BLUEPRINT.md`](./BLUEPRINT.md). The plan keeps the existing `Day 0` through `Day 5` labels used across the repo: `Day 0` is the environment reset phase, and `Day 1` through `Day 5` are the feature delivery sequence.

## Why This Repo Exists

This project exists to recover execution speed in React Native CLI by doing real implementation work:

- create and run a fresh React Native CLI app
- verify both iOS and Android environments
- touch native setup and shared TypeScript code
- build a receipt rewards mini-clone with a realistic product flow
- keep architecture and state management intentionally minimal

This project is:

- a working prototype
- a practice app
- a short recovery sprint

This project is not:

- a production app
- a portfolio piece
- an architecture playground

## Target Product Flow

The target app is a minimal receipt rewards mini-clone with this flow:

1. land on a home or onboarding screen
2. select or capture a receipt image
3. send an upload request and show status
4. view the receipt in a list
5. answer a short survey
6. see a reward result or success state

## Current Status

The repository has completed Day 4 of the sprint.

- Day 0 is complete: the React Native 0.84.1 app runs on both iOS and Android.
- Day 1 is complete: the app ships with a 5-screen native-stack navigation shell.
- Day 2 is complete: `ReceiptUploadScreen` now selects a photo, previews it, and triggers a mock multipart upload request with visible success, failure, and retry states.
- Day 3 is complete: `ReceiptListScreen` now reads the shared mock receipt store through TanStack Query and refreshes automatically after a successful upload mutation.
- Day 4 is complete: `SurveyScreen` now validates a 3-question multiple-choice form with `react-hook-form` and `zod`, then routes successful submissions into `RewardResultScreen`.
- `App.tsx` mounts the app root, `SafeAreaProvider`, and the static root navigator.
- The app-level runtime dependencies now include React Navigation 7, `@tanstack/react-query`, `react-hook-form`, `zod`, `axios`, `react-native-image-picker`, and `react-native-screens`.
- Tests now use Jest with `@testing-library/react-native`. `react-test-renderer` remains installed only because the testing library requires it as a peer dependency.

## Fixed Delivery Plan

The implementation order is fixed and should not be changed:

1. Environment setup
2. Navigation skeleton
3. Receipt upload flow
4. Receipt list with server state
5. Survey and reward flow
6. Polish and cleanup

The point of the fixed order is to prevent wasted time on abstractions before the app flow exists.

## Day-by-Day Scope

### Day 0: Environment Recovery

- create and run a fresh React Native CLI TypeScript project
- verify iOS and Android builds locally
- regain comfort with Metro, Fast Refresh, and native troubleshooting

### Day 1: Navigation Skeleton

- add 5 screens
- wire stack navigation
- create only the minimum app shell

### Day 2: Receipt Upload Flow

- add image selection or capture
- preview an image
- send a multipart upload-style request
- handle loading, success, and retry states

### Day 3: Receipt List and Server State

- add TanStack Query
- fetch receipt list data
- refresh the list after a successful upload
- handle empty, loading, and error states

### Day 4: Survey and Reward Flow

- add a short survey
- validate input with `zod`
- submit the form
- show a reward result state

### Day 5: Polish and Cleanup

- clean up error and loading UX
- extract only clearly reusable components
- document trade-offs and follow-up work

## Tech Baseline

Use React Native CLI, not Expo, because the point is to practice the environment that is more likely to show up in actual work.

### Installed Now

| Package                          | Purpose               |
| -------------------------------- | --------------------- |
| `@tanstack/react-query`          | Server state          |
| `@react-navigation/native`       | Navigation container  |
| `@react-navigation/native-stack` | Native stack routing  |
| `axios`                          | Mock HTTP uploads     |
| `react-native`                   | Core mobile framework |
| `react`                          | UI runtime            |
| `react-hook-form`                | Survey form state     |
| `react-native-image-picker`      | Photo library access  |
| `react-native-safe-area-context` | Safe area handling    |
| `react-native-screens`           | Native screen support |
| `typescript`                     | Type checking         |
| `zod`                            | Survey validation     |

### Planned Later

No additional libraries are planned for Day 5. The remaining scope is polish and cleanup.

## Testing Stack

The test baseline is Jest with `@testing-library/react-native`.

- Write tests against visible UI behavior and user flows.
- Prefer text, enabled/disabled state, and screen transitions over reading component props.
- Keep `react-test-renderer` only as a peer dependency required by `@testing-library/react-native`, not as a direct authoring tool.

## Architecture Rules

This repository intentionally avoids over-engineering.

- Server data belongs in TanStack Query once it is introduced.
- Temporary UI state belongs in `useState` or `useReducer`.
- Do not add Redux, Zustand, or app-wide Context for server data.
- Do not duplicate server data into local or global state.
- Do not front-load folder structure or shared component extraction.
- Extract a shared component only when it appears in 3 or more places.

## Current Structure

Current entry points:

- `index.js`
- `App.tsx`

Current feature-bearing `src/` areas:

- `src/navigation/`
- `src/screens/`
- `src/api/`
- `src/types/`

Target `src/` layout as later days require it:

```text
src/
  api/
  components/
  features/
    receipts/
    rewards/
    survey/
  navigation/
  screens/
  types/
  utils/
```

The structure should grow only when features require it. Empty folders are not the goal; working flows are.

## Running the Project

### Prerequisites

- Node `>= 22.11.0`
- Xcode and iOS Simulator
- CocoaPods
- Android Studio and Android SDK
- Watchman on macOS

### Commands

Use Yarn from the repository root:

```bash
yarn start
yarn ios
yarn android
yarn lint
yarn test
```

For iOS setup after cloning or after native dependency changes:

```bash
bundle install
cd ios && bundle exec pod install
```

## Why the Structure and State Stay Minimal

This project is deliberately optimized for regaining delivery speed, not for demonstrating ideal architecture.

- Minimal structure makes it easier to start building immediately.
- Local state is enough for early UI work.
- TanStack Query is the future source of truth for server data, so there is no reason to invent a global store first.
- Premature abstractions would hide the exact React Native CLI friction this project is meant to expose.

## If This Became a Real Product

The first expansion points would be:

- a real API layer with authenticated requests
- persistent receipt history and error recovery
- production-grade upload handling and permission UX
- analytics, logging, and stronger crash reporting
- broader automated test coverage for flows and edge cases

## Intentional Technical Debt

These trade-offs are expected for the prototype phase:

- The Day 2 upload path uses a mock `axios` adapter instead of a real backend, so upload success and failure are deterministic practice flows rather than production networking.
- Networking, navigation, validation, and list behavior remain intentionally simple even after implementation because the goal is confidence, not completeness.

## Reference Documents

- [`BLUEPRINT.md`](./BLUEPRINT.md): the detailed sprint plan and non-negotiable scope
- [`AGENTS.md`](./AGENTS.md): repository guidelines for automated contributors
- [`CLAUDE.md`](./CLAUDE.md): assistant-facing project context and working rules
