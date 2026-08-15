---
sidebar_position: 4
---

# Multiple toasters

Most apps need exactly one `<Toaster />` at the root. Render more than one when a
part of your UI needs its **own** toast surface — the common case being a toast
inside a natively presented view such as a sheet or modal, which the root Toaster
cannot draw over on iOS.

Give each extra Toaster an `id`, then address toasts to it with `toasterId`:

```tsx
// Root of the app
<Toaster />

// Inside the sheet
<Toaster id="sheet" fullWindowOverlay={false} />
```

```tsx
toast('Saved');                              // → the root Toaster
toast('Saved', { toasterId: 'sheet' });      // → the "sheet" Toaster
```

## Routing rules

- A Toaster **with** an `id` renders only toasts sent to that `id`.
- A Toaster **without** an `id` renders only toasts sent without a `toasterId`.
- So every toast renders in exactly one Toaster, and adding a second Toaster
  never duplicates your existing toasts.

Toast ids stay unique across channels, so the imperative API needs no channel
argument:

```tsx
const id = toast('Uploading…', { toasterId: 'sheet' });
toast.dismiss(id);   // works regardless of which Toaster owns it
toast.wiggle(id);
toast.dismiss();     // no argument: clears every Toaster
```

`toast.promise` stays in the channel it was created in, including its resolved
success or error state:

```tsx
toast.promise(upload(file), {
  loading: 'Uploading…',
  success: 'Uploaded',
  error: 'Upload failed',
  toasterId: 'sheet',
});
```

## Toasts inside a native sheet

On iOS the root Toaster is wrapped in `FullWindowOverlay`, which lives in the
app's window. A natively presented sheet (for example
[react-native-true-sheet](https://sheet.lodev09.com/)) is presented **above**
that window's content, so the root Toaster can never appear over it — this is why
a second Toaster is needed rather than just a different position.

The in-sheet Toaster must render inline, not in another full-window overlay, so
pass `fullWindowOverlay={false}`:

```tsx
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Toaster, toast } from 'sonner-native';

<TrueSheet ref={sheet}>
  <Button
    title="Save"
    onPress={() => toast('Saved', { toasterId: 'sheet' })}
  />
  <Toaster id="sheet" fullWindowOverlay={false} />
</TrueSheet>;
```

`fullWindowOverlay` is iOS-only and defaults to `true`; on other platforms it has
no effect.

:::warning[Swiping toasts inside a native sheet]
An iOS sheet's pull-to-dismiss recognizer owns **vertical** pans across the
whole sheet, and it wins the gesture arbitration against a toast's vertical
swipe — swiping the toast up or down drags the sheet instead. This is UIKit
behavior, not something the library can override. Two ways around it:

- Give the in-sheet Toaster a horizontal swipe, which doesn't compete with the
  sheet's gesture: `swipeToDismissDirection="left"`.
- Or disable the sheet's interactive dismissal (e.g. `dismissible={false}` on
  TrueSheet, or a non-interactive `presentationStyle` on `Modal`), which
  returns vertical pans to the toast.
:::

## Per-Toaster configuration

Each Toaster owns its own configuration. `visibleToasts`, `duration`,
`autoWiggleOnUpdate` and `pauseWhenPageIsHidden` apply only to that Toaster's
toasts, and stacking expansion is independent too — expanding the sheet's stack
leaves the root stack alone.

```tsx
<Toaster visibleToasts={3} duration={4000} />
<Toaster id="sheet" visibleToasts={1} duration={8000} fullWindowOverlay={false} />
```

Trimming to `visibleToasts` also happens per Toaster, so a busy root Toaster
never pushes out a toast belonging to the sheet.

## Lifetime

A named Toaster's toasts exist only while that Toaster is mounted. When it
unmounts — the sheet closes — its toasts are dropped, along with their timers.
Reopening the sheet starts empty. `onDismiss` and `onAutoClose` do **not** fire
for toasts removed this way, since nothing dismissed them.

The unnamed root Toaster behaves as before: unmounting it (during navigation, for
example) leaves its toasts in place.

Sending a toast to an `id` that has no mounted Toaster renders nothing yet —
the toast waits in the store with its auto-close timer **paused**, and appears
(timer started) once a Toaster for that channel mounts. So firing a toast just
before opening a sheet works regardless of timing. In development you'll also
get a warning naming the channel, since an unmounted channel is usually a typo
in `toasterId`.
