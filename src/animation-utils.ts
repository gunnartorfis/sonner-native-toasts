import type { ToastPosition } from './types';

export const getEnteringTranslateY = (position: ToastPosition): number => {
  'worklet';
  if (position === 'top-center') {
    return -20;
  }

  // bottom-center and center share the same enter direction (slide up from below)
  return 50;
};

export const getExitingTranslateY = ({
  position,
  isHiddenByLimit,
  numberOfToasts,
  stackGap,
}: {
  position: ToastPosition;
  isHiddenByLimit?: boolean;
  numberOfToasts?: number;
  stackGap: number;
}): number => {
  'worklet';
  if (isHiddenByLimit) {
    return 0;
  }

  if (numberOfToasts == null || numberOfToasts === 1) {
    if (position === 'top-center') {
      return -150;
    }
    // bottom-center and center
    return 150;
  }

  if (position === 'top-center') {
    return -stackGap;
  }
  return stackGap;
};
