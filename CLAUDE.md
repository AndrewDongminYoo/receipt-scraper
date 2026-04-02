# CLAUDE.md

## Project Overview

`receipt-scraper` is a React Native CLI practice project. The goal is to rebuild hands-on RN CLI muscle memory in 5 days by building a minimal receipt rewards mini-clone app. See `BLUEPRINT.md` for the full plan.

The schedule keeps the repository's existing `Day 0` through `Day 5` labels. Treat `Day 0` as the setup reset phase and `Day 1` through `Day 5` as the delivery sequence.

This is **not** a production app. Decisions should favour speed of execution and learning over correctness of architecture. The primary metric is: does it run on both iOS and Android by end of day?

---

## Current State

- **Phase**: Day 0 complete — basic RN 0.84.1 template running on iOS and Android.
- `App.tsx` renders a minimal placeholder screen inside `SafeAreaProvider`. No `src/` directory exists yet.
- Runtime dependencies are still close to the template baseline. The only app-level addition beyond core React Native is `react-native-safe-area-context`.

---

## Tech Stack

### Installed

| Package                          | Scope | Purpose          |
| -------------------------------- | ----- | ---------------- |
| `react-native` 0.84.1            | prod  | Core framework   |
| `react` 19.2.3                   | prod  | UI runtime       |
| `react-native-safe-area-context` | prod  | Safe area insets |
| `typescript` 5.8.3               | dev   | Type checking    |

### Planned (add only when the day's scope requires it)

| Package                                                       | Day   | Purpose                      |
| ------------------------------------------------------------- | ----- | ---------------------------- |
| `@react-navigation/native` + `@react-navigation/native-stack` | Day 1 | Stack navigation             |
| `@tanstack/react-query`                                       | Day 3 | Server state / data fetching |
| `react-hook-form`                                             | Day 4 | Form handling                |
| `zod`                                                         | Day 4 | Schema validation            |
| `axios`                                                       | Day 2 | HTTP client                  |
| `react-native-image-picker`                                   | Day 2 | Camera / gallery             |

Do not install any of these ahead of schedule.

---

## Target Folder Structure

```log
src/
  api/          # axios instance, endpoint functions
  components/   # shared UI (extract only after 3+ usages)
  features/
    receipts/   # upload, list
    survey/     # form screens
    rewards/    # result screen
  navigation/   # stack navigator, param types
  screens/      # top-level screen components
  types/        # shared TypeScript interfaces
  utils/        # pure helpers
```

Move code into `src/` as each day's feature is built. Do not create empty directories in advance.

---

## Development Principles

These come directly from `BLUEPRINT.md` and must be followed:

1. **Implementation over study** — If something is unclear, try it. Do not read docs for more than 10 minutes before writing code.
2. **Minimum structure first** — Start with the simplest thing that works. Refactor only when duplication is obvious (3+ occurrences).
3. **Daily verifiability** — Every day's work must produce something tappable on both iOS and Android simulators before closing.
4. **Done criteria are non-negotiable** — Each day has explicit Done conditions in `BLUEPRINT.md`. Meeting them is sufficient; exceeding them is waste.

---

## State Management Rules

| Data type                                       | Where it lives                                           |
| ----------------------------------------------- | -------------------------------------------------------- |
| Server data (receipts, survey results)          | TanStack Query cache only                                |
| Screen-local UI state (loading, selected image) | `useState` / `useReducer`                                |
| Shared UI state (toasts, modals)                | `useState` in the nearest common ancestor                |
| Global app state                                | Introduce only when local state is provably insufficient |

**Never** copy TanStack Query data into Zustand or React Context. The query cache is the single source of truth for server state.

---

## Anti-Patterns

Do not suggest or introduce any of the following:

- Redux, Redux Toolkit, MobX, or any flux-based state library
- Clean Architecture layers (domain, data, presentation)
- Dependency injection containers
- Monorepo tooling
- Design system or token-based styling
- Zustand or app-wide Context for server state
- Abstract base classes or generic repository patterns
- Global error boundaries wrapping every screen independently
- Over-splitting folders before the feature exists

---

## Build & Run

```bash
yarn start          # Metro bundler
yarn ios            # iOS simulator
yarn android        # Android emulator
yarn lint           # ESLint
yarn test           # Jest
```

iOS first-time or after native dependency changes:

```bash
bundle install                  # install CocoaPods gem (once)
bundle exec pod install         # run from ios/ after native dep changes
```

Broad quality check (if Trunk CLI is installed):

```bash
trunk check
```

---

## Commit Convention

Conventional Commits with gitmoji. Examples from this repo:

```log
feat: ✨ add receipt upload screen
fix: 🐛 prevent duplicate upload on rapid tap
chore: 🔨 add cspell linter
style: 💄 apply consistent formatting
```

Subject line: imperative mood, scoped to one change. No trailing period.

---

## Flutter → RN Mental Model Shifts

When assisting with this project, keep these RN-specific nuances in mind:

- `Info.plist`, `Podfile`, and Gradle config are exposed directly — treat them as first-class files.
- Package quality varies widely; check GitHub Issues, not just the README.
- `FlatList` `keyExtractor` must be stable; avoid index-based keys.
- Debugging spans JS console, Metro, Xcode logs, and Android Studio simultaneously.
- Image permissions differ between iOS and Android and between SDK versions — handle both explicitly.
