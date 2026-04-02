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
  // If toast is hidden by visibility limit, no slide movement needed
  if (isHiddenByLimit) {
    return 0;
  }

  // Determine slide distance based on number of visible toasts
  const getSlideDistance = () => {
    // If only 1 toast, slide fully
    if (numberOfToasts === 1) {
      if (position === 'top-center') {
        return -150;
      }
      if (position === 'bottom-center') {
        return 150;
      }
      return 50;
    }

    // If more than 1 toast, only slide by stackGap
    if (position === 'top-center') {
      return -stackGap;
    }
    if (position === 'bottom-center') {
      return stackGap;
    }
    return stackGap;
  };

  return getSlideDistance();
};
