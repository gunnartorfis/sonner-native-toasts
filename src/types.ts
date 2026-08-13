import type React from 'react';
import type { TextStyle, ViewProps, ViewStyle } from 'react-native';
import type {
  BaseAnimationBuilder,
  EntryExitAnimationFunction,
  ReanimatedKeyframe as Keyframe,
} from 'react-native-reanimated';

export type ToastStyles = {
  toastContainer?: ViewStyle;
  toast?: ViewStyle;
  toastContent?: ViewStyle;
  textContainer?: ViewStyle;
  title?: TextStyle;
  description?: TextStyle;
  buttons?: ViewStyle;
  closeButton?: ViewStyle;
  closeButtonIcon?: ViewStyle;
};

type StyleProps = {
  unstyled?: boolean;
  style?: ViewStyle;
  styles?: ToastStyles;
  backgroundComponent?: React.ReactNode;
};

type PromiseOptions<T = unknown> = {
  promise: Promise<T>;
  success: (result: T) => string;
  error: ((error: unknown) => string) | string;
  loading: string;
  styles?: {
    loading?: ToastStyles;
    success?: ToastStyles;
    error?: ToastStyles;
  };
};

export type ToastPosition = 'top-center' | 'bottom-center' | 'center';

export type ToastTheme = 'light' | 'dark' | 'system';

export type ToastSwipeDirection = 'left' | 'up';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export type ToastEntryExitAnimation =
  | EntryExitAnimationFunction
  | BaseAnimationBuilder
  | typeof BaseAnimationBuilder
  | Keyframe
  | 'default';

export type ToastAnimation = {
  enter?: ToastEntryExitAnimation;
  exit?: ToastEntryExitAnimation;
};

export type AutoWiggle = 'never' | 'toast-change' | 'always';

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastProps = StyleProps & {
  id: string | number;
  /** Channel: which <Toaster id="..."> renders this toast. */
  toasterId?: string;
  index: number;
  title: string;
  variant: ToastVariant;
  numberOfToasts: number;
  orderedToastIds: Array<string | number>;
  jsx?: React.ReactNode;
  description?: string;
  invert?: boolean;
  important?: boolean;
  duration?: number;
  position?: ToastPosition;
  animation?: ToastAnimation;
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
  allowFontScaling?: boolean;
  maxFontSizeMultiplier?: number;
};

export type ToastRef = {
  wiggle: () => void;
};

export function isToastAction(
  action: ToastAction | React.ReactNode
): action is ToastAction {
  return (
    (action as ToastAction)?.onClick !== undefined &&
    (action as ToastAction)?.label !== undefined
  );
}

type ExternalToast = Omit<
  ToastProps,
  | 'id'
  | 'type'
  | 'title'
  | 'jsx'
  | 'promise'
  | 'variant'
  | 'index'
  | 'numberOfToasts'
  | 'orderedToastIds'
> & {
  id?: string | number;
};

export type ToasterProps = Omit<StyleProps, 'style'> & {
  /**
   * Channel name. A named Toaster renders only toasts sent to it via
   * `toast(…, { toasterId })`; an unnamed one renders only toasts with no
   * `toasterId`.
   */
  id?: string;
  /**
   * iOS only. When false, the Toaster is not wrapped in `FullWindowOverlay`.
   * Needed for a Toaster rendered inside a natively presented view (e.g. a
   * sheet), which is presented above the app window the overlay lives in.
   * @default true
   */
  fullWindowOverlay?: boolean;
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
  positionerStyle?: ViewStyle;
  // dir?: 'ltr' | 'rtl'; (ltr)
  // hotkey?: string; // hotkeys not supported on mobile
  invert?: boolean;
  allowFontScaling?: boolean;
  maxFontSizeMultiplier?: number;
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
    textContainerStyle?: ViewStyle;
    backgroundComponent?: React.ReactNode;
    success?: ViewStyle;
    error?: ViewStyle;
    warning?: ViewStyle;
    info?: ViewStyle;
    loading?: ViewStyle;
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
  enableStacking?: boolean;
  animation?: ToastAnimation;
  ToasterOverlayWrapper?: React.ComponentType<{ children: React.ReactNode }>;
  ToastWrapper?: React.ComponentType<
    ViewProps & {
      children: React.ReactNode;
      toastId: string | number;
    }
  >;
};

export type AddToastContextHandler = (
  data: Omit<ToastProps, 'id' | 'index' | 'numberOfToasts' | 'orderedToastIds'> & { id?: string | number }
) => string | number;

export type StableToastContextType = Required<
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
    | 'enableStacking'
    | 'visibleToasts'
    | 'allowFontScaling'
  >
> & {
  addToast: AddToastContextHandler;
  animation: ToastAnimation;
  maxFontSizeMultiplier?: number;
};

export type DynamicToastContextType = {
  toastHeights: Record<string | number, number>;
  toastHeightsVersion: number;
  isExpanded: boolean;
  expand: () => void;
  collapse: () => void;
  toggleExpand: () => void;
};

/** @deprecated Use StableToastContextType & DynamicToastContextType */
export type ToasterContextType = StableToastContextType &
  DynamicToastContextType;

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
