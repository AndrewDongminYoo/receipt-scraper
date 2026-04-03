# Day 5 Polish Design

## Goal

Finish the prototype as a small but clearly shippable practice app without
expanding scope into production receipt capture. The Day 5 work should tighten
loading, empty, and error UX; remove obvious UI duplication; and document the
intentional boundary between the prototype and the future production pipeline.

## Approved Scope

### In Scope

- Normalize loading, empty, and error states across the existing Day 1-4 flow
- Extract only clearly reusable UI building blocks
- Add the missing reward-result fetch error and retry state
- Update README with current prototype limits, trade-offs, and next expansion
  points
- Record the production receipt capture pipeline as a follow-up item

### Out of Scope

- Native camera capture implementation
- Receipt corner detection or perspective flattening
- OCR engine selection or integration
- Backend payload changes beyond documentation
- Remote config integration beyond documentation

## Design Decisions

### 1. Extract only three shared UI primitives

The repeated patterns in the current screens are limited and clear enough for
three shared components:

- `ScreenHeader`: repeated title + description blocks on the main flow screens
- `SectionCard`: repeated bordered white cards used for upload steps, survey
  questions, and summary sections
- `StateCard`: repeated loading, empty, info, success, and error cards with
  optional actions

This keeps the refactor small and avoids turning the practice app into an early
design system.

### 2. Fix the reward-result error handling gap

`RewardResultScreen` currently handles loading, empty, and success states but
falls back to the empty state when the query fails. Day 5 should make that
failure explicit and give the user a retry path.

### 3. Keep upload behavior prototype-oriented

The current upload flow will remain library-image based. The README should say
this directly so the repository does not imply production readiness it does not
have.

### 4. Record the production receipt capture follow-up explicitly

The deferred production work should be documented with these approved
constraints:

- Primary goal: OCR extraction accuracy
- Processing preference: on-device OCR first
- Failure feedback: immediate feedback for capture failure, OCR failure,
  duplicate receipt response, and invalid receipt-category response
- Backend contract: upload flattened image, OCR result, capture timestamp, and
  only metadata available without extra permissions
- Stored image picker path: runtime-gated via Firebase Remote Config
- No confidence values or crop coordinates in the initial payload

## Testing Strategy

- Add a failing test for the missing reward-result error and retry behavior
- Keep existing upload, list, and survey flow tests green while refactoring
- Finish with repository-level `yarn test` and `yarn lint`
