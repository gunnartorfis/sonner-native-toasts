import type {
  AutoWiggle,
  ToastPosition,
  ToastSwipeDirection,
  ToastTheme,
  ToastVariant,
} from './types';

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
  stackScale: number;
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
  stackScale: 0.95,
  stackGap: 8,
};
