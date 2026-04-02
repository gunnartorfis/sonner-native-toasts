import type { ToastPosition, ToastProps } from './types';

// Default estimated height for toasts before measurement
const ESTIMATED_TOAST_HEIGHT = 70;

export const getOrderedToastIds = (
  toasts: ToastProps[],
  position: ToastPosition,
  enableStacking: boolean
): Array<string | number> => {
  if (enableStacking) {
    // Match the rendering order from toaster.tsx
    return position === 'top-center'
      ? toasts.map((t) => t.id).reverse()
      : toasts.map((t) => t.id);
  }
  return position === 'bottom-center'
    ? toasts.map((t) => t.id)
    : toasts.map((t) => t.id).reverse();
};

export const calculateToastPosition = ({
  index,
  numberOfToasts,
  enableStacking,
  position,
  allToastHeights,
  gap,
  orderedToastIds,
  isExpanded,
  stackGap,
}: {
  index: number;
  numberOfToasts: number;
  enableStacking: boolean;
  position: ToastPosition;
  allToastHeights: Record<string | number, number>;
  gap: number;
  orderedToastIds: Array<string | number>;
  isExpanded: boolean;
  stackGap: number;
}): number => {
  'worklet';
  // When expanded, disable stacking and show all toasts with full separation
  const effectiveEnableStacking = enableStacking && !isExpanded;

  if (position === 'center') {
    // Center position: stack from center outward
    if (effectiveEnableStacking) {
      const offsetFromCenter = stackGap * (numberOfToasts - index - 1);
      return offsetFromCenter;
    } else {
      // Non-stacking center: calculate based on heights
      // When expanded, use stackGap instead of gap for tighter spacing
      const effectiveGap = isExpanded ? stackGap : gap;
      let totalOffset = 0;
      for (let i = 0; i < index; i++) {
        const toastId = orderedToastIds[i];
        if (!toastId) {
          continue;
        }
        const height = allToastHeights[toastId] || ESTIMATED_TOAST_HEIGHT;
        totalOffset += height + effectiveGap;
      }
      return totalOffset;
    }
  }

  if (effectiveEnableStacking) {
    return 0;
  } else {
    // Non-stacking mode: fully separated by gap
    // When expanded, use stackGap instead of gap for tighter spacing
    const effectiveGap = isExpanded ? stackGap : gap;

    if (position === 'bottom-center') {
      // Bottom: newest at 0, sum heights going up (negative)
      let totalOffset = 0;
      for (let i = numberOfToasts - 1; i > index; i--) {
        const toastId = orderedToastIds[i];
        if (!toastId) {
          continue;
        }
        const height = allToastHeights[toastId] || ESTIMATED_TOAST_HEIGHT;
        totalOffset += height + effectiveGap;
      }
      return -totalOffset;
    } else {
      // Top: oldest at 0, sum heights going down (positive)
      let totalOffset = 0;
      for (let i = 0; i < index; i++) {
        const toastId = orderedToastIds[i];
        if (!toastId) {
          continue;
        }
        const height = allToastHeights[toastId] || ESTIMATED_TOAST_HEIGHT;
        totalOffset += height + effectiveGap;
      }
      return totalOffset;
    }
  }
};
