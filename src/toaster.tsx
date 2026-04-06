import * as React from 'react';
import { Platform } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';
import { toastDefaultValues } from './constants';
import { DynamicToastContext, ToastContext } from './context';
import { getOrderedToastIds } from './position-utils';
import { Positioner } from './positioner';
import { Toast } from './toast';
import {
  type DynamicToastContextType,
  type StableToastContextType,
  type ToasterProps,
  type ToastPosition,
  type ToastProps,
} from './types';
import { toastStore } from './toast-store';
const allPositions: ToastPosition[] = ['top-center', 'bottom-center', 'center'];

const EMPTY_TOAST_OPTIONS: NonNullable<ToasterProps['toastOptions']> = {};
const EMPTY_ICONS: NonNullable<ToasterProps['icons']> = {};

function orderToastsFromPosition(
  currentToasts: ToastProps[],
  position: ToastPosition,
  enableStacking: boolean
): ToastProps[] {
  if (enableStacking) {
    return position === 'top-center'
      ? currentToasts.slice().reverse()
      : currentToasts;
  }
  return position === 'bottom-center'
    ? currentToasts
    : currentToasts.slice().reverse();
}

export const Toaster: React.FC<ToasterProps> = ({
  ToasterOverlayWrapper,
  ...toasterProps
}) => {
  const storeState = React.useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot
  );

  const { toasts, shouldShowOverlay, toastHeights, isExpanded, toastHeightsVersion } = storeState;

  const uiProps = { ...toasterProps, toasts, toastHeights, isExpanded, toastHeightsVersion };

  if (!shouldShowOverlay) {
    return <ToasterUI {...uiProps} />;
  }

  if (ToasterOverlayWrapper) {
    return (
      <ToasterOverlayWrapper>
        <ToasterUI {...uiProps} />
      </ToasterOverlayWrapper>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <FullWindowOverlay>
        <ToasterUI {...uiProps} />
      </FullWindowOverlay>
    );
  }

  return <ToasterUI {...uiProps} />;
};

const ToasterUI: React.FC<
  ToasterProps & {
    toasts: ToastProps[];
    toastHeights: Record<string | number, number>;
    isExpanded: boolean;
    toastHeightsVersion: number;
  }
> = ({
  toasts,
  toastHeights,
  isExpanded,
  toastHeightsVersion,
  duration = toastDefaultValues.duration,
  position = toastDefaultValues.position,
  offset = toastDefaultValues.offset,
  visibleToasts = toastDefaultValues.visibleToasts,
  swipeToDismissDirection = toastDefaultValues.swipeToDismissDirection,
  closeButton,
  invert,
  toastOptions = EMPTY_TOAST_OPTIONS,
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
  React.useEffect(() => {
    toastStore.setConfig({
      autoWiggleOnUpdate,
      visibleToasts,
      duration,
      pauseWhenPageIsHidden,
    });
  }, [autoWiggleOnUpdate, visibleToasts, duration, pauseWhenPageIsHidden]);

  const value: StableToastContextType = React.useMemo(
    () => ({
      duration: duration ?? toastDefaultValues.duration,
      position: position ?? toastDefaultValues.position,
      offset: offset ?? toastDefaultValues.offset,
      swipeToDismissDirection:
        swipeToDismissDirection ?? toastDefaultValues.swipeToDismissDirection,
      closeButton: closeButton ?? toastDefaultValues.closeButton,
      unstyled: toastOptions.unstyled ?? toastDefaultValues.unstyled,
      addToast: toastStore.addToast,
      invert: invert ?? toastDefaultValues.invert,
      icons: icons ?? EMPTY_ICONS,
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
    }),
    [
      duration,
      position,
      offset,
      swipeToDismissDirection,
      closeButton,
      toastOptions,
      invert,
      icons,
      pauseWhenPageIsHidden,
      gap,
      theme,
      autoWiggleOnUpdate,
      richColors,
      enableStacking,
      visibleToasts,
    ]
  );

  const dynamicValue: DynamicToastContextType = React.useMemo(
    () => ({
      toastHeights,
      toastHeightsVersion,
      isExpanded,
      expand: toastStore.expand,
      collapse: toastStore.collapse,
      toggleExpand: toastStore.toggleExpand,
    }),
    [toastHeights, toastHeightsVersion, isExpanded]
  );
  const orderedToasts = React.useMemo(
    () => orderToastsFromPosition(toasts, position, enableStacking),
    [toasts, position, enableStacking]
  );

  const onDismiss = React.useCallback<
    NonNullable<React.ComponentProps<typeof Toast>['onDismiss']>
  >((id) => {
    toastStore.dismissToast(id, 'onDismiss');
  }, []);

  const onAutoClose = React.useCallback<
    NonNullable<React.ComponentProps<typeof Toast>['onDismiss']>
  >((id) => {
    toastStore.dismissToast(id, 'onAutoClose');
  }, []);

  const possiblePositions = React.useMemo(
    () =>
      allPositions.filter(
        (possiblePossition) =>
          toasts.find(
            (positionedToast) =>
              positionedToast.position === possiblePossition
          ) || position === possiblePossition
      ),
    [toasts, position]
  );

  return (
    <ToastContext.Provider value={value}>
      <DynamicToastContext.Provider value={dynamicValue}>
      {possiblePositions.map((currentPosition, positionIndex) => {
        const toastsForPosition = orderedToasts.filter(
          (possibleToast) =>
            (!possibleToast.position && positionIndex === 0) ||
            possibleToast.position === currentPosition
        );
        const orderedToastIds = getOrderedToastIds(
          toastsForPosition,
          currentPosition,
          enableStacking
        );
        return (
        <Positioner
          key={currentPosition}
          style={positionerStyle}
          position={currentPosition}
        >
          {toastsForPosition
            .map((toastToRender, index) => {
              const ToastToRender = (
                <Toast
                  {...props}
                  {...toastToRender}
                  parentStyle={props.style}
                  parentStyles={props.styles}
                  onDismiss={onDismiss}
                  onAutoClose={onAutoClose}
                  index={index}
                  ref={toastStore.getToastRef(toastToRender.id)}
                  key={toastToRender.id}
                  numberOfToasts={toastsForPosition.length}
                  orderedToastIds={orderedToastIds}
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
        );
      })}
    </DynamicToastContext.Provider>
    </ToastContext.Provider>
  );
};
