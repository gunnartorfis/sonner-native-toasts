import { Dimensions } from 'react-native';

// Width of the close button hit area from the right edge
const CLOSE_BUTTON_AREA = 60;

/**
 * Checks if a press event occurred near the close button area.
 * The x coordinate is relative to the gesture handler view which is full screen width.
 */
export const isPressNearCloseButton = ({ x }: { x: number }): boolean => {
  const { width } = Dimensions.get('window');
  return x > width - CLOSE_BUTTON_AREA;
};
