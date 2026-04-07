import { ESTIMATED_TOAST_HEIGHT } from './constants';
import type { ToastPosition, ToastProps } from './types';

export const getOrderedToastIds = (
  toasts: ToastProps[],
  position: ToastPosition,
  enableStacking: boolean
): Array<string | number> => {
  if (enableStacking) {
    // toasts are already in rendering order (reversed by orderToastsFromPosition for top-center)
    return toasts.map((t) => t.id);
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
  const effectiveEnableStacking = enableStacking && !isExpanded;

  if (position === 'center') {
    if (effectiveEnableStacking) {
      const offsetFromCenter = stackGap * (numberOfToasts - index - 1);
      return offsetFromCenter;
    } else {
      const effectiveGap = gap;
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
    const currentId = orderedToastIds[index];
    const currentHeight = allToastHeights[currentId!] || ESTIMATED_TOAST_HEIGHT;

    if (position === 'bottom-center') {
      const frontId = orderedToastIds[numberOfToasts - 1];
      const frontHeight = allToastHeights[frontId!] || ESTIMATED_TOAST_HEIGHT;
      const distFromFront = numberOfToasts - 1 - index;
      return -(frontHeight + distFromFront * stackGap - currentHeight);
    }
    // top-center
    const frontId = orderedToastIds[0];
    const frontHeight = allToastHeights[frontId!] || ESTIMATED_TOAST_HEIGHT;
    return frontHeight + index * stackGap - currentHeight;
  } else {
    const effectiveGap = isExpanded ? stackGap : gap;

    if (position === 'bottom-center') {
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
