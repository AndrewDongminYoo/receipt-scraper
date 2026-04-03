# Test Suite Guidelines

## Interaction Rules

- For React Native press interactions, use `userEvent.press` by default.
- Apply this to `Button`, `TouchableOpacity`, `Pressable`, and navigation buttons rendered from screen components.
- Only use `fireEvent.press` when the test must trigger a lower-level event that `userEvent` cannot express.

## Timer Rules

- If a suite presses React Native buttons or touchables, enable fake timers in `beforeEach` with `jest.useFakeTimers()`.
- Restore timer state in `afterEach` with `jest.clearAllTimers()` and `jest.useRealTimers()`.
- This keeps delayed `Animated(View)` updates inside the test boundary and prevents `act(...)` warnings from leaking into later tests.

## Warning Policy

- Do not hide `console.error` unless the suite also asserts that no `act(...)` warning was emitted.
- Treat `An update to Animated(View) inside a test was not wrapped in act(...)` as a test harness bug that must be fixed.

## Query Client

- For screens that depend on TanStack Query, use `renderWithQueryClient`.
- Keep timers, query state, and mocked implementations isolated per test.
