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
const EMPTY_ANIMATION: NonNullable<ToasterProps['animation']> = {};

type PositionData = {
  position: ToastPosition;
  toasts: ToastProps[];
  orderedToastIds: Array<string | number>;
};

function areArrayItemsIdentical<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((item, i) => item === b[i]);
}

function orderToastsFromPosition(
  currentToasts: ToastProps[],
  position: ToastPosition
): ToastProps[] {
  return position === 'top-center'
    ? currentToasts.slice().reverse()
    : currentToasts;
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
  allowFontScaling,
  maxFontSizeMultiplier,
  toastOptions = EMPTY_TOAST_OPTIONS,
  icons,
  pauseWhenPageIsHidden,
  gap,
  theme,
  autoWiggleOnUpdate,
  richColors,
  enableStacking = toastDefaultValues.enableStacking,
  animation,
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
      allowFontScaling: allowFontScaling ?? toastDefaultValues.allowFontScaling,
      maxFontSizeMultiplier,
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
      animation: animation ?? EMPTY_ANIMATION,
    }),
    [
      duration,
      position,
      offset,
      swipeToDismissDirection,
      closeButton,
      toastOptions,
      invert,
      allowFontScaling,
      maxFontSizeMultiplier,
      icons,
      pauseWhenPageIsHidden,
      gap,
      theme,
      autoWiggleOnUpdate,
      richColors,
      enableStacking,
      visibleToasts,
      animation,
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

  // Per-position render data with stable identities: entries (and their
  // toasts/orderedToastIds arrays) are reused from the previous render when
  // their contents are unchanged, so React.memo on Toast can bail out for
  // positions untouched by a store change.
  // useState (not useRef): the react-hooks/refs rule forbids ref reads in
  // render; this Map is a memo table whose writes are render-idempotent.
  const [positionsCache] = React.useState(
    () => new Map<string, PositionData>()
  );
  const positionsData = React.useMemo(() => {
    const previous = new Map(positionsCache);
    positionsCache.clear();
    const data = allPositions
      .filter(
        (possiblePosition) =>
          toasts.find(
            (positionedToast) =>
              positionedToast.position === possiblePosition
          ) || position === possiblePosition
      )
      .map((currentPosition) => {
        const toastsForPosition = orderToastsFromPosition(
          toasts.filter(
            (possibleToast) =>
              (possibleToast.position ?? position) === currentPosition
          ),
          currentPosition
        );
        const orderedToastIds = getOrderedToastIds(
          toastsForPosition,
          currentPosition,
          enableStacking
        );
        const previousEntry = previous.get(currentPosition);
        const entry =
          previousEntry &&
          areArrayItemsIdentical(previousEntry.toasts, toastsForPosition) &&
          areArrayItemsIdentical(
            previousEntry.orderedToastIds,
            orderedToastIds
          )
            ? previousEntry
            : { position: currentPosition, toasts: toastsForPosition, orderedToastIds };
        positionsCache.set(currentPosition, entry);
        return entry;
      });
    return data;
  }, [positionsCache, toasts, position, enableStacking]);

  return (
    <ToastContext.Provider value={value}>
      <DynamicToastContext.Provider value={dynamicValue}>
      {positionsData.map(({ position: currentPosition, toasts: toastsForPosition, orderedToastIds }) => {
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
                  key={toastToRender.id}
                  {...props}
                  {...toastToRender}
                  parentStyle={props.style}
                  parentStyles={props.styles}
                  onDismiss={onDismiss}
                  onAutoClose={onAutoClose}
                  index={index}
                  ref={toastStore.getToastRef(toastToRender.id)}
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
