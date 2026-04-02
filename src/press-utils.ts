import { Dimensions } from 'react-native';

// Define the close button area (right edge of screen)
const CLOSE_BUTTON_AREA = 60; // pixels from right edge

/**
 * Checks if a press event occurred near the close button area
 * @param x - The x coordinate of the press
 * @returns true if the press is near the close button area
 */
export const isPressNearCloseButton = ({ x }: { x: number }): boolean => {
  const screenWidth = Dimensions.get('window').width;
  return x > screenWidth - CLOSE_BUTTON_AREA;
};

/**
 * Gets the close button area width
 * @returns The width of the close button area in pixels
 */
export const getCloseButtonAreaWidth = (): number => {
  return CLOSE_BUTTON_AREA;
};
