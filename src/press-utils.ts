import { CLOSE_BUTTON_HIT_AREA } from './constants';

/**
 * Checks if a press event occurred near the close button area.
 * The x coordinate is relative to the gesture handler view.
 */
export const isPressNearCloseButton = ({
  x,
  viewWidth,
}: {
  x: number;
  viewWidth: number;
}): boolean => {
  return x > viewWidth - CLOSE_BUTTON_HIT_AREA;
};
