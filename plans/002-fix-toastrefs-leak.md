# Plan 002: Free `toastRefs` entries when toasts are removed (fix unbounded map growth)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2c3ff4c..HEAD -- src/toast-store.ts src/__tests__/toast-store.test.ts`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch, treat
> it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `2c3ff4c`, 2026-06-16

## Why this matters

`ToastStore.toastRefs` is a `Record<id, RefObject>` that gets a new entry every
time a toast with a not-yet-seen id is added — but **no code path ever removes
an entry**. Dismissing a single toast, dismissing all toasts, and trimming the
oldest toast when the stack overflows `visibleToasts` all leave the ref behind.
In a long-lived app that shows many toasts (especially with custom string ids,
which never recycle), this map grows without bound for the lifetime of the
process. It's a slow memory leak and a correctness smell (the store claims to
"clean up" on dismiss but doesn't fully). The fix is small and local: delete the
ref alongside the other per-toast cleanup that already happens in those paths.

## Current state

- `src/toast-store.ts` — the `ToastStore` singleton. `toastRefs` is declared in
  state and is created/read but never deleted. Relevant excerpts (line numbers
  from `2c3ff4c`):

`toastRefs` is added on the non-update add path (around lines 284-320):

```ts
      const newToastRefs = { ...this.state.toastRefs };
      if (!(newToast.id in newToastRefs)) {
        newToastRefs[newToast.id] = React.createRef<ToastRef>();
      }

      const visibleToasts =
        this.config.visibleToasts ?? toastDefaultValues.visibleToasts;
      const newIndex = this.cloneIndex();
      newIndex.set(newToast.id, newToast);
      const updatedHeights = { ...this.state.toastHeights };
      let heightsChanged = false;
      if (newToasts.length > visibleToasts) {
        const removedToast = newToasts.shift();
        if (removedToast) {
          this.clearTimer(removedToast.id);
          newIndex.delete(removedToast.id);
          if (removedToast.id in updatedHeights) {
            delete updatedHeights[removedToast.id];
            heightsChanged = true;
          }
        }
      }

      this.state = {
        ...this.state,
        toasts: newToasts,
        toastsById: newIndex,
        toastRefs: newToastRefs,
        toastHeights: heightsChanged ? updatedHeights : this.state.toastHeights,
        ...
      };
```

Note the overflow-trim block deletes the removed toast from `newIndex` and
`updatedHeights` **but not from `newToastRefs`**.

The dismiss-all path (around lines 350-372) resets several maps but spreads the
old state first, so `toastRefs` is retained:

```ts
    if (id == null) {
      this.state.toasts.forEach((currentToast) => { ... });

      this.state = {
        ...this.state,
        toasts: [],
        toastsById: new Map(),
        toastsCounter: 1,
        toastTimers: {},
        toastHeights: {},
        toastHeightsVersion: this.state.toastHeightsVersion + 1,
        isExpanded: false,
      };
      this.scheduleHideOverlay();
      this.notify();
      return;
    }
```

The single-dismiss path (around lines 375-419) builds `updatedHeights` and
`updatedIndex` but never touches `toastRefs`:

```ts
    // Clear timer for this specific toast
    this.clearTimer(id);

    const toastForCallback = this.state.toastsById.get(id);

    const filteredToasts = this.state.toasts.filter(
      (currentToast) => currentToast.id !== id
    );

    const updatedHeights = { ...this.state.toastHeights };
    delete updatedHeights[id];

    const shouldAutoCollapse =
      filteredToasts.length <= 1 && this.state.isExpanded;

    const updatedIndex = this.cloneIndex();
    updatedIndex.delete(id);

    this.state = {
      ...this.state,
      toasts: filteredToasts,
      toastsById: updatedIndex,
      toastHeights: updatedHeights,
      toastHeightsVersion: this.state.toastHeightsVersion + 1,
      isExpanded: shouldAutoCollapse ? false : this.state.isExpanded,
    };
```

- The state type (lines 14-24) includes `toastRefs: Record<string | number,
  React.RefObject<ToastRef | null>>;`.
- `getSnapshot` (around line 62) returns `this.state` directly, so tests can
  read `toastStore.getSnapshot().toastRefs`.

**Convention to follow**: each mutation clones the affected map (`{ ...old }` or
`new Map(old)`) and assigns the clone into a fresh `this.state` object — never
mutate `this.state` in place. Match that for `toastRefs`. The existing
`updatedHeights` handling in the single-dismiss path is the exemplar.

## Commands you will need

| Purpose   | Command                                   | Expected on success |
|-----------|-------------------------------------------|---------------------|
| Install   | `pnpm install`                            | exit 0              |
| Typecheck | `pnpm typecheck`                          | exit 0, no errors   |
| Tests     | `pnpm test src/__tests__/toast-store.test.ts` | all pass        |
| Full test | `pnpm test`                               | all pass            |
| Lint      | `pnpm lint`                               | exit 0              |

## Scope

**In scope** (the only files you may modify):
- `src/toast-store.ts`
- `src/__tests__/toast-store.test.ts`

**Out of scope** (do NOT touch):
- `src/toaster.tsx`, `src/toast.tsx` — the ref *consumers*. They look up refs via
  `toastStore.getToastRef(id)` / `toastStore.getSnapshot()`; deleting a stale ref
  after a toast is gone cannot affect them because they only read refs for toasts
  still in the list.
- Timer logic, overlay scheduling, expand/collapse — unrelated.

## Git workflow

- Branch: `advisor/002-fix-toastrefs-leak`.
- Commit message (Conventional Commits), e.g.:
  `fix: free toastRefs entries when toasts are removed`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Delete the trimmed toast's ref on overflow

In `src/toast-store.ts`, inside the non-update add path, the `if (newToasts.length
> visibleToasts)` block already deletes the removed toast from `newIndex` and
`updatedHeights`. Add a deletion from `newToastRefs` in the same `if (removedToast)`
block:

```ts
      if (newToasts.length > visibleToasts) {
        const removedToast = newToasts.shift();
        if (removedToast) {
          this.clearTimer(removedToast.id);
          newIndex.delete(removedToast.id);
          delete newToastRefs[removedToast.id];
          if (removedToast.id in updatedHeights) {
            delete updatedHeights[removedToast.id];
            heightsChanged = true;
          }
        }
      }
```

`newToastRefs` is already a fresh clone and is already assigned to the new state
as `toastRefs: newToastRefs`, so no further wiring is needed here.

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Delete the ref on single-toast dismiss

In the single-dismiss path, mirror the existing `updatedHeights` handling: clone
`toastRefs`, delete the id, and include it in the new state.

Add, next to the `updatedHeights`/`updatedIndex` declarations:

```ts
    const updatedRefs = { ...this.state.toastRefs };
    delete updatedRefs[id];
```

Then add `toastRefs: updatedRefs,` to the `this.state = { ... }` assignment in
this path (alongside `toasts`, `toastsById`, `toastHeights`, …).

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Reset refs on dismiss-all

In the `if (id == null)` (dismiss-all) branch, add `toastRefs: {},` to the
`this.state = { ... }` reset object (next to `toastsById: new Map()`).

**Verify**: `pnpm typecheck` → exit 0.

### Step 4: Add regression tests

In `src/__tests__/toast-store.test.ts`, add a new `describe('toastRefs cleanup',
…)` block. Model the structure on the existing tests in this file (e.g. the
`describe('addToast', …)` and `describe('wiggle functionality', …)` blocks). Note
that this test file mocks `React.createRef` to return `{ current: null }` (top of
the file), so every `addToast` populates `toastRefs[id]` with a defined object.

Cover these cases:

1. **Single dismiss frees the ref**:
   - `const id = toastStore.addToast({ title: 'a', variant: 'info' as const });`
   - assert `toastStore.getSnapshot().toastRefs[id]` is defined,
   - `toastStore.dismissToast(id);`
   - assert `toastStore.getSnapshot().toastRefs[id]` is `undefined`.

2. **Dismiss-all clears every ref**:
   - add two toasts with custom string ids (`{ id: 'x', … }`, `{ id: 'y', … }`),
   - `toastStore.dismissToast(undefined);`
   - assert `Object.keys(toastStore.getSnapshot().toastRefs)` has length `0`.

3. **Overflow trim frees the trimmed toast's ref**:
   - `toastStore.setConfig({ visibleToasts: 1 });`
   - add toast `{ id: 'first', … }` then `{ id: 'second', … }` (the second
     pushes the first out — this mirrors the existing
     `'should set and use config for visible toasts'` test at lines 505-514),
   - assert `toastStore.getSnapshot().toastRefs['first']` is `undefined`,
   - assert `toastStore.getSnapshot().toastRefs['second']` is defined.

Use `as const` on `variant` to satisfy the strict types, exactly as the
surrounding tests do.

**Verify**:
- `pnpm test src/__tests__/toast-store.test.ts` → all pass, including the 3 new
  cases.

### Step 5: Full verification

**Verify**:
- `pnpm test` → all pass.
- `pnpm typecheck` → exit 0.
- `pnpm lint` → exit 0.

## Test plan

- New tests live in `src/__tests__/toast-store.test.ts`, in a `toastRefs
  cleanup` describe block, covering: single dismiss, dismiss-all, overflow trim
  (the three cases above).
- Structural pattern to follow: the existing `describe('configuration', …)` test
  `'should set and use config for visible toasts'` (lines 505-514) for the
  overflow case; `describe('wiggle functionality', …)` for how the file reads
  `toastStore['state']` / `getSnapshot()`.
- Verification: `pnpm test src/__tests__/toast-store.test.ts` → all pass,
  including 3 new tests.

## Done criteria

ALL must hold:

- [ ] `pnpm typecheck` exits 0.
- [ ] `pnpm test` passes; 3 new `toastRefs` cleanup tests exist and pass.
- [ ] In `src/toast-store.ts`, all three removal paths delete/reset `toastRefs`:
      overflow trim (`delete newToastRefs[removedToast.id]`), single dismiss
      (`updatedRefs` + `toastRefs: updatedRefs`), dismiss-all (`toastRefs: {}`).
- [ ] `pnpm lint` exits 0.
- [ ] No files outside the in-scope list are modified (`git status`).
- [ ] `plans/README.md` status row for 002 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- The `src/toast-store.ts` excerpts in "Current state" don't match the live code
  (the store was refactored since this plan was written).
- A new test fails because `React.createRef` is not mocked the way described
  (the mock at the top of `toast-store.test.ts` changed) — report rather than
  reworking the mock.
- You find that some code path reads `toastRefs[id]` for an id that has already
  been removed from `toasts`/`toastsById` (would mean the consumers rely on stale
  refs — that changes the analysis; report it).

## Maintenance notes

- If a future change adds another toast-removal path (e.g. a "dismiss by
  variant" API), it must also delete from `toastRefs` — the three existing paths
  are now the template.
- A reviewer should confirm no consumer (`toaster.tsx`,
  `toastStore.getToastRef`) ever needs a ref for a toast no longer in the list;
  the fix assumes it doesn't.
- Refs for auto-generated numeric ids already recycled after dismiss-all (the
  counter resets to 1), so the user-visible leak was worst with custom string
  ids and with apps that never call `dismiss()`-all; the fix covers both.
