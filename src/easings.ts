import { Easing } from 'react-native-reanimated';

export const easeInQuad = Easing.bezier(0.55, 0.085, 0.68, 0.53);
export const easeInCubic = Easing.bezier(0.55, 0.055, 0.675, 0.19);
export const easeInQuart = Easing.bezier(0.895, 0.03, 0.685, 0.22);
export const easeInQuint = Easing.bezier(0.755, 0.05, 0.855, 0.06);
export const easeInExpo = Easing.bezier(0.95, 0.05, 0.795, 0.035);
export const easeInCirc = Easing.bezier(0.6, 0.04, 0.98, 0.335);

// opening things, like modals, enter/exit animations
export const easeOutQuad = Easing.bezier(0.25, 0.46, 0.45, 0.94);
export const easeOutCubic = Easing.bezier(0.215, 0.61, 0.355, 1);
export const easeOutQuart = Easing.bezier(0.165, 0.84, 0.44, 1);
export const easeOutQuint = Easing.bezier(0.23, 1, 0.32, 1);
export const easeOutExpo = Easing.bezier(0.19, 1, 0.22, 1);
export const easeOutCirc = Easing.bezier(0.075, 0.82, 0.165, 1);

// for layout animations, enter/exit animations
export const easeOutQuadFn = Easing.bezierFn(0.25, 0.46, 0.45, 0.94);
export const easeOutCubicFn = Easing.bezierFn(0.215, 0.61, 0.355, 1);
export const easeOutQuartFn = Easing.bezierFn(0.165, 0.84, 0.44, 1);
export const easeOutQuintFn = Easing.bezierFn(0.23, 1, 0.32, 1);
export const easeOutExpoFn = Easing.bezierFn(0.19, 1, 0.22, 1);
export const easeOutCircFn = Easing.bezierFn(0.075, 0.82, 0.165, 1);

// moving things around, already on the screen
export const easeInOutQuad = Easing.bezier(0.455, 0.03, 0.515, 0.955);
export const easeInOutCubic = Easing.bezier(0.645, 0.045, 0.355, 1);
export const easeInOutQuart = Easing.bezier(0.77, 0, 0.175, 1);
export const easeInOutQuint = Easing.bezier(0.86, 0, 0.07, 1);
export const easeInOutExpo = Easing.bezier(0.1, 0, 0, 1);
export const easeInOutCirc = Easing.bezier(0.785, 0.135, 0.15, 0.86);

// for layout animations, already on the screen
export const easeInOutQuadFn = Easing.bezierFn(0.455, 0.03, 0.515, 0.955);
export const easeInOutCubicFn = Easing.bezierFn(0.645, 0.045, 0.355, 1);
export const easeInOutQuartFn = Easing.bezierFn(0.77, 0, 0.175, 1);
export const easeInOutQuintFn = Easing.bezierFn(0.86, 0, 0.07, 1);
export const easeInOutExpoFn = Easing.bezierFn(0.1, 0, 0, 1);
export const easeInOutCircFn = Easing.bezierFn(0.785, 0.135, 0.15, 0.86);
