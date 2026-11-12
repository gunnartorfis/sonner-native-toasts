import { Platform } from 'react-native';

// Reanimated only uses explicit dependency arrays on web (native derives them
// from the worklet closure) and warns in dev when they are passed on native.
export const webDeps = (deps: unknown[]): unknown[] | undefined =>
  Platform.OS === 'web' ? deps : undefined;
