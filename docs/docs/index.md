---
sidebar_position: 1
---

# Introduction

Sonner Native is an opinionated toast component for React Native. A port of @emilkowalski's sonner. It is customizable and performant toast library for React Native, built with Reanimated 3. It provides a simple API to display toast notifications with various options and configurations.

![Preview](/img/sonner-native.png)

## Features

- API fully matches [Sonner's](https://sonner.emilkowal.ski/)
- Multiple variants, including `success`, `error`, `warning`, `custom`, `promise`
- Promise variant with built-in loading state
- Custom JSX with the custom variant
- Top, bottom, or center positions
- Title and description
- Action button with a callback
- Custom icons
- Optionally dismissable with swipe, configurable left or up
- Dismissable with toast.dismiss(), one or all toasts
- Highly performant using Reanimated 3, 60 FPS
- Dark mode built-in
- Works with Expo
- Customizable via style props
- Works outside of React components

## Installation

```bash npm2yarn
yarn add sonner-native
```

#### Requirements

To use this package, **you also need to install its peer dependencies**. Check out their documentation for more information:

- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/)
- [React Native Safe Area Context](https://docs.expo.dev/versions/latest/sdk/safe-area-context/)
- [React Native SVG](https://github.com/software-mansion/react-native-svg)
- [React Native Screens](https://github.com/software-mansion/react-native-screens)
- [React Native Worklets](https://github.com/margelo/react-native-worklets)

## Getting started

### In your App.tsx/entry point

```typescript
import { Toaster } from 'sonner-native';

function App() {
  return (
    <View>
      <NavigationContainer>...</NavigationContainer>
      <Toaster />
    </View>
  );
}
```

### With Expo Router

When using Expo Router, place the `Toaster` component in your root layout file (`app/_layout.tsx`):

```typescript
import { Toaster } from 'sonner-native';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Toaster />
    </>
  );
}
```

This ensures the toasts will be displayed across all screens in your app.

### Show a toast

```typescript
import { toast } from 'sonner-native';

function SomeComponent() {
  return (
    <Button
      title="Show Toast"
      onPress={() => toast('Hello, World!')}
    />
  );
}
```

### Web support

Even though Sonner Native works on the web, it is not recommended to use it there. Instead, use the original [Sonner](https://sonner.emilkowal.ski/).

The following setup is recommended. Add a `sonner.ts` and `sonner.web.ts` file to your project and import from there instead of from this library directly. That way, sonner will be used on the web and sonner-native on native.

```ts
// sonner.ts
export * from 'sonner-native';
```

```ts
// sonner.web.ts
export * from 'sonner';
```

## Examples

An example can be found in the [`example`](https://github.com/gunnartorfis/sonner-native/tree/main/example) folder.
