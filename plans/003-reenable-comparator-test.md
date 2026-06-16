# Plan 003: Re-enable the excluded `areToastsEqual` test (restore comparator coverage)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2c3ff4c..HEAD -- package.json src/toast-comparator.ts src/__tests__/toast-comparator.test.tsx`
> If any changed since this plan was written, re-read them before proceeding; on
> a mismatch with the excerpts below, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `2c3ff4c`, 2026-06-16

## Why this matters

`src/toast-comparator.ts` exports `areToastsEqual`, which decides whether an
updated toast is "different enough" to trigger the wiggle animation when
`autoWiggleOnUpdate: 'toast-change'` is set (used in `src/toast-store.ts:241-248`).
A full test file for it exists — `src/__tests__/toast-comparator.test.tsx` — but
it is **silently excluded** from Jest via `testPathIgnorePatterns` in
`package.json`. As a result the comparator currently has **zero active test
coverage**, and a regression (e.g. forgetting to compare a newly added field)
would pass CI unnoticed. This plan restores the coverage by removing the
exclusion and making the test run green again, then reports if the test reveals a
genuine comparator gap.

## Current state

- `package.json` Jest config excludes the file (lines ~121-126):

```json
    "testPathIgnorePatterns": [
      "<rootDir>/node_modules/",
      "<rootDir>/lib/",
      "<rootDir>/example/",
      "src/__tests__/toast-comparator.test.tsx"
    ],
```

  Git history: the exclusion line was added/moved in commit `f21702a`
  ("fix: address PR feedback — pnpm CI, test sync, permissions", 2026-04-14). The
  commit message says it *moved* the exclusion into `package.json`, implying the
  test was already disabled earlier; the original reason is not recorded. **You
  must therefore determine empirically whether the test passes once re-enabled.**

- `src/__tests__/toast-comparator.test.tsx` — the test file. It imports
  `areToastsEqual` and `ToastProps`, builds toast objects from a shared `base`
  (`{ index: 0, numberOfToasts: 1, orderedToastIds: [] }`), and asserts equality
  across id/title/variant/description/action/cancel. One test uses JSX
  (`const mockReactNode = <View />;`) to check React-node identity equality —
  this is why the file is `.tsx`. Line 2 has a malformed leftover comment:
  `// Adjust the import path Adjust the import path`.

- `src/toast-comparator.ts` — the implementation under test (33 lines). It
  compares: `id, title, variant, description, closeButton, invert, position,
  dismissible, icon, jsx, duration, style, styles, important, richColors,
  promiseOptions`, and `action`/`cancel` via `areActionsEqual` (label equality
  for `ToastAction`, reference equality otherwise).

- Jest setup: `src/__tests__/setup.ts` mocks `react-native` (its `View` is
  `(props) => props.children`), reanimated, gesture-handler, safe-area-context.
  Babel transforms `.tsx` via `react-native-builder-bob/babel-preset`
  (`babel.config.js`). There is no other `.tsx` test in the suite — every other
  test is `.ts`.

**Convention to follow**: tests are plain Jest with `as const` on `variant`
literals and strict typing (see `src/__tests__/toast-store.test.ts`). Fixtures
must satisfy the full `ToastProps` required fields (`id, index, title, variant,
numberOfToasts, orderedToastIds`).

## Commands you will need

| Purpose             | Command                                              | Expected on success |
|---------------------|------------------------------------------------------|---------------------|
| Install             | `pnpm install`                                       | exit 0              |
| Run only this test  | `pnpm test src/__tests__/toast-comparator.test.tsx`  | all pass            |
| Typecheck           | `pnpm typecheck`                                      | exit 0, no errors   |
| Full test           | `pnpm test`                                           | all pass            |
| Lint                | `pnpm lint`                                           | exit 0              |

Note: while the file is still in `testPathIgnorePatterns`, `pnpm test <path>`
for it will report "no tests found". Run the targeted command **after** Step 1.

## Scope

**In scope** (the only files you may modify):
- `package.json` (remove the one ignore-pattern line)
- `src/__tests__/toast-comparator.test.tsx` (fix the test if needed — see Step 3)

**Out of scope** (do NOT touch):
- `src/toast-comparator.ts` — the implementation. If the test fails because the
  *comparator* is wrong (not the test), that is a STOP condition (see below), not
  a source edit under this plan.
- Any other test file or Jest config key.

## Git workflow

- Branch: `advisor/003-reenable-comparator-test`.
- Commit message (Conventional Commits), e.g.:
  `test: re-enable areToastsEqual comparator test`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Remove the exclusion

In `package.json`, delete the line
`"src/__tests__/toast-comparator.test.tsx"` from the `jest.testPathIgnorePatterns`
array (and fix the trailing comma so the JSON stays valid — the line above it,
`"<rootDir>/example/"`, should no longer have a trailing comma).

Result:

```json
    "testPathIgnorePatterns": [
      "<rootDir>/node_modules/",
      "<rootDir>/lib/",
      "<rootDir>/example/"
    ],
```

**Verify**: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('valid json')"`
→ prints `valid json`.

### Step 2: Run the test

**Verify**: `pnpm test src/__tests__/toast-comparator.test.tsx`

- **If it passes** → go to Step 3 (cleanup only).
- **If it fails** → read the failure carefully and classify it (Step 3 / STOP).

### Step 3: Fix the test (only the test) and tidy

Regardless of pass/fail, remove the malformed leftover comment on line 2 of
`src/__tests__/toast-comparator.test.tsx`:
`// Adjust the import path Adjust the import path` → delete the trailing
`Adjust the import path` so it reads a single clean comment, or remove the
comment entirely.

If the test **failed in Step 2**, classify the cause:

- **Test-only problems you MAY fix** (the test is stale, the source is correct):
  - A TypeScript/type error in the fixtures (e.g. a missing required `ToastProps`
    field, or a field the type no longer has) — update the fixture to match the
    current `ToastProps` in `src/types.ts`.
  - A transform/JSX error on the `<View />` node — if the JSX is the only
    blocker, you may replace `const mockReactNode = <View />;` with a
    non-JSX React element of equivalent identity semantics, e.g.
    `const mockReactNode = React.createElement(View);` (import `React`), keeping
    the test's intent (same reference compared on both sides → equal).
  - An assertion that contradicts the *documented* comparator behavior in
    `src/toast-comparator.ts` because the test predates a deliberate change —
    update the assertion to match the current implementation.

- **NOT a test problem (STOP)**: if the test fails because `areToastsEqual`
  itself is wrong (e.g. it ignores a field that two visibly-different toasts
  differ on, so it returns `true` when it should return `false`), do **not**
  edit `src/toast-comparator.ts` under this plan. Stop and report the discrepancy
  — that is a separate finding to be planned on its own.

**Verify**: `pnpm test src/__tests__/toast-comparator.test.tsx` → all pass.

### Step 4: Full verification

**Verify**:
- `pnpm test` → all pass (the comparator suite now runs as part of the full run).
- `pnpm typecheck` → exit 0.
- `pnpm lint` → exit 0.

## Test plan

- No new test cases are required — the goal is to restore the existing suite.
  Optionally, if Step 2 passed and the suite runs clean, you MAY add one case to
  guard the comparator's most error-prone aspect (it compares `action`/`cancel`
  by `label` only): assert that two toasts whose `action.onClick` differ but
  whose `action.label` is identical are treated as equal (documenting the
  intended behavior). Keep it in the same file, same style.
- Verification: `pnpm test src/__tests__/toast-comparator.test.tsx` → all pass.

## Done criteria

ALL must hold:

- [ ] `src/__tests__/toast-comparator.test.tsx` no longer appears in
      `package.json` `testPathIgnorePatterns`
      (`grep -c "toast-comparator.test" package.json` → `0`).
- [ ] `pnpm test src/__tests__/toast-comparator.test.tsx` runs and all cases pass
      (it is no longer skipped).
- [ ] The malformed line-2 comment in the test file is cleaned up.
- [ ] `pnpm test` (full) passes; `pnpm typecheck` exits 0; `pnpm lint` exits 0.
- [ ] `src/toast-comparator.ts` is unchanged (`git diff --stat` shows no change
      to it).
- [ ] No files outside the in-scope list are modified (`git status`).
- [ ] `plans/README.md` status row for 003 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- The test fails for a reason that requires editing `src/toast-comparator.ts`
  (i.e. the *implementation* is wrong) — report the specific field/case; that's a
  new finding, not part of this plan.
- The test fails due to a Jest/babel environment issue you cannot resolve by
  editing only the test file (e.g. the `react-native-builder-bob` preset can't
  transform `.tsx` under the current Jest config) — report the exact error;
  converting the suite's transform setup is out of scope.
- Removing the ignore line surfaces a second, unrelated test elsewhere that now
  fails — report it; do not fix unrelated tests under this plan.

## Maintenance notes

- After this lands, any new field added to `ToastProps` that should influence
  the "did the toast meaningfully change?" decision must be added to BOTH
  `areToastsEqual` (`src/toast-comparator.ts`) and this test — call that out in
  reviews of `types.ts` changes.
- A reviewer should confirm the test was genuinely re-enabled (runs, not just
  un-ignored-then-emptied) by checking the Jest output lists the
  `areToastsEqual` describe block.
- If this turned out to require a STOP (real comparator bug), record the finding
  so it can be planned separately.
