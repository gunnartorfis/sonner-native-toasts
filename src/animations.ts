import { withTiming } from 'react-native-reanimated';
import { getEnteringTranslateY, getExitingTranslateY } from './animation-utils';
import { toastDefaultValues } from './constants';
import { useToastContext } from './context';
import { easeInOutCubic, easeOutQuartFn } from './easings';
import type { ToastPosition } from './types';

export const ANIMATION_DURATION = 600;

export const useToastLayoutAnimations = (
  positionProp: ToastPosition | undefined,
  isHiddenByLimit?: boolean,
  numberOfToasts?: number
) => {
  const { position: positionCtx, gap } = useToastContext();
  const position = positionProp || positionCtx;
  const stackGap = gap ?? toastDefaultValues.stackGap;

  return {
    entering: () => {
      'worklet';
      return getToastEntering({ position });
    },
    exiting: () => {
      'worklet';
      return getToastExiting({ position, isHiddenByLimit, numberOfToasts, stackGap });
    },
  };
};

type GetToastAnimationParams = {
  position: ToastPosition;
  isHiddenByLimit?: boolean;
  numberOfToasts?: number;
  stackGap?: number;
};

export const getToastEntering = ({ position }: GetToastAnimationParams) => {
  'worklet';

  const animations = {
    opacity: withTiming(1, {
      easing: easeOutQuartFn,
      duration: ANIMATION_DURATION,
    }),
    transform: [
      {
        translateY: withTiming(0, {
          easing: easeOutQuartFn,
          duration: ANIMATION_DURATION,
        }),
      },
    ],
  };

  const translateY = getEnteringTranslateY(position);

  const initialValues = {
    opacity: 0,
    transform: [
      {
        translateY,
      },
    ],
  };

  return {
    initialValues,
    animations,
  };
};

export const getToastExiting = ({
  position,
  isHiddenByLimit,
  numberOfToasts,
  stackGap = 8,
}: GetToastAnimationParams) => {
  'worklet';

  // If toast is hidden by visibility limit, only fade out without sliding
  if (isHiddenByLimit) {
    const animations = {
      opacity: withTiming(0, {
        easing: easeInOutCubic,
        duration: ANIMATION_DURATION,
      }),
    };

    const initialValues = {
      opacity: 1,
    };

    return {
      initialValues,
      animations,
    };
  }

  const translateY = getExitingTranslateY({
    position,
    isHiddenByLimit,
    numberOfToasts,
    stackGap,
  });

  const animations = {
    opacity: withTiming(0, { easing: easeInOutCubic }),
    transform: [
      {
        translateY: withTiming(translateY, {
          easing: easeInOutCubic,
        }),
      },
    ],
  };

  const initialValues = {
    opacity: 1,
    transform: [
      {
        translateY: 0,
      },
    ],
  };

  return {
    initialValues,
    animations,
  };
};
