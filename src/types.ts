import type React from 'react';
import type { TextStyle, ViewProps, ViewStyle } from 'react-native';

type StyleProps = {
  unstyled?: boolean;
  style?: ViewStyle;
  styles?: {
    toastContainer?: ViewStyle;
    toast?: ViewStyle;
    toastContent?: ViewStyle;
    title?: TextStyle;
    description?: TextStyle;
    buttons?: ViewStyle;
    closeButton?: ViewStyle;
    closeButtonIcon?: ViewStyle;
  };
};

type PromiseOptions<T = unknown> = {
  promise: Promise<T>;
  success: (result: T) => string;
  error: ((error: unknown) => string) | string;
  loading: string;
};

export type ToastPosition = 'top-center' | 'bottom-center' | 'center';

export type ToastTheme = 'light' | 'dark' | 'system';

export type ToastSwipeDirection = 'left' | 'up';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export type AutoWiggle = 'never' | 'toast-change' | 'always';

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastProps = StyleProps & {
  id: string | number;
  title: string;
  variant: ToastVariant;
  jsx?: React.ReactNode;
  description?: string;
  invert?: boolean;
  important?: boolean;
  duration?: number;
  position?: ToastPosition;
  dismissible?: boolean;
  icon?: React.ReactNode;
  action?: ToastAction | React.ReactNode;
  cancel?: ToastAction | React.ReactNode;
  close?: React.ReactNode;
  closeButton?: boolean;
  richColors?: boolean;
  onDismiss?: (id: string | number) => void;
  onAutoClose?: (id: string | number) => void;
  promiseOptions?: PromiseOptions<unknown>;
  actionButtonStyle?: ViewStyle;
  actionButtonTextStyle?: TextStyle;
  cancelButtonStyle?: ViewStyle;
  cancelButtonTextStyle?: TextStyle;
  onPress?: () => void;
};

export type ToastRef = {
  wiggle: () => void;
};

export function isToastAction(
  action: ToastAction | React.ReactNode
): action is ToastAction {
  return (action as ToastAction)?.onClick !== undefined;
}

type ExternalToast = Omit<
  ToastProps,
  'id' | 'type' | 'title' | 'jsx' | 'promise' | 'variant'
> & {
  id?: string | number;
};

export type ToasterProps = Omit<StyleProps, 'style'> & {
  duration?: number;
  theme?: ToastTheme;
  // richColors?: boolean; (false)
  // expand?: boolean; // hover not supported on mobile
  visibleToasts?: number;
  position?: ToastPosition;
  closeButton?: boolean;
  offset?: number;
  autoWiggleOnUpdate?: AutoWiggle;
  style?: ViewStyle;
  // dir?: 'ltr' | 'rtl'; (ltr)
  // hotkey?: string; // hotkeys not supported on mobile
  invert?: boolean;
  toastOptions?: {
    actionButtonStyle?: ViewStyle;
    actionButtonTextStyle?: TextStyle;
    cancelButtonStyle?: ViewStyle;
    cancelButtonTextStyle?: TextStyle;
    titleStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    style?: ViewStyle;
    unstyled?: boolean;
    toastContainerStyle?: ViewStyle;
    toastContentStyle?: ViewStyle;
    buttonsStyle?: ViewStyle;
    closeButtonStyle?: ViewStyle;
    closeButtonIconStyle?: ViewStyle;
  };
  gap?: number;
  loadingIcon?: React.ReactNode;
  richColors?: boolean;
  // pauseWhenPageIsHidden?: boolean; (false)
  icons?: {
    success?: React.ReactNode;
    error?: React.ReactNode;
    warning?: React.ReactNode;
    info?: React.ReactNode;
    loading?: React.ReactNode;
  };
  swipeToDismissDirection?: ToastSwipeDirection;
  pauseWhenPageIsHidden?: boolean;
  ToasterOverlayWrapper?: React.ComponentType<{ children: React.ReactNode }>;
  ToastWrapper?: React.ComponentType<
    ViewProps & {
      children: React.ReactNode;
      toastId: string | number;
    }
  >;
};

export type AddToastContextHandler = (
  data: Omit<ToastProps, 'id'> & { id?: string | number }
) => string | number;

export type ToasterContextType = Required<
  Pick<
    ToasterProps,
    | 'duration'
    | 'swipeToDismissDirection'
    | 'closeButton'
    | 'position'
    | 'invert'
    | 'icons'
    | 'offset'
    | 'pauseWhenPageIsHidden'
    | 'gap'
    | 'theme'
    | 'toastOptions'
    | 'autoWiggleOnUpdate'
    | 'richColors'
    | 'unstyled'
  >
> & {
  addToast: AddToastContextHandler;
};

export declare const toast: ((
  message: string,
  data?: ExternalToast
) => string | number) & {
  success: (message: string, data?: ExternalToast) => string | number;
  info: (message: string, data?: ExternalToast) => string | number;
  error: (message: string, data?: ExternalToast) => string | number;
  warning: (message: string, data?: ExternalToast) => string | number;
  custom: (jsx: React.ReactElement, data?: ExternalToast) => string | number;
  promise: <T>(
    promise: Promise<T>,
    options: Omit<PromiseOptions<T>, 'promise'> & ExternalToast
  ) => string | number;
  loading: (message: string, data?: ExternalToast) => string | number;
  dismiss: (id?: string | number) => string | number | undefined;
  wiggle: (id: string | number) => void;
};
