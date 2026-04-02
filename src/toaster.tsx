import * as React from 'react';
import { Platform } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';
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
  ToastWrapper,
  ...props
}) => {
  const storeState = React.useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot
  );

  const { toasts } = storeState;

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
  };
  const orderToastsFromPosition: (
    currentToasts: ToastProps[]
  ) => ToastProps[] = (currentToasts) => {
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

  const orderedToasts = orderToastsFromPosition(toasts);

  return (
    <ToastContext.Provider value={value}>
      {possiblePositions.map((currentPosition, positionIndex) => (
        <Positioner position={currentPosition} key={currentPosition}>
          {orderedToasts
            .filter(
              (possibleToast) =>
                (!possibleToast.position && positionIndex === 0) ||
                possibleToast.position === currentPosition
            )
            .map((toastToRender) => {
              const ToastToRender = (
                <Toast
                  {...toastToRender}
                  onDismiss={onDismiss}
                  onAutoClose={onAutoClose}
                  ref={toastStore.getToastRef(toastToRender.id)}
                  key={toastToRender.id}
                  {...props}
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
