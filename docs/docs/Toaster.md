---
sidebar_position: 3
---

The Toaster is the context component which manages the addition, update, and removal of toast notifications and must be rendered within both the `SafeAreaProvider` and `GestureHandlerRootView`.

## Usage

To use the Toaster, place it at the root level of your app, after the NavigationContainer, to ensure it works across all screens. Here's an example setup:

```tsx
import { Toaster } from 'sonner-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <NavigationContainer>{/* App content */}</NavigationContainer>
        <Toaster />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
```

## Customization

The Toaster component can provide default styles for all toasts, but individual toasts can also be customized. The Toaster component accepts a number of props to customize the appearance and behavior of the toasts.

### Position

The `position` prop determines where the toasts are displayed on the screen.

```tsx
// Available positions:
// top-center, bottom-center
<Toaster position="bottom-center" />
```

### Enter / Exit animations

Customize how toasts enter and leave by passing the `animation` prop. Each side (`enter` / `exit`) accepts any value that `react-native-reanimated`'s `entering` / `exiting` props accept: a preset (`FadeIn`, `SlideInUp`, …), a `Keyframe`, or a custom worklet function returning `{ initialValues, animations }`.

```tsx
import { Toaster } from 'sonner-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';

<Toaster
  animation={{
    enter: FadeIn.duration(300),
    exit: FadeOut.duration(200),
  }}
/>;
```

Per-property fallback: if you only set `enter`, the library default `exit` is used (and vice versa).

Per-toast override: an individual `toast(...)` call may set its own `animation` to override the Toaster-wide values. Per-property merge — a per-toast `enter` does not erase a Toaster-wide `exit`.

Explicit reset: pass the string `'default'` to force the library default for a particular side. Useful when a Toaster-wide custom animation is set but a single toast should keep the default behavior.

```tsx
toast.success('Reset to default exit', {
  animation: { exit: 'default' },
});
```

Notes:

- The reduced-motion system setting still disables all animations, including custom ones.
- When a toast is removed because the stack overflows `visibleToasts`, the library uses its built-in fade exit regardless of any custom `exit` — a custom slide on a buried toast would look wrong.

### Default styles for toasts

You can provide default styles for all toasts by passing the `style` prop to the Toaster component. All customization passed to the toast() will be concatenated with these default styles.

```tsx
<Toaster
  toastOptions={{
    style: { backgroundColor: 'red' },
  }}
/>
```

### Styling Toasts by Variant

You can provide default styles for specific toast variants within `toastOptions`. These styles will be applied as the base for any toast of that type.

```tsx
<Toaster
  toastOptions={{
    // Set a default style for all success toasts
    success: {
      backgroundColor: '#28a745',
    },
    // This also works for 'error', 'warning', 'info', and 'loading'
  }}
/>
```

### Usage with react-native-z-view

Use the `ToasterOverlayWrapper` prop to wrap the Toaster component with a custom component. This is useful when using `react-native-z-view` to render the toasts.

sonner-native uses `FullWindowOverlay` from react-native-screens by default on iOS and `View` on Android.

```tsx
import { ZView } from 'react-native-z-view';

<Toaster
  ToasterOverlayWrapper={ZView}
  toastOptions={{
    style: { backgroundColor: 'red' },
  }}
/>;
```


### Dismiss toast on tap

Use the `ToastWrapper` prop to wrap the Toast component with a custom component. This is useful when you want to customize the behavior of the toast, for example add a dismiss on tap instead of the the close icon.

```tsx
import { Pressable } from "react-native"

function Wrapper({toastId, children}){
  function onPress(){
    toast.dismiss(toastId)
  }
  return <Pressable onPress={onPress}>{children}</Pressable>
}

<Toaster
  ToastWrapper={Wrapper}
  toastOptions={{
    style: { backgroundColor: 'red' },
  }}
/>;
```

### Custom Background Component

Use the `backgroundComponent` in `toastOptions` to add a custom background to all toasts, such as a blur effect. The background component will render inside the toast's animated view and participate in all animations.

```tsx
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';

<Toaster
  toastOptions={{
    backgroundComponent: (
      <BlurView
        intensity={80}
        tint="dark"
        experimentalBlurMethod={
          Platform.OS === 'android' ? 'dimezisBlurView' : undefined
        }
        style={StyleSheet.absoluteFill}
      />
    ),
  }}
/>;
```

**Important notes:**

- The `backgroundComponent` must use `StyleSheet.absoluteFill` or equivalent absolute positioning
- On Android, `expo-blur` requires `experimentalBlurMethod="dimezisBlurView"` for actual blur (otherwise falls back to semi-transparent view)
- The library automatically applies `overflow: 'hidden'` and `backgroundColor: 'transparent'` when backgroundComponent is present
- The background participates in all toast animations (enter, exit, wiggle)
- Does not apply to custom JSX toasts (`toast.custom()`)

You can also override the background on a per-toast basis using the `backgroundComponent` option in `toast()`:

```tsx
import { toast } from 'sonner-native';

toast.success('Saved!', {
  backgroundComponent: (
    <BlurView
      intensity={100}
      tint="light"
      experimentalBlurMethod={
        Platform.OS === 'android' ? 'dimezisBlurView' : undefined
      }
      style={StyleSheet.absoluteFill}
    />
  ),
});
```

## API Reference

| Property                         |                                            Description                                             |      Default |
| :------------------------------- | :------------------------------------------------------------------------------------------------: | -----------: |
| theme                            |                                          `light`, `dark`                                           |     `system` |
| visibleToasts                    |                                  Maximum number of visible toasts                                  |          `3` |
| position                         |                              Place where the toasts will be rendered                               | `top-center` |
| offset                           |                                   Offset from the top or bottom                                    |          `0` |
| closeButton                      |                                 Adds a close button to all toasts                                  |      `false` |
| invert                           |                             Dark toasts in light mode and vice versa.                              |      `false` |
| toastOptions                     | These will act as default options for all toasts. See [toast()](/toast) for all available options. |         `{}` |
| toastOptions.backgroundComponent |           Custom component rendered as toast background. Must use absolute positioning.            |          `-` |
| gap                              |                                  Gap between toasts when expanded                                  |         `16` |
| icons                            |                                     Changes the default icons                                      |          `-` |
| pauseWhenPageIsHidden            |                        Pauses toast timers when the app enters background.                         |         `{}` |
| `swipeToDismissDirection`        |                             Swipe direction to dismiss (`left`, `up`).                             |         `up` |
| ToasterOverlayWrapper            |                                Custom component to wrap the Toaster.                               |        `div` |
| ToastWrapper                     |                                 Custom component to wrap the Toast.                                |        `div` |
| autoWiggleOnUpdate               |             Adds a wiggle animation on toast update. `never`, `toast-change`, `always`             |      `never` |
| animation                        |                  Custom Reanimated entering/exiting animations applied to all toasts.              |          `-` |
| richColors                       |                             Makes error and success state more colorful                            |      `false` |
