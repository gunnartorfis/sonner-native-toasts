import type { ToastPosition } from './types';

export const getEnteringTranslateY = (position: ToastPosition): number => {
  'worklet';
  if (position === 'top-center') {
    return -20;
  }

  if (position === 'bottom-center') {
    return 50;
  }

  return 0;
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
    if (position === 'bottom-center') {
      return 150;
    }
    return 50;
  }

  if (position === 'top-center') {
    return -stackGap;
  }
  if (position === 'bottom-center') {
    return stackGap;
  }
  return stackGap;
};
