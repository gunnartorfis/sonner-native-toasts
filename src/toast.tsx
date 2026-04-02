import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type ViewProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useToastLayoutAnimations } from './animations';
import { toastDefaultValues } from './constants';
import { useToastContext } from './context';
import { ToastSwipeHandler } from './gestures';
import { CircleCheck, CircleX, Info, TriangleAlert, X } from './icons';
import { toastStore } from './toast-store';
import { isToastAction, type ToastProps, type ToastRef } from './types';
import { useAppStateListener } from './use-app-state';
import { useDefaultStyles, type DefaultStyles } from './use-default-styles';

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
    },
    ref
  ) => {
    const {
      duration: durationCtx,
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
      },
    } = useToastContext();
    const invert = invertProps ?? invertCtx;
    const richColors = richColorsProps ?? richColorsCtx;
    const unstyled = unstyledProps ?? unstyledCtx;
    const duration = durationProps ?? durationCtx;
    const closeButton = closeButtonProps ?? closeButtonCtx;

    const { entering, exiting } = useToastLayoutAnimations(position);

    const isDragging = React.useRef(false);

    const wiggleSharedValue = useSharedValue(1);

    const wiggleAnimationStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: wiggleSharedValue.value }],
      };
    }, [wiggleSharedValue]);

    const wiggle = () => {
      'worklet';

      // eslint-disable-next-line react-hooks/immutability
      wiggleSharedValue.value = withRepeat(
        withTiming(Math.min(wiggleSharedValue.value * 1.035, 1.035), {
          duration: 150,
        }),
        4,
        true
      );
    };

    const wiggleHandler = () => {
      // we can't send Infinity over to the native layer.
      if (duration === Infinity) {
        return;
      }

      if (wiggleSharedValue.value !== 1) {
        // we should animate back to 1 and then wiggle
        // eslint-disable-next-line react-hooks/immutability
        wiggleSharedValue.value = withTiming(1, { duration: 150 }, wiggle);
      } else {
        wiggle();
      }
    };

    React.useImperativeHandle(ref, () => ({
      wiggle: wiggleHandler,
    }));

    // Handle app state changes - pause/resume timers
    const onBackground = () => {
      if (!pauseWhenPageIsHidden) {
        return;
      }
      toastStore.pauseTimer(id);
    };

    const onForeground = () => {
      if (!pauseWhenPageIsHidden) {
        return;
      }
      toastStore.resumeTimer(id);
    };

    useAppStateListener({
      onBackground,
      onForeground,
    });

    // Note: Timer and promise handling is now managed by the store

    const defaultStyles = useDefaultStyles({
      invert,
      richColors,
      unstyled,
      description,
      variant,
    });

    const toastSwipeHandlerProps = {
      onRemove: () => {
        onDismiss?.(id);
      },
      onBegin: () => {
        isDragging.current = true;
        // Pause timer when dragging starts
        toastStore.pauseTimer(id);
      },
      onFinalize: () => {
        isDragging.current = false;
        // Resume timer when dragging ends
        toastStore.resumeTimer(id);
      },
      onPress: () => onPress?.(),
      enabled: !promiseOptions && dismissible,
      style: [toastContainerStyleCtx, styles?.toastContainer],
      unstyled: unstyled,
      important: important,
      position: position,
    };

    if (jsx) {
      return (
        <ToastSwipeHandler {...toastSwipeHandlerProps}>
          <Animated.View entering={entering} exiting={exiting}>
            {jsx}
          </Animated.View>
        </ToastSwipeHandler>
      );
    }

    return (
      <ToastSwipeHandler {...toastSwipeHandlerProps}>
        <Animated.View style={wiggleAnimationStyle}>
          <Animated.View
            style={[
              unstyled ? undefined : elevationStyle,
              defaultStyles.toast,
              toastStyleCtx,
              styles?.toast,
              style,
            ]}
            entering={entering}
            exiting={exiting}
          >
            <View
              style={[
                defaultStyles.toastContent,
                toastContentStyleCtx,
                styles?.toastContent,
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
              <CloseButton
                dismissible={dismissible}
                close={close}
                closeButton={closeButton}
                onDismiss={onDismiss}
                id={id}
                styles={styles}
                closeButtonStyle={[closeButtonStyleCtx, styles?.closeButton]}
                closeButtonIconStyle={[
                  closeButtonIconStyleCtx,
                  styles?.closeButtonIcon,
                ]}
                defaultStyles={defaultStyles}
              />
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

const CloseButton: React.FC<{
  dismissible: ToastProps['dismissible'];
  close: ToastProps['close'];
  closeButton: ToastProps['closeButton'];
  onDismiss: ToastProps['onDismiss'];
  id: ToastProps['id'];
  styles: ToastProps['styles'];
  closeButtonStyle?: ViewProps['style'];
  closeButtonIconStyle?: ViewProps['style'];
  defaultStyles: DefaultStyles;
}> = ({
  dismissible,
  close,
  closeButton,
  onDismiss,
  id,
  closeButtonStyle,
  defaultStyles,
  closeButtonIconStyle,
}) => {
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
        style={closeButtonStyle}
      >
        <X
          size={20}
          color={defaultStyles.closeButtonColor}
          style={closeButtonIconStyle}
        />
      </Pressable>
    );
  }
  return null;
};
