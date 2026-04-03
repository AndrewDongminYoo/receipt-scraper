# Repository Guidelines

## Project Structure & Module Organization

This repository is a React Native CLI app written in TypeScript. The current JS entrypoints are `index.js` and `App.tsx`; keep new product code moving toward the evolving `src/` layout described in `BLUEPRINT.md` (`src/api`, `src/components`, `src/features`, `src/navigation`, `src/screens`, `src/types`, `src/utils`). Do not create empty directories upfront just to match the target shape. Put platform-specific changes under `android/` or `ios/` only when they cannot live in shared TS code. Tests live in `__tests__/`. App icons and native assets live in `android/app/src/main/res/` and `ios/receiptScraper/Images.xcassets/`.

## Build, Test, and Development Commands

Use Yarn from the repo root:

- `yarn start`: start the Metro bundler.
- `yarn android`: build and launch the Android app.
- `yarn ios`: build and launch the iOS app.
- `yarn lint`: run ESLint across the repo.
- `yarn test`: run Jest tests.

For iOS setup, run `bundle install` once, then `bundle exec pod install` in `ios/` after native dependency changes. If Trunk CLI is installed, `trunk check` is the broadest quality pass.

## Coding Style & Naming Conventions

Follow the repo formatter and lint config: Prettier uses single quotes, trailing commas, and no forced parens for single-arg arrows; ESLint extends `@react-native`. Use 2-space indentation and prefer functional components. Name React components and screen files in `PascalCase`, hooks in `camelCase` with a `use` prefix, and test files as `*.test.tsx`. Keep shared styles in `StyleSheet.create` near the component unless reuse is obvious.

## Testing Guidelines

Jest uses the React Native preset (`jest.config.js`) with `@testing-library/react-native` as the primary test API. Keep `react-test-renderer` installed only because `@testing-library/react-native` requires it as a peer dependency; do not write new tests against the renderer API directly. Add or update tests in `__tests__/` for any behavioral change, and keep test names descriptive, for example `ReceiptListScreen.test.tsx`. Prefer assertions on visible text, enabled/disabled state, and user-observable screen behavior over reading component props. At minimum, run `yarn test` and `yarn lint` before opening a PR. There is no published coverage threshold yet, so contributors should treat new UI states and navigation flows as required test targets.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commits with gitmoji, for example `feat: ✨ add adaptive icon support` and `chore: 🔨 add cspell linter`. Keep subjects imperative and scoped to one change. PRs should include a short summary, linked issue or task when available, platforms tested (`iOS`, `Android`), and screenshots or recordings for visible UI changes.

## Project Blueprint & Phase Context

This project follows a 5-day plan defined in `BLUEPRINT.md` to rebuild React Native CLI muscle memory before starting a new job. The goal is a receipt rewards mini-clone app — not a portfolio piece, but a working prototype.

The plan keeps the repository's existing `Day 0` through `Day 5` labels. Treat `Day 0` as the environment reset phase and `Day 1` through `Day 5` as the feature delivery sequence.

The implementation order is fixed and must not change:

1. Environment setup (Day 0)
2. Navigation skeleton — 5 screens (Day 1)
3. Image selection + upload flow (Day 2)
4. Receipt list with TanStack Query (Day 3)
5. Survey form + reward result (Day 4)
6. Polish and cleanup (Day 5)

**Current tech stack**:

- `@react-navigation/native` + `@react-navigation/native-stack` — navigation
- `@tanstack/react-query` — server state
- `react-hook-form` + `zod` — form validation
- `axios` — HTTP client
- `react-native-image-picker` — camera / gallery access

Keep the dependency surface minimal. Do not introduce another library unless it is required for the current day's scope.

## Anti-Patterns to Avoid

The following are explicitly banned during this project (from `BLUEPRINT.md`):

- **Over-engineering the structure upfront** — Do not start with Redux, Clean Architecture, DI containers, design systems, or monorepo tooling.
- **Global state first** — Do not reach for Zustand or Context until local `useState`/`useReducer` is clearly insufficient. Server state belongs in TanStack Query, not in any store.
- **Duplicating server state** — Never copy TanStack Query data into local or global state. The query cache is the source of truth.
- **UI polish over flow** — The app must run end-to-end before any styling pass.
- **Library bikeshedding** — Pick a reasonable library and move on. Do not compare alternatives for longer than it takes to read the README.
- **Extracting shared components early** — Only extract a component when it appears in three or more places.
