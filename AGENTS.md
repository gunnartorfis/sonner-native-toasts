# AGENTS.md

Guidance for humans and AI agents working in this repository. For contribution
etiquette and the PR process, see `CONTRIBUTING.md`; this file is the quick
reference for *how the code is built, checked, and structured*.

## What this is

`sonner-native` — an opinionated toast component for React Native, a port of
@emilkowalski's Sonner. Built on `react-native-reanimated` and
`react-native-gesture-handler`. The published package ships `src` + the built
`lib`; everything else (reanimated, gesture-handler, safe-area-context, screens,
svg, worklets) is a peer dependency.

## Repository layout

- Root — the library package.
- `example/` — Expo example app (the way to manually test changes).
- `docs/` — Docusaurus documentation site.

This is a **pnpm workspaces** monorepo. Use **pnpm** only — not npm or yarn.
Node version is pinned in `.nvmrc` (v22).

## Commands

Run from the repo root:

- `pnpm install` — install dependencies.
- `pnpm typecheck` — TypeScript (`tsc`, no emit). Must pass with zero errors.
- `pnpm lint` — ESLint over `**/*.{js,ts,tsx}`.
- `pnpm test` — Jest unit tests.
- `pnpm prepare` — build the library with `react-native-builder-bob`.
- `pnpm example start | android | ios | web` — run the example app.

Before considering any change complete: `pnpm typecheck`, `pnpm lint`, and
`pnpm test` must all pass. CI runs exactly these.

## TypeScript

Strict mode with extra checks: `noUncheckedIndexedAccess`, `noUnusedLocals`,
`noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`.

- `verbatimModuleSyntax` requires type-only imports to use `import type { … }`.
- `noUncheckedIndexedAccess` means indexed access (`arr[i]`, `record[key]`) is
  `T | undefined` — handle the `undefined` case (the codebase uses `!` only
  where the index is provably in range; prefer guards otherwise).

## Linting & formatting

- ESLint flat config (`eslint.config.ts`): `typescript-eslint` recommended +
  `eslint-plugin-react-hooks`.
- **Two rules are intentionally disabled — do not "fix" them:**
  - `react-hooks/globals` (off): module-level handlers are assigned during
    render to support the imperative `toast()` API.
  - `react-hooks/immutability` (off): some ref mutations (e.g. counters) are
    intentional.
- Prettier: single quotes, `trailingComma: 'es5'`, `tabWidth: 2`.
- Commits follow Conventional Commits; lefthook pre-commit hooks enforce the
  message format and run lint and typecheck (tests run in CI).

## Architecture

State lives in a single imperative store; React reads it via
`useSyncExternalStore`.

- `src/toast-store.ts` — the `ToastStore` singleton (`export const toastStore`).
  Owns the toast list, timers, overlay visibility, and expand/collapse. All
  mutations produce a new `state` object and call `notify()`.
- `src/toast-fns.ts` — the public `toast()` API and variants (`success`,
  `error`, `warning`, `info`, `loading`, `promise`, `custom`, `dismiss`,
  `wiggle`). Thin wrappers around `toastStore`.
- `src/toaster.tsx` — `<Toaster />`; subscribes to the store and renders toasts
  per position. On iOS it wraps in `FullWindowOverlay` (react-native-screens).
- `src/toast.tsx` — the individual `Toast` component (the largest, most-changed
  file).
- `src/context.tsx` — split contexts: `StableToastContextType` (config that
  rarely changes) and `DynamicToastContextType` (heights, expansion).
- `src/animations.ts` / `animation-utils.ts` / `easings.ts` /
  `use-toast-position.ts` / `position-utils.ts` — Reanimated worklets and the
  Y-position math for stacking/expansion.
- `src/gestures.tsx` — swipe-to-dismiss and tap, via gesture-handler.
- `src/index.tsx` — public entry; re-exports `Toaster`, `toast`, and the types.

## Reanimated & native-bridge rules

- UI-thread functions carry a `'worklet';` directive as their first statement.
  If you add animation/gesture logic that runs on the UI thread, mark it.
- `Infinity` cannot be sent across the native bridge. Infinite-duration toasts
  are special-cased on the JS side (no native timer). Preserve those guards.
- Platform-specific files use `.ios`/`.android` suffixes (`moduleSuffixes` in
  `tsconfig.json`).

## Testing

- Jest with the `react-native` preset. Native modules (`react-native`,
  reanimated, gesture-handler, safe-area-context) are mocked in
  `src/__tests__/setup.ts`.
- Tests use fake timers (`jest.useFakeTimers()` in setup).
- Current coverage is pure-function unit tests (store, position math,
  animations, gestures). When adding logic, prefer extracting it into a pure
  function and unit-testing it, matching the existing `src/__tests__/*` style.

## Releasing

Maintainer-only: `pnpm release` (release-it). Agents should not run it.
