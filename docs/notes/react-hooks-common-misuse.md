# React Hooks Misuse Notes

This note documents common React hook misuse patterns that frequently trigger React Compiler or `eslint-plugin-react-hooks` diagnostics, or lead to subtle rendering bugs in React / React Native codebases.

Use this as a pre-merge checklist when changing components, hooks, timers, subscriptions, forms, or memoization.

---

## 1. Do Not Read `ref.current` During Render

Refs are for values React does not track for rendering. Reading `ref.current` during render can produce stale UI because React does not know that this value should trigger a re-render.

**Avoid:**

```tsx
const scale = React.useRef(new Animated.Value(1)).current;

return <Animated.View style={{ transform: [{ scale }] }} />;
```

**Prefer a lazy state initializer for stable objects used by render:**

```tsx
const [scale] = React.useState(() => new Animated.Value(1));

return <Animated.View style={{ transform: [{ scale }] }} />;
```

`useRef` is still appropriate for values that are only read or written outside render, such as guards used inside event handlers or effects.

```tsx
const didStartRef = React.useRef(false);

React.useEffect(() => {
  if (didStartRef.current) {
    return;
  }

  didStartRef.current = true;
  startWork();
}, []);
```

**Rule of thumb:** if a value affects JSX, styles, or memoized render output, do not hide it in `ref.current`.

---

## 2. Do Not Call `setState` Synchronously Inside an Effect

Effects are for synchronizing with external systems. Calling `setState` directly at the top of an effect body forces an immediate extra render and often indicates that the value should have been derived during render instead.

**Avoid:**

```tsx
const [display, setDisplay] = React.useState(0);

React.useEffect(() => {
  setDisplay(0);

  const timer = setInterval(() => {
    setDisplay(prev => Math.min(prev + step, target));
  }, 30);

  return () => clearInterval(timer);
}, [target, step]);
```

**Prefer deriving the initial rendered value from keyed state:**

```tsx
const [displayState, setDisplayState] = React.useState(() => ({
  target,
  value: 0,
}));

const display = displayState.target === target ? displayState.value : 0;

React.useEffect(() => {
  const timer = setInterval(() => {
    setDisplayState(prev => {
      const currentValue = prev.target === target ? prev.value : 0;
      const next = currentValue + step;

      return {
        target,
        value: next >= target ? target : next,
      };
    });
  }, 30);

  return () => clearInterval(timer);
}, [target, step]);
```

Updating state from an external callback, such as a timer, subscription callback, animation completion callback, or network response, is fine. The problematic pattern is resetting state synchronously as soon as the effect runs.

---

## 3. Do Not Call React Hook Form `watch()` During Render for Aggregate UI

The `watch()` function returned by `useForm()` can cause broad re-renders and is not a good fit when render output depends on current form values across the form. Use `useWatch()` for render-time subscriptions.

**Avoid:**

```tsx
const { control, watch } = useForm<FormValues>({
  defaultValues,
});

const watchedValues = watch();
const answeredCount = Object.values(watchedValues).filter(v => v !== '').length;
```

**Prefer:**

```tsx
const { control } = useForm<FormValues>({
  defaultValues,
});

const watchedValues = useWatch({
  control,
  defaultValue: defaultValues,
});

const answeredCount = Object.values(watchedValues).filter(v => v !== '').length;
```

Values and handlers provided by `Controller` render props are still appropriate for field-level UI. Use `useWatch()` or `useFormState()` for aggregate UI such as progress indicators, validation summaries, or submit button state.

If you only need a one-time read outside render logic, prefer `getValues()` over subscribing the component to form changes.

---

## 4. Do Not Call Hooks Conditionally, in Loops, or in Nested Functions

Hooks must be called in the same order on every render. Do not place hooks inside `if`, `for`, callbacks, or after early returns.

**Avoid:**

```tsx
function Profile({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return null;
  }

  const [name, setName] = React.useState('');
  return <Text>{name}</Text>;
}
```

**Prefer:**

```tsx
function Profile({ enabled }: { enabled: boolean }) {
  const [name, setName] = React.useState('');

  if (!enabled) {
    return null;
  }

  return <Text>{name}</Text>;
}
```

**Also avoid:**

```tsx
items.map(item => {
  const value = React.useMemo(() => compute(item), [item]);
  return <Row key={item.id} value={value} />;
});
```

**Prefer extracting a child component:**

```tsx
function ItemRow({ item }: { item: Item }) {
  const value = React.useMemo(() => compute(item), [item]);
  return <Row value={value} />;
}

return items.map(item => <ItemRow key={item.id} item={item} />);
```

**Important exception:** the new React `use(...)` API is special and may be called conditionally, but normal hooks such as `useState`, `useEffect`, `useMemo`, and `useCallback` still must follow the standard rules.

---

## 5. Do Not Omit Dependencies to “Control” When an Effect Runs

If an effect reads a reactive value, that value belongs in the dependency array. Omitting dependencies creates stale closures: the effect continues using old props or state.

**Avoid:**

```tsx
React.useEffect(() => {
  const id = setInterval(() => {
    sendHeartbeat(userId);
  }, intervalMs);

  return () => clearInterval(id);
}, []); // missing userId, intervalMs
```

This looks stable, but it freezes the initial values captured by the closure.

**Prefer:**

```tsx
React.useEffect(() => {
  const id = setInterval(() => {
    sendHeartbeat(userId);
  }, intervalMs);

  return () => clearInterval(id);
}, [userId, intervalMs]);
```

If adding a dependency causes the effect to run too often, that usually means the effect is doing too much or a function/object dependency is unstable. Fix the structure first instead of suppressing `exhaustive-deps`.

---

## 6. Do Not Use Effects to Derive Values That Can Be Computed During Render

If a value can be calculated from props, state, or form values during render, do not store it in separate state and recalculate it in an effect. This adds extra renders and risks de-synchronization.

**Avoid:**

```tsx
const [fullName, setFullName] = React.useState('');

React.useEffect(() => {
  setFullName(`${firstName} ${lastName}`.trim());
}, [firstName, lastName]);
```

**Prefer:**

```tsx
const fullName = `${firstName} ${lastName}`.trim();
```

**Another common example:**

```tsx
const [visibleItems, setVisibleItems] = React.useState<Item[]>([]);

React.useEffect(() => {
  setVisibleItems(items.filter(item => item.visible));
}, [items]);
```

**Prefer:**

```tsx
const visibleItems = React.useMemo(
  () => items.filter(item => item.visible),
  [items],
);
```

Use state only when the value changes independently over time or is updated by external events.

---

## 7. Do Not Use an Effect for Event-Driven Actions

Effects are for synchronization caused by rendering. User-triggered actions belong in event handlers, not in effects that watch a flag.

**Avoid:**

```tsx
const [shouldSubmit, setShouldSubmit] = React.useState(false);

React.useEffect(() => {
  if (!shouldSubmit) {
    return;
  }

  submitForm();
}, [shouldSubmit]);

const onPress = () => {
  setShouldSubmit(true);
};
```

This splits one action across render and effect phases and makes control flow harder to reason about.

**Prefer:**

```tsx
const onPress = () => {
  submitForm();
};
```

A good test is simple: if the code should run because the user tapped a button, start from the event handler. If it should run because the component became visible or a subscription target changed, use an effect.

---

## 8. Be Careful with Function / Object Dependencies Created During Render

Objects and functions created during render have a new identity on every render. Depending on them directly can cause effects or memoization to re-run every time.

**Avoid:**

```tsx
const options = { roomId, serverUrl };

React.useEffect(() => {
  const connection = createConnection(options);
  connection.connect();

  return () => connection.disconnect();
}, [options]);
```

**Prefer either moving creation inside the effect:**

```tsx
React.useEffect(() => {
  const options = { roomId, serverUrl };
  const connection = createConnection(options);

  connection.connect();
  return () => connection.disconnect();
}, [roomId, serverUrl]);
```

**Or memoizing when identity itself matters:**

```tsx
const options = React.useMemo(
  () => ({ roomId, serverUrl }),
  [roomId, serverUrl],
);
```

Do not reach for `useMemo` or `useCallback` automatically. Use them when stable identity is actually required, not as a default response to every lint warning.

---

## 9. Do Not Use `useMemo` / `useCallback` for Correctness

`useMemo` and `useCallback` are performance hints, not semantic guarantees. Do not rely on them to make logic “work.”

**Avoid:**

```tsx
const value = React.useMemo(() => expensiveCreateInitialValue(prop), []);
```

This silently freezes the first `prop` forever.

**Prefer being explicit about intent:**

```tsx
const [value] = React.useState(() => expensiveCreateInitialValue(prop));
```

Or if the value should truly follow `prop`:

```tsx
const value = React.useMemo(() => expensiveCreateInitialValue(prop), [prop]);
```

Choose based on behavior, not based on which hook silences the lint rule.

---

## 10. Handle Async Effects with Cleanup or Cancellation

Async work started by an effect can complete after the component unmounts or after dependencies change. Without cleanup, later responses can overwrite newer state.

**Avoid:**

```tsx
React.useEffect(() => {
  let mounted = true;

  fetchProfile(userId).then(profile => {
    if (mounted) {
      setProfile(profile);
    }
  });

  return () => {
    mounted = false;
  };
}, [userId]);
```

This pattern is common, but ad-hoc mounted flags become fragile as logic grows.

**Prefer cancellation when possible:**

```tsx
React.useEffect(() => {
  const controller = new AbortController();

  async function run() {
    const profile = await fetchProfile(userId, {
      signal: controller.signal,
    });
    setProfile(profile);
  }

  run().catch(error => {
    if (error.name !== 'AbortError') {
      reportError(error);
    }
  });

  return () => controller.abort();
}, [userId]);
```

The key point is not “always use AbortController,” but “every async effect needs a stale-result strategy.”

---

## 11. Do Not Silence `eslint-plugin-react-hooks` Without Refactoring First

Warnings from `rules-of-hooks`, `exhaustive-deps`, or compiler-backed diagnostics usually indicate a structural issue, not an annoying style nit.

**Avoid:**

```tsx
// eslint-disable-next-line react-hooks/exhaustive-deps
React.useEffect(() => {
  syncSomething(value);
}, []);
```

**Prefer one of these fixes first:**

- Move event-driven logic into an event handler.
- Derive values during render instead of syncing them through state.
- Split one large effect into smaller effects with clearer dependencies.
- Move object / function creation into the effect.
- Extract a child component or custom hook.

Suppress only when the reasoning is explicit and documented.

---

## Component Checklist

- Do not read `someRef.current` in JSX, styles, memo dependencies, or effect dependencies.
- Use `useState(() => initialValue)` for stable objects that participate in render output.
- Do not reset state with `setState(...)` at the top level of an effect body.
- When a prop change should reset displayed state, derive the reset during render or include the prop in the state shape.
- Do not call hooks conditionally, in loops, in nested functions, or after early returns.
- Do not omit dependencies to control effect timing.
- Do not use effects to compute values that can be derived during render.
- Do not use effects for button-press or event-driven actions.
- Be careful with inline object / function dependencies that change identity every render.
- Use `useMemo` / `useCallback` for performance or stable identity needs, not as semantic fixes.
- Use `useWatch()` / `useFormState()` instead of broad `watch()` subscriptions for aggregate React Hook Form UI.
- Use `getValues()` for one-time reads that should not subscribe render output.
- Treat `eslint-plugin-react-hooks` warnings as design feedback first, not lint noise.
- Run at least `yarn eslint <changed-file>` after changing a component.
