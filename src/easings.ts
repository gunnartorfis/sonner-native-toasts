import { Easing } from 'react-native-reanimated';

export const easeInOutCubic = Easing.bezier(0.645, 0.045, 0.355, 1);

// bezierFn variants for layout animations (worklet-compatible)
export const easeOutQuartFn = Easing.bezierFn(0.165, 0.84, 0.44, 1);
export const easeInOutCircFn = Easing.bezierFn(0.785, 0.135, 0.15, 0.86);
