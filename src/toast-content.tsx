import * as React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { CloseButton } from './close-button';
import { useToastContext } from './context';
import { ToastButton } from './toast-button';
import { ToastIcon } from './toast-icon';
import { isToastAction, type ToastProps, type ToastStyles } from './types';
import type { DefaultStyles } from './use-default-styles';

// The visual innards of a standard (non-jsx) toast: icon, title/description,
// action/cancel buttons, and close button. All `props ?? context` resolution
// happens in the parent; this component only reads context for Toaster-level
// toastOptions styles and icon overrides.
export const ToastContent: React.FC<{
  id: ToastProps['id'];
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant: ToastProps['variant'];
  action?: ToastProps['action'];
  cancel?: ToastProps['cancel'];
  close?: ToastProps['close'];
  closeButton?: boolean;
  dismissible: boolean;
  onDismiss?: ToastProps['onDismiss'];
  promiseOptions?: ToastProps['promiseOptions'];
  actionButtonStyle?: ToastProps['actionButtonStyle'];
  actionButtonTextStyle?: ToastProps['actionButtonTextStyle'];
  cancelButtonStyle?: ToastProps['cancelButtonStyle'];
  cancelButtonTextStyle?: ToastProps['cancelButtonTextStyle'];
  invert: boolean;
  richColors: boolean;
  unstyled?: boolean;
  allowFontScaling?: boolean;
  maxFontSizeMultiplier?: number;
  mergedStyles?: ToastStyles;
  defaultStyles: DefaultStyles;
  contentContainerStyle?: ViewStyle;
}> = ({
  id,
  title,
  description,
  icon,
  variant,
  action,
  cancel,
  close,
  closeButton,
  dismissible,
  onDismiss,
  promiseOptions,
  actionButtonStyle,
  actionButtonTextStyle,
  cancelButtonStyle,
  cancelButtonTextStyle,
  invert,
  richColors,
  unstyled,
  allowFontScaling,
  maxFontSizeMultiplier,
  mergedStyles,
  defaultStyles,
  contentContainerStyle,
}) => {
  const {
    icons,
    toastOptions: {
      actionButtonStyle: actionButtonStyleCtx,
      actionButtonTextStyle: actionButtonTextStyleCtx,
      cancelButtonStyle: cancelButtonStyleCtx,
      cancelButtonTextStyle: cancelButtonTextStyleCtx,
      toastContentStyle: toastContentStyleCtx,
      textContainerStyle: textContainerStyleCtx,
      titleStyle: titleStyleCtx,
      descriptionStyle: descriptionStyleCtx,
      buttonsStyle: buttonsStyleCtx,
      closeButtonStyle: closeButtonStyleCtx,
      closeButtonIconStyle: closeButtonIconStyleCtx,
    },
  } = useToastContext();

  const onCancelPress = React.useCallback(() => {
    if (isToastAction(cancel)) {
      cancel.onClick();
    }
    onDismiss?.(id);
  }, [cancel, onDismiss, id]);

  return (
    <View
      style={[
        defaultStyles.toastContent,
        toastContentStyleCtx,
        mergedStyles?.toastContent,
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
        <ToastIcon variant={variant} invert={invert} richColors={richColors} />
      )}
      <View
        style={[
          { flex: 1 },
          textContainerStyleCtx,
          mergedStyles?.textContainer,
        ]}
      >
        <Text
          allowFontScaling={allowFontScaling}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[defaultStyles.title, titleStyleCtx, mergedStyles?.title]}
        >
          {title}
        </Text>
        {description ? (
          <Text
            allowFontScaling={allowFontScaling}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[
              defaultStyles.description,
              descriptionStyleCtx,
              mergedStyles?.description,
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
            mergedStyles?.buttons,
          ]}
        >
          {isToastAction(action) ? (
            <ToastButton
              action={action}
              onPress={action.onClick}
              allowFontScaling={allowFontScaling}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                defaultStyles.actionButton,
                actionButtonStyleCtx,
                actionButtonStyle,
              ]}
              textStyle={[
                defaultStyles.actionButtonText,
                actionButtonTextStyleCtx,
                actionButtonTextStyle,
              ]}
            />
          ) : (
            action || undefined
          )}
          {isToastAction(cancel) ? (
            <ToastButton
              action={cancel}
              onPress={onCancelPress}
              allowFontScaling={allowFontScaling}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                defaultStyles.cancelButton,
                cancelButtonStyleCtx,
                cancelButtonStyle,
              ]}
              textStyle={[
                defaultStyles.cancelButtonText,
                cancelButtonTextStyleCtx,
                cancelButtonTextStyle,
              ]}
            />
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
        closeButtonStyle={[closeButtonStyleCtx, mergedStyles?.closeButton]}
        closeButtonIconStyle={[
          closeButtonIconStyleCtx,
          mergedStyles?.closeButtonIcon,
        ]}
        defaultStyles={defaultStyles}
      />
    </View>
  );
};
