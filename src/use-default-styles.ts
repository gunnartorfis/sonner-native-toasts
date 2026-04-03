import type { TextStyle, ViewStyle } from 'react-native';
import { useColors } from './use-colors';
import type { ToastVariant } from './types';

export type DefaultStyles = {
  toast: ViewStyle;
  toastContent: ViewStyle;
  title: TextStyle;
  description: TextStyle;
  buttons: ViewStyle;
  actionButton: ViewStyle;
  actionButtonText: TextStyle;
  cancelButton: ViewStyle;
  cancelButtonText: TextStyle;
  closeButtonColor: string;
  iconColor: string;
};

export const useDefaultStyles = ({
  invert,
  richColors,
  unstyled,
  description,
  variant: variantProps,
}: {
  invert: boolean;
  richColors: boolean;
  unstyled: boolean | undefined;
  description: string | undefined;
  variant: ToastVariant;
}): DefaultStyles => {
  const colors = useColors(invert);
  const variant = variantProps === 'loading' ? 'info' : variantProps;

  if (unstyled) {
    return {
      toast: {},
      toastContent: {},
      title: {},
      description: {},
      buttons: {},
      actionButton: {},
      actionButtonText: {},
      cancelButton: {},
      cancelButtonText: {},
      closeButtonColor: colors['text-secondary'],
      iconColor: colors[variant],
    };
  }

  return {
    toast: {
      justifyContent: 'center',
      padding: 16,
      borderRadius: 16,
      marginHorizontal: 16,
      backgroundColor: richColors
        ? colors.rich[variant].background
        : colors['background-primary'],
      borderCurve: 'continuous',
      borderWidth: richColors ? 1 : undefined,
      borderColor: richColors ? colors.rich[variant].border : undefined,
    },
    toastContent: {
      flexDirection: 'row',
      gap: 16,
      alignItems: description?.length === 0 ? 'center' : undefined,
    },
    title: {
      fontWeight: '600',
      lineHeight: 20,
      color: richColors
        ? colors.rich[variant].foreground
        : colors['text-primary'],
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
      marginTop: 2,
      color: richColors
        ? colors.rich[variant].foreground
        : colors['text-tertiary'],
    },
    buttons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginTop: 16,
    },
    actionButton: {
      flexGrow: 0,
      alignSelf: 'flex-start',
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors['border-secondary'],
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderCurve: 'continuous',
      backgroundColor: colors['background-secondary'],
    },
    actionButtonText: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      alignSelf: 'flex-start',
      color: colors['text-primary'],
    },
    cancelButton: {
      flexGrow: 0,
    },
    cancelButtonText: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      alignSelf: 'flex-start',
      color: colors['text-secondary'],
    },
    iconColor: richColors ? colors.rich[variant].foreground : colors[variant],
    closeButtonColor: richColors
      ? colors.rich[variant].foreground
      : colors['text-secondary'],
  };
};
