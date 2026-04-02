# Style and conventions

- Language: TypeScript in a React Native CLI app.
- Formatting: Prettier with single quotes, trailing commas, and no forced parens for single-arg arrows.
- Linting: ESLint extends `@react-native`.
- Indentation: 2 spaces.
- Components: prefer functional components.
- Naming: React components and screen files in PascalCase; hooks in camelCase with `use` prefix; tests as `*.test.tsx`.
- Styles: keep shared styles in `StyleSheet.create` near the component unless reuse is obvious.
- Architecture: avoid over-engineering, avoid global state first, avoid duplicating server state, avoid premature shared component extraction.
- State rules: server state belongs in TanStack Query once introduced; temporary screen state belongs in `useState` or `useReducer`.
