import * as React from 'react';
import { Platform } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';
import { useSharedValue } from 'react-native-reanimated';
import { toastDefaultValues } from './constants';
import { ToastContext } from './context';
import { Positioner } from './positioner';
import { Toast } from './toast';
import {
  type ToasterContextType,
  type ToasterProps,
  type ToastPosition,
  type ToastProps,
} from './types';
import { toastStore } from './toast-store';
const allPositions: ToastPosition[] = ['top-center', 'bottom-center', 'center'];

export const Toaster: React.FC<ToasterProps> = ({
  ToasterOverlayWrapper,
  ...toasterProps
}) => {
  const storeState = React.useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot
  );

  if (!storeState.shouldShowOverlay) {
    return <ToasterUI {...toasterProps} />;
  }

  if (ToasterOverlayWrapper) {
    return (
      <ToasterOverlayWrapper>
        <ToasterUI {...toasterProps} />
      </ToasterOverlayWrapper>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <FullWindowOverlay>
        <ToasterUI {...toasterProps} />
      </FullWindowOverlay>
    );
  }

  return <ToasterUI {...toasterProps} />;
};

export const ToasterUI: React.FC<ToasterProps> = ({
  duration = toastDefaultValues.duration,
  position = toastDefaultValues.position,
  offset = toastDefaultValues.offset,
  visibleToasts = toastDefaultValues.visibleToasts,
  swipeToDismissDirection = toastDefaultValues.swipeToDismissDirection,
  closeButton,
  invert,
  toastOptions = {},
  icons,
  pauseWhenPageIsHidden,
  gap,
  theme,
  autoWiggleOnUpdate,
  richColors,
  enableStacking = toastDefaultValues.enableStacking,
  ToastWrapper,
  positionerStyle,
  ...props
}) => {
  const storeState = React.useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot
  );

  const { toasts, toastHeights, isExpanded } = storeState;

  // Shared value to track the newest toast's height for stacking
  const newestToastHeightShared = useSharedValue(0);

  // Update store config when props change
  React.useEffect(() => {
    toastStore.setConfig({
      autoWiggleOnUpdate,
      visibleToasts,
      duration,
      pauseWhenPageIsHidden,
    });
  }, [autoWiggleOnUpdate, visibleToasts, duration, pauseWhenPageIsHidden]);

  const dismissToast: (
    id: string | number | undefined,
    origin?: 'onDismiss' | 'onAutoClose'
  ) => string | number | undefined = (id, origin) => {
    return toastStore.dismissToast(id, origin);
  };

  const value: ToasterContextType = {
    duration: duration ?? toastDefaultValues.duration,
    position: position ?? toastDefaultValues.position,
    offset: offset ?? toastDefaultValues.offset,
    swipeToDismissDirection:
      swipeToDismissDirection ?? toastDefaultValues.swipeToDismissDirection,
    closeButton: closeButton ?? toastDefaultValues.closeButton,
    unstyled: toastOptions.unstyled ?? toastDefaultValues.unstyled,
    addToast: toastStore.addToast,
    invert: invert ?? toastDefaultValues.invert,
    icons: icons ?? {},
    pauseWhenPageIsHidden:
      pauseWhenPageIsHidden ?? toastDefaultValues.pauseWhenPageIsHidden,
    gap: gap ?? toastDefaultValues.gap,
    theme: theme ?? toastDefaultValues.theme,
    toastOptions,
    autoWiggleOnUpdate:
      autoWiggleOnUpdate ?? toastDefaultValues.autoWiggleOnUpdate,
    richColors: richColors ?? toastDefaultValues.richColors,
    enableStacking: enableStacking ?? toastDefaultValues.enableStacking,
    visibleToasts: visibleToasts ?? toastDefaultValues.visibleToasts,
    newestToastHeightShared,
    toastHeights,
    isExpanded,
    expand: toastStore.expand,
    collapse: toastStore.collapse,
    toggleExpand: toastStore.toggleExpand,
  };
  const orderToastsFromPosition: (args: {
    currentToasts: ToastProps[];
    enableStacking: boolean;
  }) => ToastProps[] = ({ currentToasts, enableStacking }) => {
    if (enableStacking) {
      // For top: reverse order so newest toast is rendered first (appears behind)
      // For bottom: keep original order so newest toast is rendered last (appears in front)
      return position === 'top-center'
        ? currentToasts.slice().reverse()
        : currentToasts;
    }
    return position === 'bottom-center'
      ? currentToasts
      : currentToasts.slice().reverse();
  };

  const onDismiss: NonNullable<
    React.ComponentProps<typeof Toast>['onDismiss']
  > = (id) => {
    dismissToast(id, 'onDismiss');
  };

  const onAutoClose: NonNullable<
    React.ComponentProps<typeof Toast>['onDismiss']
  > = (id) => {
    dismissToast(id, 'onAutoClose');
  };

  const possiblePositions = allPositions.filter((possiblePossition) => {
    return (
      toasts.find(
        (positionedToast) => positionedToast.position === possiblePossition
      ) || value.position === possiblePossition
    );
  });

  const orderedToasts = orderToastsFromPosition({
    currentToasts: toasts,
    enableStacking,
  });

  return (
    <ToastContext.Provider value={value}>
      {possiblePositions.map((currentPosition, positionIndex) => (
        <Positioner
          key={currentPosition}
          style={positionerStyle}
          position={currentPosition}
        >
          {orderedToasts
            .filter(
              (possibleToast) =>
                (!possibleToast.position && positionIndex === 0) ||
                possibleToast.position === currentPosition
            )
            .map((toastToRender, index) => {
              const ToastToRender = (
                <Toast
                  {...props}
                  {...toastToRender}
                  style={{
                    ...props.style,
                    ...toastToRender.style,
                  }}
                  styles={{
                    toastContainer: {
                      ...props.styles?.toastContainer,
                      ...toastToRender.styles?.toastContainer,
                    },
                    toast: {
                      ...props.styles?.toast,
                      ...toastToRender.styles?.toast,
                    },
                    toastContent: {
                      ...props.styles?.toastContent,
                      ...toastToRender.styles?.toastContent,
                    },
                    textContainer: {
                      ...props.styles?.textContainer,
                      ...toastToRender.styles?.textContainer,
                    },
                    title: {
                      ...props.styles?.title,
                      ...toastToRender.styles?.title,
                    },
                    description: {
                      ...props.styles?.description,
                      ...toastToRender.styles?.description,
                    },
                    buttons: {
                      ...props.styles?.buttons,
                      ...toastToRender.styles?.buttons,
                    },
                    closeButton: {
                      ...props.styles?.closeButton,
                      ...toastToRender.styles?.closeButton,
                    },
                    closeButtonIcon: {
                      ...props.styles?.closeButtonIcon,
                      ...toastToRender.styles?.closeButtonIcon,
                    },
                  }}
                  onDismiss={onDismiss}
                  onAutoClose={onAutoClose}
                  index={index}
                  ref={toastStore.getToastRef(toastToRender.id)}
                  key={toastToRender.id}
                  numberOfToasts={orderedToasts.length}
                />
              );

              if (ToastWrapper) {
                return (
                  <ToastWrapper
                    key={toastToRender.id}
                    toastId={toastToRender.id}
                  >
                    {ToastToRender}
                  </ToastWrapper>
                );
              }
              return ToastToRender;
            })}
        </Positioner>
      ))}
    </ToastContext.Provider>
  );
};
