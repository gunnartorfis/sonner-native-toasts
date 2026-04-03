import { useDerivedValue, withTiming } from 'react-native-reanimated';
import { STACKING_ANIMATION_DURATION } from './animations';
import { easeOutQuartFn } from './easings';
import { calculateToastPosition } from './position-utils';
import type { ToastPosition } from './types';

export const useToastPosition = ({
  id,
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
  id: string | number;
  index: number;
  numberOfToasts: number;
  enableStacking: boolean;
  position: ToastPosition;
  allToastHeights: Record<string | number, number>;
  gap: number;
  orderedToastIds: Array<string | number>;
  isExpanded: boolean;
  stackGap: number;
}) => {
  // Serialize to stable dep keys so useDerivedValue doesn't re-run on same-content new refs
  const orderedIdsKey = orderedToastIds.join(',');
  const heightsKey = JSON.stringify(allToastHeights);

  const yPosition = useDerivedValue(() => {
    'worklet';

    const calculatedPosition = calculateToastPosition({
      index,
      numberOfToasts,
      enableStacking,
      position,
      allToastHeights,
      gap,
      orderedToastIds,
      isExpanded,
      stackGap,
    });

    return withTiming(calculatedPosition, {
      duration: STACKING_ANIMATION_DURATION,
      easing: easeOutQuartFn,
    });
  }, [
    id,
    index,
    numberOfToasts,
    enableStacking,
    position,
    heightsKey,
    gap,
    orderedIdsKey,
    isExpanded,
    stackGap,
  ]);

  return yPosition;
};
