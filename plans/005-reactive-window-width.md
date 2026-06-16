# Plan 005: Read window width reactively via `useWindowDimensions` (fix stale `Dimensions.get`)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2c3ff4c..HEAD -- src/gestures.tsx src/toast.tsx src/__tests__/setup.ts src/__tests__/gestures.test.ts`
> If any changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as a
> STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `2c3ff4c`, 2026-06-16

## Why this matters

The library reads the screen width from `Dimensions.get('window')` in two places
that never react to orientation/size changes:

- `src/gestures.tsx:17` captures `WINDOW_WIDTH` **once at module load**. After a
  rotation, fold/unfold, split-screen resize, or simply launching the gesture
  code in a different orientation than at import time, the value is stale.
- `src/toast.tsx:212` and `:374` call `Dimensions.get('window')` during
  render/handler, which is also non-reactive (a dimension change doesn't trigger
  a re-render, so the value used can lag the real screen).

The stale width feeds the **left-swipe dismiss threshold** (`WINDOW_WIDTH * 0.25`),
the **swipe-away animation target** (`-WINDOW_WIDTH`), the **opacity interpolation**
during swipe, and the **stacking scale-X narrowing** (`narrowAmount / screenWidth`).
On tablets, foldables, and any app that rotates, these become wrong after the
first orientation change — swipe feels mis-calibrated or toasts animate off by the
wrong distance. The fix is to read width via React Native's reactive
`useWindowDimensions()` hook so the values track the current screen.

## Current state

**`src/gestures.tsx`** (module-level constant + worklet usages):

```ts
import { Dimensions, Platform, type ViewStyle } from 'react-native';
...
const { width: WINDOW_WIDTH } = Dimensions.get('window');
```

`WINDOW_WIDTH` is used inside worklets:
- `.onFinalize` (left): `const threshold = -WINDOW_WIDTH * 0.25;` and
  `translate.value = withTiming(-WINDOW_WIDTH, { ... }, …)`.
- `.onFinalize` (up): `translate.value = withTiming(-WINDOW_WIDTH, { ... }, …)`.
- `useAnimatedStyle`: `interpolate(translate.value, [0, direction === 'left' ? -WINDOW_WIDTH : -60], [1, 0])`.
  Its dependency array is `[direction, translate]`.

The component already re-creates `pan`/`tap` gestures and `useAnimatedStyle` on
every render, so closing over a reactive value is safe.

**`src/toast.tsx`**:

```ts
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  Text,
  View,
  type ViewProps,
} from 'react-native';
...
    // ScaleX: visual narrowing avoids layout-width changes that cause text rewrap
    const screenWidth = Dimensions.get('window').width;     // line ~212
    const stackScaleX = useDerivedValue(() => { ... }, [
      enableStacking, numberOfToasts, index, toastPosition, isExpanded, stackGap,
      screenWidth,                                           // already a dep
    ]);
```

and inside `onSwipePress` (a `useCallback`):

```ts
          if (
            isPressNearCloseButton({
              x,
              viewWidth: Dimensions.get('window').width,     // line ~374
            })
          ) {
```

The `onSwipePress` `useCallback` dependency array (line ~389) does **not**
currently include a width value.

**`src/__tests__/setup.ts`** mocks `react-native` and currently exports
`Dimensions.get` but **not** `useWindowDimensions`. No existing test renders the
`Toast`/`ToastSwipeHandler` components, so the mock lacks the hook today.

**`src/__tests__/gestures.test.ts`** does NOT import the component — it re-creates
`elasticResistance` locally and tests its math. So changing `gestures.tsx`'s
imports/width source will not affect it.

**Convention to follow**: hooks are called unconditionally at the top of the
component (see the existing `useToastContext`, `useDynamicToastContext`,
`useSharedValue` calls in both files). Worklets close over plain JS values from
the component scope; values that drive an animated computation are listed in the
relevant dependency array (see `stackScaleX`'s deps).

## Commands you will need

| Purpose   | Command                                  | Expected on success |
|-----------|------------------------------------------|---------------------|
| Install   | `pnpm install`                           | exit 0              |
| Typecheck | `pnpm typecheck`                         | exit 0, no errors   |
| Tests     | `pnpm test`                              | all pass            |
| Lint      | `pnpm lint`                              | exit 0              |

This change is behavioral on a real device (rotation) and cannot be exercised by
the current unit suite; the gates here are typecheck/lint/test-still-green plus
the grep checks in Done criteria.

## Scope

**In scope** (the only files you may modify):
- `src/gestures.tsx`
- `src/toast.tsx`
- `src/__tests__/setup.ts` (add the `useWindowDimensions` mock)

**Out of scope** (do NOT touch):
- `src/__tests__/gestures.test.ts` — it tests pure math, unaffected.
- The swipe thresholds/animation *values* themselves (e.g. the `0.25`, `-60`,
  `0.8` constants) — only change where the width comes from, not the formulas.
- Any other `Dimensions` usage outside the two files above (verify with grep in
  Step 1 that there isn't any you'd miss).

## Git workflow

- Branch: `advisor/005-reactive-window-width`.
- Commit message (Conventional Commits), e.g.:
  `fix: use useWindowDimensions so swipe/stack width tracks rotation`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm the full set of `Dimensions.get('window')` call sites

**Verify**: `grep -rn "Dimensions.get('window')" src/` returns exactly the three
sites described above (`gestures.tsx:17`, `toast.tsx:212`, `toast.tsx:374`). If
there are others, STOP and report — this plan's scope assumed three.

### Step 2: Make `gestures.tsx` width reactive

1. Change the `react-native` import to drop `Dimensions` and add
   `useWindowDimensions`:
   ```ts
   import { Platform, useWindowDimensions, type ViewStyle } from 'react-native';
   ```
2. Delete the module-level line `const { width: WINDOW_WIDTH } = Dimensions.get('window');`.
3. Inside the `ToastSwipeHandler` component body (with the other hooks, near
   `const translate = useSharedValue(0);`), add:
   ```ts
   const { width: windowWidth } = useWindowDimensions();
   ```
4. Replace every `WINDOW_WIDTH` reference in the worklets with `windowWidth`
   (the left-swipe `threshold`, both `withTiming(-WINDOW_WIDTH, …)` targets, and
   the `interpolate` input range).
5. Add `windowWidth` to the `useAnimatedStyle` dependency array (it is currently
   `[direction, translate]` → `[direction, translate, windowWidth]`).

**Verify**:
- `grep -n "WINDOW_WIDTH" src/gestures.tsx` → no matches.
- `grep -n "useWindowDimensions" src/gestures.tsx` → match.
- `pnpm typecheck` → exit 0 (this will also flag any now-unused `Dimensions`
  import, since the config sets `noUnusedLocals`).

### Step 3: Make `toast.tsx` width reactive

1. Change the `react-native` import to drop `Dimensions` and add
   `useWindowDimensions`:
   ```ts
   import {
     ActivityIndicator,
     Pressable,
     Text,
     View,
     useWindowDimensions,
     type ViewProps,
   } from 'react-native';
   ```
2. Replace `const screenWidth = Dimensions.get('window').width;` (line ~212) with:
   ```ts
   const { width: screenWidth } = useWindowDimensions();
   ```
   (Keep the explanatory comment above it.)
3. In `onSwipePress`, replace `viewWidth: Dimensions.get('window').width` with
   `viewWidth: screenWidth`.
4. Add `screenWidth` to the `onSwipePress` `useCallback` dependency array.

**Verify**:
- `grep -n "Dimensions" src/toast.tsx` → no matches.
- `grep -n "useWindowDimensions" src/toast.tsx` → match.
- `pnpm typecheck` → exit 0.
- `pnpm lint` → exit 0 (confirms the `react-hooks/exhaustive-deps`-style checks
  and `noUnusedLocals` are satisfied; if lint flags a missing dep, add it).

### Step 4: Add `useWindowDimensions` to the test mock

In `src/__tests__/setup.ts`, inside the `jest.mock('react-native', () => { …
return { … } })` object, add (next to the existing `Dimensions` mock):

```ts
    useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
```

This keeps the mocked window size consistent with the existing
`Dimensions.get` mock (`{ width: 375, height: 812 }`) and makes the components
renderable for future component tests (plan 006).

**Verify**: `grep -n "useWindowDimensions" src/__tests__/setup.ts` → match.

### Step 5: Full verification

**Verify**:
- `pnpm test` → all pass (no behavioral test exists for this; the suite must stay
  green).
- `pnpm typecheck` → exit 0.
- `pnpm lint` → exit 0.

## Test plan

- No new unit test can meaningfully assert rotation behavior with the current
  pure-function suite (it would require rendering the component and simulating a
  dimensions change). Do **not** fabricate a test that just asserts the mock
  returns 375.
- The mock addition in Step 4 is the enabling change for plan 006 (component
  tests), which is where a rotation/threshold render test belongs. Leave a note
  for that plan rather than forcing a brittle test here.
- Verification is: existing suite stays green, and the grep-based Done criteria
  confirm the source no longer reads a non-reactive width.

## Done criteria

ALL must hold:

- [ ] `grep -rn "Dimensions.get('window')" src/gestures.tsx src/toast.tsx` → no
      matches.
- [ ] `grep -rn "useWindowDimensions" src/gestures.tsx src/toast.tsx` → a match
      in each file.
- [ ] `src/gestures.tsx` no longer has a module-level width constant
      (`grep -n "WINDOW_WIDTH" src/gestures.tsx` → no matches).
- [ ] `useWindowDimensions` is mocked in `src/__tests__/setup.ts`.
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm test` all pass.
- [ ] The swipe/scale formula constants are unchanged (only the width *source*
      changed) — confirm via `git diff` that no numeric thresholds were altered.
- [ ] No files outside the in-scope list are modified (`git status`).
- [ ] `plans/README.md` status row for 005 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- `grep` in Step 1 finds `Dimensions.get('window')` call sites beyond the three
  expected ones.
- After the change, `pnpm typecheck`/`pnpm lint` reports an error you cannot
  resolve by adding the missing dependency or removing the now-unused
  `Dimensions` import (e.g. a Reanimated typing complaint about closing over
  `windowWidth` in a worklet) — report the exact error.
- Any existing test starts failing (it shouldn't, since no test renders these
  components) — report which test and why.

## Maintenance notes

- `useWindowDimensions` re-renders the component on dimension changes; the
  gesture objects are re-created on render (already the case), so this does not
  change render-churn behavior on a static screen — only on actual rotations.
- A reviewer should confirm no formula constant changed and that `windowWidth`
  was added to the `useAnimatedStyle` deps (`gestures.tsx`) and the
  `onSwipePress` deps (`toast.tsx`) — a missing dep would re-introduce a (now
  hook-scoped) staleness.
- Follow-up deferred to plan 006: a component test that mounts `ToastSwipeHandler`,
  changes the mocked dimensions, and asserts the swipe threshold/animation target
  track the new width.
