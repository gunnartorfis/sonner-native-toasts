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
  return position === 'top-center'
    ? toasts.map((t) => t.id).reverse()
    : toasts.map((t) => t.id);
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

  // Center anchors at top:50% of the screen (top edge of toast = center line).
  // Shift by -frontHeight/2 so the front toast is visually centered on the line.
  const centerShift =
    position === 'center'
      ? -(
          (allToastHeights[orderedToastIds[numberOfToasts - 1]!] ||
            ESTIMATED_TOAST_HEIGHT) / 2
        )
      : 0;

  if (effectiveEnableStacking) {
    const currentId = orderedToastIds[index];
    const currentHeight = allToastHeights[currentId!] || ESTIMATED_TOAST_HEIGHT;

    if (position === 'top-center') {
      const frontId = orderedToastIds[0];
      const frontHeight = allToastHeights[frontId!] || ESTIMATED_TOAST_HEIGHT;
      return frontHeight + index * stackGap - currentHeight;
    }
    // bottom-center and center
    const frontId = orderedToastIds[numberOfToasts - 1];
    const frontHeight = allToastHeights[frontId!] || ESTIMATED_TOAST_HEIGHT;
    const distFromFront = numberOfToasts - 1 - index;
    return (
      centerShift - (frontHeight + distFromFront * stackGap - currentHeight)
    );
  }

  const effectiveGap = isExpanded ? stackGap : gap;

  if (position === 'top-center') {
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

  // bottom-center and center
  let totalOffset = 0;
  for (let i = numberOfToasts - 1; i > index; i--) {
    const toastId = orderedToastIds[i];
    if (!toastId) {
      continue;
    }
    const height = allToastHeights[toastId] || ESTIMATED_TOAST_HEIGHT;
    totalOffset += height + effectiveGap;
  }
  return centerShift - totalOffset;
};
