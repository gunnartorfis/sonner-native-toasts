import type { ViewStyle } from 'react-native';
import { ESTIMATED_TOAST_HEIGHT, OUTSIDE_PRESS_PADDING } from './constants';
import type { ToastPosition } from './types';

export const getContainerStyle = (position: ToastPosition): ViewStyle => {
  if (position === 'center') {
    return {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible',
    };
  }

  return {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    overflow: 'visible',
  };
};

export const getInsetValues = ({
  position,
  offset,
  safeAreaInsets,
}: {
  position: ToastPosition;
  offset?: number;
  safeAreaInsets?: { top: number; bottom: number };
}): { top?: number; bottom?: number } => {
  const { top = 0, bottom = 0 } = safeAreaInsets || {};

  if (position === 'bottom-center') {
    if (offset) return { bottom: offset };
    return { bottom: bottom > 0 ? bottom + 8 : 16 };
  }

  if (position === 'top-center') {
    if (offset) return { top: offset };
    return { top: top > 0 ? top + 8 : 16 };
  }

  return {};
};

export const calculateOutsidePressableArea = ({
  position,
  toastHeights,
  gap,
  visibleToasts,
  insetValues,
}: {
  position: ToastPosition;
  toastHeights: Record<string | number, number>;
  gap: number;
  visibleToasts: number;
  insetValues: { top?: number; bottom?: number };
}): ViewStyle => {
  const toastHeightValues = Object.values(toastHeights);
  const numberOfToastsToCalculate = Math.min(
    toastHeightValues.length,
    visibleToasts ?? 3
  );

  let totalToastHeight = 0;
  if (toastHeightValues.length > 0) {
    for (let i = 0; i < numberOfToastsToCalculate; i++) {
      totalToastHeight += toastHeightValues[i]!;
    }
  } else {
    totalToastHeight = ESTIMATED_TOAST_HEIGHT * numberOfToastsToCalculate;
  }

  const gapHeight = gap * Math.max(0, numberOfToastsToCalculate - 1);
  const stackHeight = totalToastHeight + gapHeight + OUTSIDE_PRESS_PADDING;

  if (position === 'top-center') {
    const topOffset = (insetValues.top || 40) + stackHeight;
    return {
      position: 'absolute',
      top: topOffset,
      bottom: 0,
      left: 0,
      right: 0,
    };
  }

  if (position === 'bottom-center') {
    const bottomOffset = (insetValues.bottom || 40) + stackHeight;
    return {
      position: 'absolute',
      top: 0,
      bottom: bottomOffset,
      left: 0,
      right: 0,
    };
  }

  return { display: 'none' };
};
