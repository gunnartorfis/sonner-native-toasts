import { useReducedMotion, withTiming } from 'react-native-reanimated';
import type { EntryExitAnimationFunction } from 'react-native-reanimated';
import { getEnteringTranslateY, getExitingTranslateY } from './animation-utils';
import { toastDefaultValues } from './constants';
import { useToastContext } from './context';
import { easeInOutCubic, easeOutQuartFn } from './easings';
import type { ToastAnimation, ToastEntryExitAnimation, ToastPosition } from './types';

export const ENTERING_ANIMATION_DURATION = 300;
export const STACKING_ANIMATION_DURATION = 600;

type ResolvedAnimation = Exclude<ToastEntryExitAnimation, 'default'>;

export const resolveAnimationField = (
  toastValue: ToastEntryExitAnimation | undefined,
  toasterValue: ToastEntryExitAnimation | undefined,
  defaultValue: EntryExitAnimationFunction
): ResolvedAnimation => {
  const resolved = toastValue !== undefined ? toastValue : toasterValue;
  if (resolved === undefined || resolved === 'default') {
    return defaultValue;
  }
  return resolved;
};

export const useToastLayoutAnimations = (
  positionProp: ToastPosition | undefined,
  animationProp: ToastAnimation | undefined,
  isHiddenByLimit?: boolean,
  numberOfToasts?: number
) => {
  const { position: positionCtx, gap, animation: animationCtx } = useToastContext();
  const position = positionProp || positionCtx;
  const stackGap = gap ?? toastDefaultValues.stackGap;
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return { entering: undefined, exiting: undefined };
  }

  const defaultEntering: EntryExitAnimationFunction = () => {
    'worklet';
    return getToastEntering({ position });
  };

  const defaultExiting: EntryExitAnimationFunction = () => {
    'worklet';
    return getToastExiting({
      position,
      isHiddenByLimit,
      numberOfToasts,
      stackGap,
    });
  };

  const entering = resolveAnimationField(
    animationProp?.enter,
    animationCtx?.enter,
    defaultEntering
  );

  // Overflow-cull (isHiddenByLimit) always uses the library fade exit.
  // User-supplied custom exits would look wrong on a buried toast.
  const exiting = isHiddenByLimit
    ? defaultExiting
    : resolveAnimationField(
        animationProp?.exit,
        animationCtx?.exit,
        defaultExiting
      );

  return { entering, exiting };
};

type GetToastAnimationParams = {
  position: ToastPosition;
  isHiddenByLimit?: boolean;
  numberOfToasts?: number;
  stackGap?: number;
};

const getToastEntering = ({ position }: GetToastAnimationParams) => {
  'worklet';

  const animations = {
    opacity: withTiming(1, {
      easing: easeOutQuartFn,
      duration: ENTERING_ANIMATION_DURATION,
    }),
    transform: [
      {
        translateY: withTiming(0, {
          easing: easeOutQuartFn,
          duration: ENTERING_ANIMATION_DURATION,
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

const getToastExiting = ({
  position,
  isHiddenByLimit,
  numberOfToasts,
  stackGap = 8,
}: GetToastAnimationParams) => {
  'worklet';

  if (isHiddenByLimit) {
    const animations = {
      opacity: withTiming(0, {
        easing: easeInOutCubic,
        duration: ENTERING_ANIMATION_DURATION,
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
