import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { STACKING_ANIMATION_DURATION } from './animations';
import { easeOutQuartFn } from './easings';
import type { ToastPosition } from './types';

// Wiggle, stacking scaleX narrowing, and the absolute stack-position style
// for a single toast.
export const useToastAnimations = ({
  toastPosition,
  index,
  numberOfToasts,
  enableStacking,
  isExpanded,
  stackGap,
  duration,
  yPosition,
}: {
  toastPosition: ToastPosition;
  index: number;
  numberOfToasts: number;
  enableStacking: boolean;
  isExpanded: boolean;
  stackGap: number;
  duration: number;
  yPosition: SharedValue<number>;
}) => {
  const wiggleSharedValue = useSharedValue(1);

  const wiggleAnimationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: wiggleSharedValue.value }],
    };
  }, [wiggleSharedValue]);

  // ScaleX: visual narrowing avoids layout-width changes that cause text rewrap
  const { width: screenWidth } = useWindowDimensions();
  const stackScaleX = useDerivedValue(() => {
    'worklet';
    if (!enableStacking || numberOfToasts <= 1 || isExpanded) {
      return withTiming(1, {
        duration: STACKING_ANIMATION_DURATION,
        easing: easeOutQuartFn,
      });
    }

    const multiplier =
      toastPosition === 'top-center' ? index : numberOfToasts - index - 1;
    const narrowAmount = stackGap * multiplier * 2;
    const scale = Math.max(0.8, 1 - narrowAmount / screenWidth);
    return withTiming(scale, {
      duration: STACKING_ANIMATION_DURATION,
      easing: easeOutQuartFn,
    });
  }, [
    enableStacking,
    numberOfToasts,
    index,
    toastPosition,
    isExpanded,
    stackGap,
    screenWidth,
  ]);

  const absolutePositionStyle = useAnimatedStyle(() => {
    const base: Record<string, unknown> = {
      position: 'absolute',
      width: '100%',
      transform: [
        { translateY: yPosition.value },
        { scaleX: stackScaleX.value },
      ],
    };
    if (toastPosition === 'bottom-center') {
      base.bottom = 0;
    } else {
      base.top = 0;
    }
    return base;
  }, [yPosition, toastPosition, stackScaleX]);

  const wiggle = React.useCallback(() => {
    'worklet';

    wiggleSharedValue.value = withRepeat(
      withTiming(Math.min(wiggleSharedValue.value * 1.035, 1.035), {
        duration: 150,
      }),
      4,
      true
    );
  }, [wiggleSharedValue]);

  const wiggleHandler = React.useCallback(() => {
    // we can't send Infinity over to the native layer.
    if (duration === Infinity) {
      return;
    }

    if (wiggleSharedValue.value !== 1) {
      // we should animate back to 1 and then wiggle
      wiggleSharedValue.value = withTiming(1, { duration: 150 }, wiggle);
    } else {
      wiggle();
    }
  }, [wiggle, wiggleSharedValue, duration]);

  const stackZIndex =
    toastPosition === 'top-center' ? -(index + 1) : -(numberOfToasts - index);

  return {
    absolutePositionStyle,
    stackZIndex,
    wiggleAnimationStyle,
    wiggleHandler,
  };
};
