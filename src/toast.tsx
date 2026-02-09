import * as React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ANIMATION_DURATION, useToastLayoutAnimations } from './animations';
import { toastDefaultValues } from './constants';
import { useToastContext } from './context';
import { ToastSwipeHandler } from './gestures';
import { CircleCheck, CircleX, Info, TriangleAlert, X } from './icons';
import { isToastAction, type ToastProps, type ToastRef } from './types';
import { useAppStateListener } from './use-app-state';
import { useDefaultStyles } from './use-default-styles';

export const Toast = React.forwardRef<ToastRef, ToastProps>(
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
      onAutoClose,
      dismissible = toastDefaultValues.dismissible,
      closeButton: closeButtonProps,
      actionButtonStyle,
      actionButtonTextStyle,
      cancelButtonStyle,
      cancelButtonTextStyle,
      style,
      styles,
      promiseOptions,
      position,
      unstyled: unstyledProps,
      important,
      invert: invertProps,
      richColors: richColorsProps,
      onPress,
      backgroundComponent: backgroundComponentProps,
    },
    ref
  ) => {
    const {
      duration: durationCtx,
      addToast,
      closeButton: closeButtonCtx,
      icons,
      pauseWhenPageIsHidden,
      invert: invertCtx,
      richColors: richColorsCtx,
      toastOptions: {
        unstyled: unstyledCtx,
        toastContainerStyle: toastContainerStyleCtx,
        actionButtonStyle: actionButtonStyleCtx,
        actionButtonTextStyle: actionButtonTextStyleCtx,
        cancelButtonStyle: cancelButtonStyleCtx,
        cancelButtonTextStyle: cancelButtonTextStyleCtx,
        style: toastStyleCtx,
        toastContentStyle: toastContentStyleCtx,
        titleStyle: titleStyleCtx,
        descriptionStyle: descriptionStyleCtx,
        buttonsStyle: buttonsStyleCtx,
        closeButtonStyle: closeButtonStyleCtx,
        closeButtonIconStyle: closeButtonIconStyleCtx,
        backgroundComponent: backgroundComponentCtx,
        success: successStyleCtx,
        error: errorStyleCtx,
        warning: warningStyleCtx,
        info: infoStyleCtx,
        loading: loadingStyleCtx,
      },
    } = useToastContext();
    const invert = invertProps ?? invertCtx;
    const richColors = richColorsProps ?? richColorsCtx;
    const unstyled = unstyledProps ?? unstyledCtx;
    const duration = durationProps ?? durationCtx;
    const closeButton = closeButtonProps ?? closeButtonCtx;
    const backgroundComponent =
      backgroundComponentProps ?? backgroundComponentCtx;

    const { entering, exiting } = useToastLayoutAnimations(position);

    const isDragging = React.useRef(false);
    const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
    const timerStart = React.useRef<number | undefined>(undefined);
    const timeLeftOnceBackgrounded = React.useRef<number | undefined>(
      undefined
    );
    const isResolvingPromise = React.useRef(false);

    const wiggleSharedValue = useSharedValue(1);

    const wiggleAnimationStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: wiggleSharedValue.value }],
      };
    }, [wiggleSharedValue]);

    const startTimer = React.useCallback(() => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (!isDragging.current) {
          onAutoClose?.(id);
        }
      }, ANIMATION_DURATION + duration);
    }, [duration, id, onAutoClose]);

    const wiggle = React.useCallback(() => {
      'worklet';

      wiggleSharedValue.value = withRepeat(
        withTiming(Math.min(wiggleSharedValue.value * 1.035, 1.035), {
          duration: 150,
        }),
        4,
        true
      );
    }, [wiggleSharedValue]);

    const wiggleHandler = React.useCallback(() => {
      // we can't send Infinity over to the native layer.
      if (duration === Infinity) {
        return;
      }

      // reset the duration
      timerStart.current = Date.now();
      startTimer();

      if (wiggleSharedValue.value !== 1) {
        // we should animate back to 1 and then wiggle
        wiggleSharedValue.value = withTiming(1, { duration: 150 }, wiggle);
      } else {
        wiggle();
      }
    }, [wiggle, wiggleSharedValue, startTimer, duration]);

    React.useImperativeHandle(ref, () => ({
      wiggle: wiggleHandler,
    }));

    const onBackground = React.useCallback(() => {
      if (!pauseWhenPageIsHidden) {
        return;
      }

      if (timer.current) {
        timeLeftOnceBackgrounded.current =
          duration - (Date.now() - timerStart.current!);
        clearTimeout(timer.current);
        timer.current = undefined;
        timerStart.current = undefined;
      }
    }, [duration, pauseWhenPageIsHidden]);

    const onForeground = React.useCallback(() => {
      if (!pauseWhenPageIsHidden) {
        return;
      }

      if (
        timeLeftOnceBackgrounded.current &&
        timeLeftOnceBackgrounded.current > 0
      ) {
        timer.current = setTimeout(
          () => {
            if (!isDragging.current) {
              onAutoClose?.(id);
            }
          },
          Math.max(timeLeftOnceBackgrounded.current, 1000) // minimum 1 second to avoid weird behavior
        );
      } else {
        onAutoClose?.(id);
      }
    }, [id, onAutoClose, pauseWhenPageIsHidden]);

    useAppStateListener(
      React.useMemo(
        () => ({
          onBackground,
          onForeground,
        }),
        [onBackground, onForeground]
      )
    );

    React.useEffect(() => {
      const handlePromise = async () => {
        if (isResolvingPromise.current) {
          return;
        }

        if (promiseOptions?.promise) {
          isResolvingPromise.current = true;

          try {
            const data = await promiseOptions.promise;
            addToast({
              title: promiseOptions.success(data) ?? 'Success',
              id,
              variant: 'success',
              promiseOptions: undefined,
              styles: promiseOptions.styles?.success,
            });
          } catch (error) {
            addToast({
              title:
                typeof promiseOptions.error === 'function'
                  ? promiseOptions.error(error)
                  : (promiseOptions.error ?? 'Error'),
              id,
              variant: 'error',
              promiseOptions: undefined,
              styles: promiseOptions.styles?.error,
            });
          } finally {
            isResolvingPromise.current = false;
          }

          return;
        }

        if (duration === Infinity) {
          return;
        }

        // Start the timer only if it hasn't been started yet
        if (!timerStart.current) {
          timerStart.current = Date.now();
          startTimer();
        }
      };

      handlePromise();
    }, [
      duration,
      id,
      onDismiss,
      promiseOptions,
      addToast,
      onAutoClose,
      startTimer,
    ]);

    React.useEffect(() => {
      // Cleanup function to clear the timer if it's still the same timer
      return () => {
        clearTimeout(timer.current);
        timer.current = undefined;
        timerStart.current = undefined;
      };
    }, [id]);

    const defaultStyles = useDefaultStyles({
      invert,
      richColors,
      unstyled,
      description,
      variant,
    });

    const variantStyles = {
      success: successStyleCtx,
      error: errorStyleCtx,
      warning: warningStyleCtx,
      info: infoStyleCtx,
      loading: loadingStyleCtx,
    };

    const variantStyle = variantStyles[variant];

    const renderCloseButton = React.useMemo(() => {
      if (!dismissible) {
        return null;
      }
      if (close) {
        return close;
      }
      if (closeButton) {
        return (
          <Pressable
            onPress={() => onDismiss?.(id)}
            hitSlop={10}
            style={[closeButtonStyleCtx, styles?.closeButton]}
          >
            <X
              size={20}
              color={defaultStyles.closeButtonColor}
              style={[closeButtonIconStyleCtx, styles?.closeButtonIcon]}
            />
          </Pressable>
        );
      }
      return null;
    }, [
      close,
      closeButton,
      closeButtonIconStyleCtx,
      closeButtonStyleCtx,
      defaultStyles.closeButtonColor,
      dismissible,
      id,
      onDismiss,
      styles?.closeButton,
      styles?.closeButtonIcon,
    ]);

    const toastSwipeHandlerProps = React.useMemo(
      () => ({
        onRemove: () => {
          onDismiss?.(id);
        },
        onBegin: () => {
          isDragging.current = true;
        },
        onEnd: () => {
          isDragging.current = false;
        },
        onFinalize: () => {
          isDragging.current = false;
          if (!timer.current) {
            return;
          }
          const timeElapsed = Date.now() - timerStart.current!;

          if (timeElapsed < duration) {
            timer.current = setTimeout(() => {
              onDismiss?.(id);
            }, duration - timeElapsed);
          } else {
            onDismiss?.(id);
          }
        },
        onPress: () => onPress?.(),
        enabled: !promiseOptions && dismissible,
        style: [toastContainerStyleCtx, styles?.toastContainer],
        unstyled: unstyled,
        important: important,
        position: position,
      }),
      [
        onDismiss,
        id,
        duration,
        dismissible,
        promiseOptions,
        onPress,
        toastContainerStyleCtx,
        styles?.toastContainer,
        unstyled,
        important,
        position,
      ]
    );

    if (jsx) {
      return (
        <ToastSwipeHandler {...toastSwipeHandlerProps}>
          <Animated.View entering={entering} exiting={exiting}>
            {jsx}
          </Animated.View>
        </ToastSwipeHandler>
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
      <ToastSwipeHandler {...toastSwipeHandlerProps}>
        <Animated.View style={wiggleAnimationStyle}>
          <Animated.View
            style={[
              unstyled ? undefined : elevationStyle,
              defaultStyles.toast,
              toastStyleCtx,
              variantStyle,
              styles?.toast,
              style,
              backgroundComponentStyle,
            ]}
            entering={entering}
            exiting={exiting}
          >
            {backgroundComponent}
            <View
              style={[
                defaultStyles.toastContent,
                toastContentStyleCtx,
                styles?.toastContent,
                contentContainerStyle,
              ]}
            >
              {promiseOptions || variant === 'loading' ? (
                'loading' in icons ? (
                  icons.loading
                ) : (
                  <ActivityIndicator />
                )
              ) : icon ? (
                <View>{icon}</View>
              ) : variant in icons ? (
                icons[variant]
              ) : (
                <ToastIcon
                  variant={variant}
                  invert={invert}
                  richColors={richColors}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={[defaultStyles.title, titleStyleCtx, styles?.title]}
                >
                  {title}
                </Text>
                {description ? (
                  <Text
                    style={[
                      defaultStyles.description,
                      descriptionStyleCtx,
                      styles?.description,
                    ]}
                  >
                    {description}
                  </Text>
                ) : null}
                <View
                  style={[
                    unstyled || (!action && !cancel)
                      ? undefined
                      : defaultStyles.buttons,
                    buttonsStyleCtx,
                    styles?.buttons,
                  ]}
                >
                  {isToastAction(action) ? (
                    <Pressable
                      onPress={action.onClick}
                      style={[
                        defaultStyles.actionButton,
                        actionButtonStyleCtx,
                        actionButtonStyle,
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          defaultStyles.actionButtonText,
                          actionButtonTextStyleCtx,
                          actionButtonTextStyle,
                        ]}
                      >
                        {action.label}
                      </Text>
                    </Pressable>
                  ) : (
                    action || undefined
                  )}
                  {isToastAction(cancel) ? (
                    <Pressable
                      onPress={() => {
                        cancel.onClick();
                        onDismiss?.(id);
                      }}
                      style={[
                        defaultStyles.cancelButton,
                        cancelButtonStyleCtx,
                        cancelButtonStyle,
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          defaultStyles.cancelButtonText,
                          cancelButtonTextStyleCtx,
                          cancelButtonTextStyle,
                        ]}
                      >
                        {cancel.label}
                      </Text>
                    </Pressable>
                  ) : (
                    cancel || undefined
                  )}
                </View>
              </View>
              {renderCloseButton}
            </View>
          </Animated.View>
        </Animated.View>
      </ToastSwipeHandler>
    );
  }
);

Toast.displayName = 'Toast';

export const ToastIcon: React.FC<
  Pick<ToastProps, 'variant'> & {
    invert: boolean;
    richColors: boolean;
  }
> = ({ variant, invert, richColors }) => {
  const color = useDefaultStyles({
    variant,
    invert,
    richColors,
    unstyled: false,
    description: undefined,
  }).iconColor;

  switch (variant) {
    case 'success':
      return <CircleCheck size={20} color={color} />;
    case 'error':
      return <CircleX size={20} color={color} />;
    case 'warning':
      return <TriangleAlert size={20} color={color} />;
    default:
    case 'info':
      return <Info size={20} color={color} />;
  }
};

const elevationStyle = {
  shadowOpacity: 0.0015 * 4 + 0.1,
  shadowRadius: 3 * 4,
  shadowOffset: {
    height: 4,
    width: 0,
  },
  elevation: 4,
};
