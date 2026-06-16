# Plan 004: Fix documentation drift (wrong defaults, undocumented `center`, missing props)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2c3ff4c..HEAD -- src/constants.ts src/types.ts docs/docs/Toaster.md docs/docs/index.md README.md`
> If `src/constants.ts` or `src/types.ts` changed, re-derive the correct default
> values from them before editing the docs (the source is the source of truth).
> If the doc files changed, re-read them so your find-and-replace targets match.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `2c3ff4c`, 2026-06-16

## Why this matters

Several documented defaults and capabilities no longer match the code. Wrong
docs are worse than missing docs: a user setting `gap` expecting the documented
default, or looking for a `center` position the README says doesn't exist, is
actively misled. These are cheap, high-certainty corrections sourced directly
from `src/constants.ts` and `src/types.ts`.

This plan edits **documentation only** — no source code.

## Current state

Source of truth (do not change these — read them to confirm the correct values):

- `src/constants.ts` `toastDefaultValues`:
  - `gap: 14` (line 44)
  - `pauseWhenPageIsHidden: false` (line 43)
  - `enableStacking: false` (line 48)
  - `duration: 4000` (line 33)
- `src/types.ts`:
  - `export type ToastPosition = 'top-center' | 'bottom-center' | 'center';`
    (line 40) — **`center` is a real, supported position.**
  - `ToasterProps` (lines 128-189) includes public props not in the docs table:
    `duration`, `enableStacking`, `loadingIcon`, `positionerStyle`.

The drift, by file:

**`docs/docs/Toaster.md`**
- The position example (lines ~37-41) lists only top/bottom:
  ```tsx
  // Available positions:
  // top-center, bottom-center
  <Toaster position="bottom-center" />
  ```
- API reference table (lines ~197-218) has wrong defaults and missing rows:
  - `gap` row (line ~209) shows default **`16`** — actual is **`14`**.
  - `pauseWhenPageIsHidden` row (line ~211) shows default **`{}`** — it's a
    boolean defaulting to **`false`**.
  - No rows for `duration`, `enableStacking`, `loadingIcon`, `positionerStyle`.

**`docs/docs/index.md`**
- Features list (line ~17): `- Top or bottom positions` (omits `center`).
- Requirements list (lines ~39-42) omits **React Native Screens**, even though
  it's a peer dependency (`package.json` `peerDependencies`) and used on iOS via
  `FullWindowOverlay` (`src/toaster.tsx:3,58-63`). `README.md` lists it; this file
  doesn't.

**`README.md`**
- Features list (line ~14): `- Top or bottom positions` (omits `center`).

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Install   | `pnpm install`   | exit 0              |
| Typecheck | `pnpm typecheck` | exit 0 (docs aren't typechecked, but confirms nothing else broke) |
| Lint      | `pnpm lint`      | exit 0 (Markdown is outside the ESLint globs) |

There is no docs-site build gate required for this change; the edits are plain
Markdown/MDX text in existing tables and code fences.

## Scope

**In scope** (the only files you may modify):
- `docs/docs/Toaster.md`
- `docs/docs/index.md`
- `README.md`

**Out of scope** (do NOT touch):
- `src/**` — the source is correct; the docs are what's wrong.
- `docs/docs/toast.md`, `docs/docs/sonner.md` — not part of this drift set.
- Any value/behavior change. This plan only makes docs match existing code.

## Git workflow

- Branch: `advisor/004-fix-docs-drift`.
- Commit message (Conventional Commits), e.g.:
  `docs: correct Toaster defaults and document center position`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Correct the `gap` default in `docs/docs/Toaster.md`

In the API reference table, change the `gap` row's default from `16` to `14`.
(Leave the description text as-is.)

**Verify**: `grep -n "| gap " docs/docs/Toaster.md` shows `14`, not `16`.

### Step 2: Correct the `pauseWhenPageIsHidden` default in `docs/docs/Toaster.md`

In the same table, change the `pauseWhenPageIsHidden` default from `{}` to
`false`.

**Verify**: `grep -n "pauseWhenPageIsHidden" docs/docs/Toaster.md` shows the
default cell as `false`.

### Step 3: Document the `center` position in `docs/docs/Toaster.md`

Update the position example comment to include `center`:

```tsx
// Available positions:
// top-center, bottom-center, center
<Toaster position="bottom-center" />
```

**Verify**: `grep -n "center" docs/docs/Toaster.md` shows the three-position
comment.

### Step 4: Add missing prop rows to the `docs/docs/Toaster.md` API table

Add table rows (matching the existing table's column format and alignment) for:

| Property        | Description                                                              | Default      |
|-----------------|--------------------------------------------------------------------------|--------------|
| `duration`      | Default time in ms before a toast auto-closes (overridable per toast).   | `4000`       |
| `enableStacking`| Stack toasts behind the front one instead of listing them; tap to expand.| `false`      |
| `loadingIcon`   | Custom node rendered for loading/promise toasts instead of the spinner.  | `-`          |
| `positionerStyle`| Style applied to the container that positions the toast stack.          | `-`          |

Keep the column widths/pipes consistent with the surrounding rows so the table
still renders. Derive defaults from `src/constants.ts` (already confirmed above).

**Verify**: `grep -nE "enableStacking|positionerStyle|loadingIcon" docs/docs/Toaster.md`
returns the new rows.

### Step 5: Fix `docs/docs/index.md`

- Change the features bullet `- Top or bottom positions` to
  `- Top, bottom, or center positions`.
- In the Requirements list, add a bullet for React Native Screens, matching the
  style of the others, e.g.:
  `- [React Native Screens](https://github.com/software-mansion/react-native-screens)`

**Verify**:
- `grep -n "center positions" docs/docs/index.md` → match.
- `grep -n "react-native-screens" docs/docs/index.md` → match.

### Step 6: Fix `README.md`

Change the features bullet `- Top or bottom positions` to
`- Top, bottom, or center positions`.

**Verify**: `grep -n "center positions" README.md` → match.

### Step 7: Sanity check

**Verify**:
- `pnpm lint` → exit 0.
- `pnpm typecheck` → exit 0.
- `git diff --name-only` lists only `README.md`, `docs/docs/Toaster.md`,
  `docs/docs/index.md` (plus `plans/README.md`).

## Test plan

No automated tests (documentation). Verification is the `grep` checks in each
step plus a visual scan that the edited Markdown tables/lists still render
(pipes aligned, code fences closed).

## Done criteria

ALL must hold:

- [ ] `docs/docs/Toaster.md`: `gap` default is `14`; `pauseWhenPageIsHidden`
      default is `false`; `center` appears in the positions comment; rows for
      `duration`, `enableStacking`, `loadingIcon`, `positionerStyle` exist.
- [ ] `docs/docs/index.md`: features mention `center`; Requirements list React
      Native Screens.
- [ ] `README.md`: features mention `center`.
- [ ] `pnpm lint` and `pnpm typecheck` exit 0.
- [ ] No `src/**` file is modified (`git status`).
- [ ] `plans/README.md` status row for 004 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- `src/constants.ts` shows a different default than stated here (the source
  changed; document the *current* source value, then report the discrepancy so
  this plan can be updated).
- `src/types.ts` no longer lists `'center'` in `ToastPosition` (then do NOT add
  `center` to the docs — report instead).
- A doc file's table structure differs so much from the excerpts that you can't
  safely splice a row without breaking rendering — report it.

## Maintenance notes

- The recurring root cause is that defaults live in `src/constants.ts` while the
  docs table restates them by hand. A reviewer merging any change to
  `toastDefaultValues` should check whether the `docs/docs/Toaster.md` table
  needs the same change. (A longer-term fix — generating the table from the
  source — is explicitly out of scope here.)
- If `center` later gains expand/collapse support (currently it's excluded:
  `src/positioner.tsx:57`), update the docs note accordingly.
