import type { ViewStyle } from 'react-native';
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
  const spacingForSafeArea = 20;
  const { top = 0, bottom = 0 } = safeAreaInsets || {};

  if (position === 'bottom-center') {
    const safeAreaSpacing = offset || bottom || 0;
    return {
      bottom: safeAreaSpacing === 0 ? 40 : safeAreaSpacing + spacingForSafeArea,
    };
  }

  if (position === 'top-center') {
    const safeAreaSpacing = offset || top || 0;
    return {
      top: safeAreaSpacing === 0 ? 40 : safeAreaSpacing + spacingForSafeArea,
    };
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
  // Calculate the approximate height of the toast stack
  const ESTIMATED_TOAST_HEIGHT = 70; // Fallback height
  const toastHeightValues = Object.values(toastHeights);
  const numberOfToastsTocalculate = Math.min(
    toastHeightValues.length,
    visibleToasts || 3
  );

  // Calculate total height: use actual heights if available, otherwise estimate
  const totalToastHeight =
    toastHeightValues.length > 0
      ? toastHeightValues
          .slice(0, numberOfToastsTocalculate)
          .reduce((sum, height) => sum + height, 0)
      : ESTIMATED_TOAST_HEIGHT * numberOfToastsTocalculate;

  const gapHeight = gap * Math.max(0, numberOfToastsTocalculate - 1);
  const stackHeight = totalToastHeight + gapHeight + 20; // Add some padding

  // Position the pressable area outside the toast stack
  if (position === 'top-center') {
    // For top position, pressable area is below the toast stack
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
    // For bottom position, pressable area is above the toast stack
    const bottomOffset = (insetValues.bottom || 40) + stackHeight;
    return {
      position: 'absolute',
      top: 0,
      bottom: bottomOffset,
      left: 0,
      right: 0,
    };
  }

  // No outside press for center position
  return { display: 'none' };
};
