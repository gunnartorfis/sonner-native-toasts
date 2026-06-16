# Plan 001: Add an `AGENTS.md` so contributors and agents have build/test/conventions in one place

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2c3ff4c..HEAD -- README.md CONTRIBUTING.md package.json`
> If any of those changed since this plan was written, re-read them and adjust
> the generated `AGENTS.md` so its commands/conventions still match. A changed
> command name (e.g. `pnpm test` renamed) is a content correction, not a STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `2c3ff4c`, 2026-06-16

## Why this matters

This repo is actively developed with AI coding agents (note the
`.claude/worktrees/` directory and commits like `claude/zen-goldstine-7dd27f`),
but it has no `AGENTS.md` or `CLAUDE.md`. Every agent run currently re-derives
the package manager, the test/lint/typecheck commands, and — more costly — the
**non-obvious conventions** that are easy to break: the two intentional ESLint
rule disables, the Reanimated `'worklet'` directive requirement, the "never send
`Infinity` to the native layer" rule, and the imperative singleton-store
architecture. Capturing this once in `AGENTS.md` makes agent contributions
faster and less likely to fight the codebase's intentional patterns.

This plan only **creates a new documentation file**. It changes no source code.

## Current state

- No `AGENTS.md` or `CLAUDE.md` exists at the repo root (verify:
  `ls AGENTS.md CLAUDE.md 2>/dev/null` prints nothing).
- The facts that belong in `AGENTS.md`, gathered from the repo:
  - **Package manager**: pnpm (`packageManager: pnpm@10.33.0` in `package.json`;
    `CONTRIBUTING.md:20` forbids npm/yarn). Node `v22` (`.nvmrc`).
  - **Monorepo**: pnpm workspaces — root is the library, plus `example/` and
    `docs/` (`package.json` `workspaces: ["example","docs"]`).
  - **Scripts** (`package.json:34-42`): `pnpm typecheck` → `tsc`,
    `pnpm test` → `jest`, `pnpm lint` → `eslint "**/*.{js,ts,tsx}"`,
    `pnpm prepare` → `bob build` (the library build), `pnpm clean` → `del-cli lib`.
    Example app: `pnpm example start | android | ios | web`.
  - **TypeScript**: strict, with `noUncheckedIndexedAccess`, `noUnusedLocals`,
    `noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`
    (`tsconfig.json`). `verbatimModuleSyntax` means type-only imports MUST use
    `import type`.
  - **ESLint** (`eslint.config.ts`): flat config; `typescript-eslint` recommended
    + `react-hooks`. Two **intentional** disables an agent must not "fix":
    `react-hooks/globals` off (module-level handlers assigned during render — the
    imperative `toast()` API) and `react-hooks/immutability` off (intentional ref
    mutations like `toastsCounter`).
  - **Formatting** (Prettier, in `package.json` `prettier` key): single quotes,
    `trailingComma: 'es5'`, `tabWidth: 2`, `quoteProps: 'consistent'`.
  - **Commits**: Conventional Commits, enforced by commitlint + lefthook
    pre-commit hooks (`CONTRIBUTING.md:71-90`, `lefthook.yml`).
  - **Architecture** (from `src/`):
    - `src/toast-store.ts` — a single `ToastStore` instance (`export const
      toastStore`); the imperative state core (timers, overlay, expand/collapse).
    - `src/toast-fns.ts` — the public `toast()` function + variants
      (`toast.success`, `toast.promise`, …); thin wrappers over `toastStore`.
    - `src/toaster.tsx` — the `<Toaster />` React component; subscribes to the
      store via `useSyncExternalStore` and renders toasts.
    - `src/toast.tsx` — the individual `Toast` component (largest file).
    - `src/context.tsx` — split context: `StableToastContextType` (config) and
      `DynamicToastContextType` (heights/expansion).
    - `src/animations.ts`, `src/animation-utils.ts`, `src/easings.ts`,
      `src/use-toast-position.ts`, `src/position-utils.ts` — Reanimated worklets
      for entry/exit/stacking animations and Y-position math.
    - `src/gestures.tsx` — swipe/tap via `react-native-gesture-handler`.
    - `src/index.tsx` — public entry: re-exports `Toaster`, `toast`, and types.
  - **Reanimated/worklet rules**: functions that run on the UI thread carry a
    `'worklet';` directive (see `src/animations.ts`, `src/gestures.tsx`). `Infinity`
    cannot cross to the native layer — `Infinity` durations are special-cased on
    the JS side (`src/toast.tsx:271-283`, `src/toast-store.ts:87-90`).
  - **Tests**: Jest with the `react-native` preset; native modules are mocked in
    `src/__tests__/setup.ts`; tests use fake timers. Tests today are
    pure-function unit tests (store, position math, animations, gestures), not
    component renders.
  - **Platform suffixes**: `tsconfig.json` `moduleSuffixes` enables
    `.ios`/`.android` file variants.
  - **Publishing**: `release-it` (`pnpm release`); do not run it as an agent.

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Install   | `pnpm install`   | exit 0              |
| Lint      | `pnpm lint`      | exit 0              |
| Typecheck | `pnpm typecheck` | exit 0, no errors   |
| Tests     | `pnpm test`      | all pass            |

(`AGENTS.md` is Markdown and is excluded from lint/typecheck/test, so the gate
here is only that you did not accidentally break those suites.)

## Scope

**In scope** (the only files you may create/modify):
- `AGENTS.md` (create)
- Optionally `CLAUDE.md` (create) — see Step 3.
- `plans/README.md` (status row update only)

**Out of scope** (do NOT touch):
- Any file under `src/`, `example/`, `docs/` — this is a docs-only plan.
- `README.md`, `CONTRIBUTING.md` — do not edit; `AGENTS.md` complements them.

## Git workflow

- Branch: `advisor/001-add-agents-md` (or the repo's branch-naming convention).
- One commit; Conventional Commits style. Example from `git log`:
  `docs: add AGENTS.md for contributors and agents`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `AGENTS.md`

Create `AGENTS.md` at the repo root with the content below. You may refine
wording, but keep every command and convention factually identical to the
"Current state" section (those are verified against the repo at `2c3ff4c`).

```markdown
# AGENTS.md

Guidance for humans and AI agents working in this repository. For contribution
etiquette and the PR process, see `CONTRIBUTING.md`; this file is the quick
reference for *how the code is built, checked, and structured*.

## What this is

`sonner-native` — an opinionated toast component for React Native, a port of
@emilkowalski's Sonner. Built on `react-native-reanimated` and
`react-native-gesture-handler`. The published package ships `src` + the built
`lib`; everything else (reanimated, gesture-handler, safe-area-context, screens,
svg) is a peer dependency.

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
  message format and run lint/tests.

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
```

**Verify**:
- `test -f AGENTS.md && echo OK` → prints `OK`.
- `grep -c "pnpm" AGENTS.md` → a number `> 0`.

### Step 2: Confirm you broke nothing

Markdown is not part of the build, but confirm the existing suites are unchanged.

**Verify**:
- `pnpm lint` → exit 0 (Markdown is ignored by the ESLint globs).
- `pnpm typecheck` → exit 0.

### Step 3 (optional): Point Claude Code at `AGENTS.md`

Claude Code reads `CLAUDE.md`. To avoid maintaining two files, create a
`CLAUDE.md` whose entire content is a pointer:

```markdown
See [AGENTS.md](./AGENTS.md) for build commands, conventions, and architecture.
```

Skip this step if the operator said `AGENTS.md` alone is sufficient.

**Verify**: if created, `cat CLAUDE.md` shows only the pointer line.

## Test plan

No automated tests — this is documentation. The verification is that
`pnpm lint`, `pnpm typecheck`, and `pnpm test` still pass (they were not
touched) and the new file exists with correct commands.

## Done criteria

ALL must hold:

- [ ] `AGENTS.md` exists at the repo root and documents: pnpm-only, the four
      commands (`typecheck`/`lint`/`test`/`prepare`), the two intentional ESLint
      disables, the `'worklet'` / `Infinity` rules, and the file map.
- [ ] `pnpm lint` exits 0.
- [ ] `pnpm typecheck` exits 0.
- [ ] `pnpm test` passes (unchanged from before this plan).
- [ ] No files outside the in-scope list are modified (`git status`).
- [ ] `plans/README.md` status row for 001 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- `README.md`/`CONTRIBUTING.md`/`package.json` have drifted such that the
  commands or conventions above are no longer accurate AND you cannot tell what
  the correct value is.
- An `AGENTS.md` or `CLAUDE.md` already exists with substantive content (the
  drift check should have caught new files) — do not overwrite; report it.

## Maintenance notes

- Keep `AGENTS.md` commands in sync with `package.json` scripts. If a script is
  renamed/added, update `AGENTS.md` in the same PR.
- A reviewer should check the two "intentional ESLint disable" notes still match
  `eslint.config.ts`, since those are the easiest thing for a future agent to
  wrongly "fix".
- Deferred out of scope: deeper per-module docs (those live in `docs/`).
