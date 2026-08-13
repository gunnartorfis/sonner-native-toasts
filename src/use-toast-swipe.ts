import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useDynamicToastContext, useToastContext } from './context';
import { isPressNearCloseButton } from './press-utils';
import { toastStore } from './toast-store';
import type { ToastProps } from './types';
import type { ToastSwipeHandler } from './gestures';

// Swipe/press behavior for a single toast: timer pause/resume around drags,
// expand/collapse and close-button handling on tap, and the memoized prop
// object handed to ToastSwipeHandler.
export const useToastSwipeProps = ({
  id,
  position,
  numberOfToasts,
  dismissible,
  closeButton,
  promiseOptions,
  important,
  unstyled,
  mergedContainerStyle,
  onDismiss,
  onPress,
}: {
  id: ToastProps['id'];
  position: ToastProps['position'];
  numberOfToasts: number;
  dismissible: boolean;
  closeButton?: boolean;
  promiseOptions?: ToastProps['promiseOptions'];
  important?: boolean;
  unstyled?: boolean;
  mergedContainerStyle?: ViewStyle;
  onDismiss?: ToastProps['onDismiss'];
  onPress?: () => void;
}): React.ComponentProps<typeof ToastSwipeHandler> => {
  const {
    position: positionCtx,
    enableStacking,
    toastOptions: { toastContainerStyle: toastContainerStyleCtx },
  } = useToastContext();
  const { isExpanded, toggleExpand } = useDynamicToastContext();
  const { width: screenWidth } = useWindowDimensions();

  const isDragging = React.useRef(false);

  const onRemove = React.useCallback(() => {
    onDismiss?.(id);
  }, [onDismiss, id]);

  const onSwipeBegin = React.useCallback(() => {
    isDragging.current = true;
    toastStore.pauseTimer(id);
  }, [id]);

  const onSwipeFinalize = React.useCallback(() => {
    isDragging.current = false;
    if (!isExpanded) {
      toastStore.resumeTimer(id);
    }
  }, [id, isExpanded]);

  const onSwipePress = React.useCallback(
    ({ x }: { x: number; y: number }) => {
      const pressToastPosition = position || positionCtx;
      if (
        enableStacking &&
        numberOfToasts > 1 &&
        pressToastPosition !== 'center'
      ) {
        if (
          isPressNearCloseButton({
            x,
            viewWidth: screenWidth,
          })
        ) {
          // On Android, the RNGH Tap gesture intercepts the touch before
          // it reaches the native Pressable (close button). Dismiss
          // explicitly when tapping the close button area while expanded.
          if (isExpanded && closeButton && dismissible) {
            onDismiss?.(id);
          }
        } else {
          toggleExpand();
        }
      }
      onPress?.();
    },
    [
      position,
      positionCtx,
      enableStacking,
      numberOfToasts,
      toggleExpand,
      onPress,
      isExpanded,
      closeButton,
      dismissible,
      onDismiss,
      id,
      screenWidth,
    ]
  );

  return React.useMemo(
    () => ({
      onRemove,
      onBegin: onSwipeBegin,
      onFinalize: onSwipeFinalize,
      onPress: onSwipePress,
      enabled: !promiseOptions && dismissible,
      style: [toastContainerStyleCtx, mergedContainerStyle],
      unstyled,
      important,
      position,
    }),
    [
      onRemove,
      onSwipeBegin,
      onSwipeFinalize,
      onSwipePress,
      promiseOptions,
      dismissible,
      toastContainerStyleCtx,
      mergedContainerStyle,
      unstyled,
      important,
      position,
    ]
  );
};
