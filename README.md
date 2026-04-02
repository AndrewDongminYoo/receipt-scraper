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

The repository is still near the start of the sprint.

- Day 0 is effectively complete: the React Native 0.84.1 app runs on both iOS and Android.
- `App.tsx` currently renders a minimal placeholder screen wrapped in `SafeAreaProvider`.
- `src/` has been scaffolded with placeholder directories, but the actual product flow has not been implemented yet.
- The only non-core runtime dependency currently in use is `react-native-safe-area-context`.

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

### Installed Today

| Package                          | Purpose               |
| -------------------------------- | --------------------- |
| `react-native`                   | Core mobile framework |
| `react`                          | UI runtime            |
| `react-native-safe-area-context` | Safe area handling    |
| `typescript`                     | Type checking         |

### Planned Later

Only add dependencies when the corresponding day requires them.

| Package                                                       | Planned Day | Purpose                  |
| ------------------------------------------------------------- | ----------- | ------------------------ |
| `@react-navigation/native` + `@react-navigation/native-stack` | Day 1       | Navigation               |
| `axios`                                                       | Day 2       | HTTP client              |
| `react-native-image-picker`                                   | Day 2       | Camera or gallery access |
| `@tanstack/react-query`                                       | Day 3       | Server state             |
| `react-hook-form`                                             | Day 4       | Form handling            |
| `zod`                                                         | Day 4       | Validation               |

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

Target `src/` layout:

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

The structure should grow with the features. Empty folders are not the goal; working flows are.

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

- The `src/` structure is scaffolded early and may need trimming or reshaping once real feature code exists.
- The app currently has no real feature flow yet, so the documentation leads the implementation rather than reflecting completed product behavior.
- Networking, navigation, validation, and list behavior will remain intentionally simple even after implementation because the goal is confidence, not completeness.

## Reference Documents

- [`BLUEPRINT.md`](./BLUEPRINT.md): the detailed sprint plan and non-negotiable scope
- [`AGENTS.md`](./AGENTS.md): repository guidelines for automated contributors
- [`CLAUDE.md`](./CLAUDE.md): assistant-facing project context and working rules
