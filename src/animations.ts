import { withTiming } from 'react-native-reanimated';
import { useToastContext } from './context';
import { easeInOutCubic, easeOutCirc } from './easings';
import type { ToastPosition } from './types';

export const ANIMATION_DURATION = 300;

export const useToastLayoutAnimations = (
  positionProp: ToastPosition | undefined
) => {
  const { position: positionCtx } = useToastContext();
  const position = positionProp || positionCtx;

  return {
    entering: () => {
      'worklet';
      return getToastEntering({ position });
    },
    exiting: () => {
      'worklet';
      return getToastExiting({ position });
    },
  };
};

type GetToastAnimationParams = {
  position: ToastPosition;
};

export const getToastEntering = ({ position }: GetToastAnimationParams) => {
  'worklet';

  const animations = {
    opacity: withTiming(1, { easing: easeOutCirc }),
    transform: [
      { scale: withTiming(1, { easing: easeOutCirc }) },
      {
        translateY: withTiming(0, {
          easing: easeOutCirc,
        }),
      },
    ],
  };

  const translateY = (() => {
    if (position === 'top-center') {
      return -50;
    }

    if (position === 'bottom-center') {
      return 50;
    }

    return 0;
  })();

  const initialValues = {
    opacity: 0,
    transform: [
      { scale: 0 },
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

export const getToastExiting = ({ position }: GetToastAnimationParams) => {
  'worklet';

  const translateY = (() => {
    if (position === 'top-center') {
      return -150;
    }

    if (position === 'bottom-center') {
      return 150;
    }

    return 50;
  })();

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
