import type {
  AutoWiggle,
  ToastPosition,
  ToastSwipeDirection,
  ToastTheme,
  ToastVariant,
} from './types';

export const ESTIMATED_TOAST_HEIGHT = 70;
export const CLOSE_BUTTON_HIT_AREA = 60;
export const OUTSIDE_PRESS_PADDING = 20;

export const toastDefaultValues: {
  duration: number;
  position: ToastPosition;
  offset: number;
  swipeToDismissDirection: ToastSwipeDirection;
  variant: ToastVariant;
  visibleToasts: number;
  closeButton: boolean;
  dismissible: boolean;
  unstyled: boolean;
  invert: boolean;
  pauseWhenPageIsHidden: boolean;
  gap: number;
  theme: ToastTheme;
  autoWiggleOnUpdate: AutoWiggle;
  richColors: boolean;
  enableStacking: boolean;
  stackGap: number;
} = {
  duration: 4000,
  position: 'top-center',
  offset: 0,
  swipeToDismissDirection: 'up',
  variant: 'info',
  visibleToasts: 3,
  closeButton: false,
  dismissible: true,
  unstyled: false,
  invert: false,
  pauseWhenPageIsHidden: false,
  gap: 14,
  theme: 'system',
  autoWiggleOnUpdate: 'never',
  richColors: false,
  enableStacking: true,
  stackGap: 8,
};
