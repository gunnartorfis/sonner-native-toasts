import * as React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useToastLayoutAnimations } from './animations';
import { toastDefaultValues } from './constants';
import { useDynamicToastContext, useToastContext } from './context';
import { ToastSwipeHandler } from './gestures';
import { ToastContent } from './toast-content';
import { type ToastProps, type ToastRef, type ToastStyles } from './types';
import { useDefaultStyles } from './use-default-styles';
import { useMergedStyles } from './use-merged-styles';
import { useToastAnimations } from './use-toast-animations';
import { useToastLifecycle } from './use-toast-lifecycle';
import { useToastPosition } from './use-toast-position';
import { useToastSwipeProps } from './use-toast-swipe';

type ToastInternalProps = ToastProps & {
  parentStyle?: ToastProps['style'];
  parentStyles?: ToastStyles;
};

const ToastComponent = React.forwardRef<ToastRef, ToastInternalProps>(
  (
    {
      id,
      title,
      jsx,
      description,
      icon,
      duration: durationProps,
      variant,
      action,
      cancel,
      close,
      onDismiss,
      dismissible = toastDefaultValues.dismissible,
      closeButton: closeButtonProps,
      actionButtonStyle,
      actionButtonTextStyle,
      cancelButtonStyle,
      cancelButtonTextStyle,
      style,
      styles,
      parentStyle,
      parentStyles,
      promiseOptions,
      position,
      animation,
      unstyled: unstyledProps,
      important,
      invert: invertProps,
      richColors: richColorsProps,
      onPress,
      allowFontScaling: allowFontScalingProps,
      maxFontSizeMultiplier: maxFontSizeMultiplierProps,
      backgroundComponent: backgroundComponentProps,
      numberOfToasts,
      index,
      orderedToastIds,
    },
    ref
  ) => {
    const {
      duration: durationCtx,
      closeButton: closeButtonCtx,
      invert: invertCtx,
      richColors: richColorsCtx,
      allowFontScaling: allowFontScalingCtx,
      maxFontSizeMultiplier: maxFontSizeMultiplierCtx,
      enableStacking,
      gap,
      position: positionCtx,
      visibleToasts: visibleToastsCtx,
      toastOptions: {
        unstyled: unstyledCtx,
        style: toastStyleCtx,
        backgroundComponent: backgroundComponentCtx,
        success: successStyleCtx,
        error: errorStyleCtx,
        warning: warningStyleCtx,
        info: infoStyleCtx,
        loading: loadingStyleCtx,
      },
    } = useToastContext();
    const { toastHeights, toastHeightsVersion, isExpanded } =
      useDynamicToastContext();
    const invert = invertProps ?? invertCtx;
    const richColors = richColorsProps ?? richColorsCtx;
    const allowFontScaling = allowFontScalingProps ?? allowFontScalingCtx;
    const maxFontSizeMultiplier =
      maxFontSizeMultiplierProps ?? maxFontSizeMultiplierCtx;
    const unstyled = unstyledProps ?? unstyledCtx;
    const duration = durationProps ?? durationCtx;
    const closeButton = closeButtonProps ?? closeButtonCtx;
    const backgroundComponent =
      backgroundComponentProps ?? backgroundComponentCtx;

    const { mergedStyle, mergedStyles } = useMergedStyles({
      style,
      styles,
      parentStyle,
      parentStyles,
    });

    const toastPosition = position ?? positionCtx;

    // Determine if this toast should be hidden due to visibility limit
    // For top-center (reversed array), front = index 0; for others, front = highest index
    const distanceFromFront =
      toastPosition === 'top-center' ? index : numberOfToasts - 1 - index;
    const isHiddenByLimit =
      enableStacking &&
      distanceFromFront >=
        (visibleToastsCtx ?? toastDefaultValues.visibleToasts);

    const { entering, exiting } = useToastLayoutAnimations(
      position,
      animation,
      isHiddenByLimit,
      numberOfToasts
    );

    const stackGap = gap ?? toastDefaultValues.stackGap;
    const yPosition = useToastPosition({
      id,
      index,
      numberOfToasts,
      enableStacking,
      position: toastPosition,
      allToastHeights: toastHeights,
      gap,
      orderedToastIds,
      isExpanded,
      stackGap,
      toastHeightsVersion,
    });

    const {
      absolutePositionStyle,
      stackZIndex,
      wiggleAnimationStyle,
      wiggleHandler,
    } = useToastAnimations({
      toastPosition,
      index,
      numberOfToasts,
      enableStacking,
      isExpanded,
      stackGap,
      duration,
      yPosition,
    });

    React.useImperativeHandle(ref, () => ({
      wiggle: wiggleHandler,
    }));

    const toastRef = React.useRef<
      View & { getBoundingClientRect?: () => DOMRect }
    >(null);

    useToastLifecycle({
      id,
      toastRef,
      variant,
      title,
      description,
      jsx,
    });

    const defaultStyles = useDefaultStyles({
      invert,
      richColors,
      unstyled,
      description,
      variant,
    });

    const variantStyle =
      variant === 'success'
        ? successStyleCtx
        : variant === 'error'
          ? errorStyleCtx
          : variant === 'warning'
            ? warningStyleCtx
            : variant === 'info'
              ? infoStyleCtx
              : loadingStyleCtx;

    const toastSwipeHandlerProps = useToastSwipeProps({
      id,
      position,
      numberOfToasts,
      dismissible,
      closeButton,
      promiseOptions,
      important,
      unstyled,
      mergedContainerStyle: mergedStyles?.toastContainer,
      onDismiss,
      onPress,
    });

    if (jsx) {
      return (
        <Animated.View style={[absolutePositionStyle, { zIndex: stackZIndex }]}>
          <ToastSwipeHandler {...toastSwipeHandlerProps}>
            <Animated.View ref={toastRef} entering={entering} exiting={exiting}>
              {jsx}
            </Animated.View>
          </ToastSwipeHandler>
        </Animated.View>
      );
    }

    const backgroundComponentStyle = backgroundComponent
      ? {
          overflow: 'hidden' as const,
          backgroundColor: 'transparent',
        }
      : undefined;

    const contentContainerStyle = backgroundComponent
      ? { position: 'relative' as const, zIndex: 1 }
      : undefined;

    return (
      <Animated.View style={[absolutePositionStyle, { zIndex: stackZIndex }]}>
        <ToastSwipeHandler {...toastSwipeHandlerProps}>
          <Animated.View style={wiggleAnimationStyle}>
            <Animated.View
              ref={toastRef}
              style={[
                unstyled ? undefined : elevationStyle,
                defaultStyles.toast,
                toastStyleCtx,
                variantStyle,
                mergedStyles?.toast,
                mergedStyle,
                backgroundComponentStyle,
              ]}
              entering={entering}
              exiting={exiting}
            >
              {backgroundComponent}
              <ToastContent
                id={id}
                title={title}
                description={description}
                icon={icon}
                variant={variant}
                action={action}
                cancel={cancel}
                close={close}
                closeButton={closeButton}
                dismissible={dismissible}
                onDismiss={onDismiss}
                promiseOptions={promiseOptions}
                actionButtonStyle={actionButtonStyle}
                actionButtonTextStyle={actionButtonTextStyle}
                cancelButtonStyle={cancelButtonStyle}
                cancelButtonTextStyle={cancelButtonTextStyle}
                invert={invert}
                richColors={richColors}
                unstyled={unstyled}
                allowFontScaling={allowFontScaling}
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                mergedStyles={mergedStyles}
                defaultStyles={defaultStyles}
                contentContainerStyle={contentContainerStyle}
              />
            </Animated.View>
          </Animated.View>
        </ToastSwipeHandler>
      </Animated.View>
    );
  }
);

ToastComponent.displayName = 'Toast';

// Default shallow comparison — effective because ToasterUI hands out
// stable identities for orderedToastIds/callbacks/toast entries.
export const Toast = React.memo(ToastComponent);

const elevationStyle = {
  shadowOpacity: 0.0015 * 4 + 0.1,
  shadowRadius: 3 * 4,
  shadowOffset: {
    height: 4,
    width: 0,
  },
  elevation: 4,
};
