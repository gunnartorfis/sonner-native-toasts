# Plan 006: Add component render tests for `Toaster` / `Toast` (close the highest-churn coverage gap)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> This is the largest plan in the set and the harness is the risky part. Read
> the whole plan before writing code. Land plans 002 and 003 first so the unit
> suite is already green (soft dependency — they make failures here easy to
> attribute).
>
> **Drift check (run first)**: `git diff --stat 2c3ff4c..HEAD -- src/toaster.tsx src/toast.tsx src/__tests__/setup.ts package.json`
> If any changed since this plan was written, re-read them before proceeding; on
> a structural mismatch with the excerpts below, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: MED
- **Depends on**: 002, 003 (soft — green suite first)
- **Category**: tests
- **Planned at**: commit `2c3ff4c`, 2026-06-16

## Why this matters

Every existing test (`src/__tests__/*`) is a pure-function unit test of the store
and the position/animation math. The two largest and most-changed files —
`src/toast.tsx` (689 LOC, 27 changes in recent history) and `src/toaster.tsx`
(256 LOC, 15 changes) — have **zero render-level coverage**. That's exactly the
code most likely to regress (it changes most often) and the hardest to verify by
reading. This plan adds a small, robust component-render harness and a first set
of tests that exercise the store→Toaster→Toast render path: a toast appears when
`toast()` is called, its title/description render, and dismissing removes it.

The goal is a **reliable foothold**, not exhaustive coverage. It establishes the
pattern; later plans can extend it.

## Current state

- **No component-test tooling**: `package.json` `devDependencies` has no
  `@testing-library/react-native` and no `react-test-renderer`. The Jest preset
  is `react-native` (`package.json` `jest.preset`).
- **Heavy global mocks already exist** in `src/__tests__/setup.ts` and are relied
  on by all 8 current test files. It mocks `react-native` (View/Text/Pressable as
  passthrough function components, `Dimensions`, `StyleSheet`, `Platform`),
  `react-native-reanimated` (Animated.View passthrough + hook stubs),
  `react-native-safe-area-context`, and `react-native-gesture-handler`. It does
  **NOT** mock `react-native-screens` or `react-native-svg`.
  - `react()` is NOT globally mocked in setup.ts (only `toast-store.test.ts`
    mocks `React.createRef` locally).
- **Components that a Toaster render pulls in** (so their modules must resolve
  under Jest):
  - `src/toaster.tsx:3` imports `FullWindowOverlay` from `react-native-screens`
    and uses it on iOS (`Platform.OS === 'ios'`; the mock sets `Platform.OS:
    'ios'`). → needs a `react-native-screens` mock.
  - `src/toast.tsx` imports icons from `src/icons.tsx`, which renders
    `react-native-svg`. → needs a `react-native-svg` mock.
  - `src/toast.tsx` calls `useWindowDimensions()` only if plan 005 landed; if 005
    has NOT landed it uses `Dimensions.get('window')` (already mocked). Either
    way, ensure `useWindowDimensions` is mocked (plan 005 adds it; if absent, add
    it here).
- **The store is a module singleton** (`export const toastStore`). Render tests
  must reset it between cases. The pattern is in `src/__tests__/toast-store.test.ts`
  (top of file): reassign `toastStore['state'] = { …initial… }`, reset
  `toastStore['subscribers'] = new Set()`, etc., in `beforeEach`, and
  `toastStore.dismissToast(undefined)` in `afterEach`.
- **Public API**: `toast('msg', opts)` and `toast.dismiss(id?)`
  (`src/toast-fns.ts`) drive the store; `<Toaster />` subscribes via
  `useSyncExternalStore` (`src/toaster.tsx:36`). `Toast` renders `title` in a
  `Text` and `description` in a `Text` when present (`src/toast.tsx:507-526`).

**Convention to follow**: tests are Jest, fake timers (set in `setup.ts`),
strict TS with `as const` on literals. New component tests are `.tsx`. Keep new
mocks minimal and additive; do not alter the existing mock shapes that current
tests depend on.

## Commands you will need

| Purpose             | Command                                          | Expected on success |
|---------------------|--------------------------------------------------|---------------------|
| Install             | `pnpm install`                                   | exit 0              |
| Add dev deps        | `pnpm add -D react-test-renderer@19.2.0`         | exit 0; lockfile updated |
| Run new test only   | `pnpm test src/__tests__/toaster.test.tsx`       | all pass            |
| Full test           | `pnpm test`                                       | all pass (existing + new) |
| Typecheck           | `pnpm typecheck`                                  | exit 0              |
| Lint                | `pnpm lint`                                        | exit 0              |

`react-test-renderer` must match the installed React version. `package.json`
pins `react@19.2.0`, so use `react-test-renderer@19.2.0`. If `pnpm` resolves a
mismatch, STOP and report rather than forcing a version.

## Scope

**In scope** (the only files you may create/modify):
- `package.json` (add `react-test-renderer` to `devDependencies`; also add
  `@types/react-test-renderer` if typecheck requires it).
- `pnpm-lock.yaml` (updated by `pnpm add`).
- `src/__tests__/setup.ts` (add `react-native-screens`, `react-native-svg`, and
  `useWindowDimensions` mocks — additive only).
- `src/__tests__/toaster.test.tsx` (create — the new tests).

**Out of scope** (do NOT touch):
- `@testing-library/react-native` — do NOT introduce it in this plan. It expects
  the preset's real host components and would conflict with the existing global
  `react-native` mock that all current tests depend on. Use `react-test-renderer`
  against the existing passthrough mocks instead. (Migrating the whole test infra
  to RTL is a separate, larger decision — see Maintenance notes.)
- Any `src/**` source file — this plan adds tests and mocks only; it must not
  change library behavior. If a component cannot be rendered without a source
  change, that's a STOP condition.
- The existing mock shapes in `setup.ts` (only ADD new module mocks / keys).

## Git workflow

- Branch: `advisor/006-component-render-tests`.
- Commit message (Conventional Commits), e.g.:
  `test: add component render tests for Toaster and Toast`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the renderer dependency

Run `pnpm add -D react-test-renderer@19.2.0`. If `pnpm typecheck` later complains
about missing types, also run `pnpm add -D @types/react-test-renderer@19.x`
(matching the major).

**Verify**: `pnpm install` → exit 0; `node -e "require('react-test-renderer')"`
→ no error.

### Step 2: Extend the test mocks (additive)

In `src/__tests__/setup.ts`, add the following mocks. Place them next to the
existing `jest.mock(...)` calls. Do not modify existing entries except to add the
`useWindowDimensions` key if it isn't already present.

- Ensure the `react-native` mock returns `useWindowDimensions`:
  ```ts
  // inside the existing jest.mock('react-native', () => ({ ... }))
  useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
  ```
  (If plan 005 already added this, leave it.)

- Mock `react-native-screens` so `FullWindowOverlay` is a passthrough:
  ```ts
  jest.mock('react-native-screens', () => ({
    FullWindowOverlay: ({ children }: { children?: React.ReactNode }) => children,
  }));
  ```

- Mock `react-native-svg` as passthrough components (icons use `Svg`, `Path`,
  `Circle`, etc.; inspect `src/icons.tsx` for the exact set and mock those used):
  ```ts
  jest.mock('react-native-svg', () => {
    const Passthrough = ({ children }: { children?: React.ReactNode }) => children ?? null;
    return {
      __esModule: true,
      default: Passthrough,   // <Svg> default import
      Svg: Passthrough,
      Path: Passthrough,
      Circle: Passthrough,
      // add any other svg primitives imported by src/icons.tsx
    };
  });
  ```
  First read `src/icons.tsx` and mock exactly the svg exports it imports — no
  more, no less.

**Verify**: `pnpm test` → the existing 8 test files still pass (the new mocks are
additive and shouldn't affect them).

### Step 3: Write `src/__tests__/toaster.test.tsx`

Create the file. Use `react-test-renderer`'s `create` with React's `act` (imported
from `'react'`, not `'react-test-renderer'`). Reset the store
singleton between tests exactly as `toast-store.test.ts` does. Outline:

```tsx
import * as React from 'react';
import { act } from 'react'; // React 19: import act from 'react', not 'react-test-renderer'
import TestRenderer from 'react-test-renderer';
import { Toaster } from '../toaster';
import { toast } from '../toast-fns';
import { toastStore } from '../toast-store';

const resetStore = () => {
  toastStore['state'] = {
    toasts: [],
    toastsById: new Map(),
    toastsCounter: 1,
    toastRefs: {},
    shouldShowOverlay: false,
    toastTimers: {},
    toastHeights: {},
    toastHeightsVersion: 0,
    isExpanded: false,
  };
  toastStore['config'] = {};
  toastStore['subscribers'] = new Set();
  toastStore['promiseResolvers'] = new Map();
  // Clear the timer/cooldown handles too, so a prior test's scheduleHideOverlay /
  // collapse cooldown doesn't leak a stale handle into the next test.
  toastStore['hideOverlayTimeout'] = null;
  toastStore['collapseCooldown'] = false;
  toastStore['collapseCooldownTimeout'] = null;
};

// helper: collect all rendered string children in the tree
const textOf = (instance: TestRenderer.ReactTestRenderer): string => {
  return JSON.stringify(instance.toJSON());
};

describe('Toaster (render)', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllTimers();
  });
  afterEach(() => {
    act(() => {
      toastStore.dismissToast(undefined);
    });
  });

  it('renders nothing notable when there are no toasts', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Toaster />);
    });
    // no toast titles present
    expect(textOf(renderer)).not.toContain('Hello world');
  });

  it('renders a toast title after toast() is called', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Toaster />);
    });
    act(() => {
      toast('Hello world');
    });
    expect(textOf(renderer)).toContain('Hello world');
  });

  it('renders the description when provided', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Toaster />);
    });
    act(() => {
      toast('Title here', { description: 'Some description' });
    });
    const json = textOf(renderer);
    expect(json).toContain('Title here');
    expect(json).toContain('Some description');
  });

  it('removes the toast after dismiss', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Toaster />);
    });
    let id: string | number = '';
    act(() => {
      id = toast('Dismiss me');
    });
    expect(textOf(renderer)).toContain('Dismiss me');
    act(() => {
      toast.dismiss(id);
    });
    // allow the scheduled overlay-hide / state update to flush
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(textOf(renderer)).not.toContain('Dismiss me');
  });
});
```

Notes for the executor:
- The `textOf` helper serializes the rendered tree to a string and asserts on
  substrings. This is deliberately robust to the passthrough-mock structure
  (which doesn't produce real host elements). If `toJSON()` returns `null` for an
  empty Toaster, that's fine — the "not.toContain" assertions still hold.
- Wrap **every** state mutation (`TestRenderer.create`, `toast(...)`,
  `toast.dismiss(...)`, timer flushes) in `act(...)` to avoid React "not wrapped
  in act" warnings and to flush `useSyncExternalStore` updates.
- If `toJSON()` shape makes substring assertions unreliable, switch to
  `renderer.root.findAll(node => node.children.includes('Hello world'))` or
  `findAllByType` against the mocked `Text` — but prefer the simple string
  approach first.

**Verify**: `pnpm test src/__tests__/toaster.test.tsx` → all 4 cases pass.

### Step 4: Full verification

**Verify**:
- `pnpm test` → all pass (existing 8 files + the new one).
- `pnpm typecheck` → exit 0.
- `pnpm lint` → exit 0.

## Test plan

- New file `src/__tests__/toaster.test.tsx` with the 4 cases above: empty render,
  title renders after `toast()`, description renders, dismiss removes it.
- Structural pattern: store reset/teardown from
  `src/__tests__/toast-store.test.ts`; rendering via `react-test-renderer`.
- This is the **foothold**. Explicitly deferred (do not attempt here): variant
  icon rendering, swipe-gesture simulation, stacking layout, `ToastWrapper`/
  `ToasterOverlayWrapper` paths. Record them in Maintenance notes as next steps.
- Verification: `pnpm test` green including the new file.

## Done criteria

ALL must hold:

- [ ] `react-test-renderer` (version-matched to React) is in
      `package.json` devDependencies and `pnpm-lock.yaml`.
- [ ] `src/__tests__/setup.ts` mocks `react-native-screens`, `react-native-svg`,
      and provides `useWindowDimensions` — all additive; existing tests untouched.
- [ ] `src/__tests__/toaster.test.tsx` exists with ≥4 passing cases covering:
      empty, title-after-`toast()`, description, dismiss-removes.
- [ ] `pnpm test` passes for ALL test files (8 existing + new).
- [ ] `pnpm typecheck` exits 0; `pnpm lint` exits 0.
- [ ] No `src/**` source file (non-test) is modified (`git status` — only
      `src/__tests__/*` plus `package.json`/`pnpm-lock.yaml`).
- [ ] `plans/README.md` status row for 006 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- `react-test-renderer` cannot be installed at a version compatible with the
  pinned React, or `pnpm` reports a peer/version conflict.
- Rendering `<Toaster />` throws because a module can't resolve under Jest even
  after adding the screens/svg mocks (e.g. a deeper native import you can't mock
  without touching source) — report the exact failing import.
- Making a test pass would require editing a `src/**` source file (not a mock or
  test) — that's out of scope; report what change seemed necessary and why.
- The existing 8 test files start failing after your mock additions — report
  which and why; your additions were supposed to be purely additive.
- `react-test-renderer` is deprecated/unavailable in this toolchain such that the
  only viable path is `@testing-library/react-native` + a test-infra refactor —
  STOP and report; that decision is for the maintainer (see Maintenance notes).

## Maintenance notes

- **Why `react-test-renderer` and not `@testing-library/react-native`**: the repo
  globally mocks `react-native` with passthrough components that all current
  tests depend on. RTL expects real host components from the `react-native`
  preset, which conflicts with that global mock. Reusing the existing mocks with
  `react-test-renderer` avoids a risky test-infra rewrite. If the team later wants
  RTL ergonomics (queries, `fireEvent`), the clean path is a **separate Jest
  project** for component tests that does *not* load the global mock — that's a
  deliberate, larger change to propose on its own, not to sneak in here.
- Next coverage to add once this foothold is stable: variant→icon mapping
  (`ToastIcon`), `closeButton`/`dismissible` rendering of `CloseButton`,
  `toast.promise` loading→success transition, and (with plan 005's reactive
  width) a swipe-threshold test that changes mocked dimensions.
- A reviewer should scrutinize that the new mocks in `setup.ts` are additive and
  that no source file changed (the diff should be tests + manifest only).
