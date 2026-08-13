import * as React from 'react';
import type { ToastProps, ToastStyles } from './types';

// Merges Toaster-level (parent) and toast-level style props with stable
// identities so downstream memo/dep comparisons hold.
export const useMergedStyles = ({
  style,
  styles,
  parentStyle,
  parentStyles,
}: {
  style?: ToastProps['style'];
  styles?: ToastStyles;
  parentStyle?: ToastProps['style'];
  parentStyles?: ToastStyles;
}) => {
  const mergedStyle = React.useMemo(
    () => (parentStyle || style ? { ...parentStyle, ...style } : undefined),
    [parentStyle, style]
  );
  const mergedStyles = React.useMemo(() => {
    if (!parentStyles && !styles) return undefined;
    return {
      toastContainer: {
        ...parentStyles?.toastContainer,
        ...styles?.toastContainer,
      },
      toast: { ...parentStyles?.toast, ...styles?.toast },
      toastContent: {
        ...parentStyles?.toastContent,
        ...styles?.toastContent,
      },
      textContainer: {
        ...parentStyles?.textContainer,
        ...styles?.textContainer,
      },
      title: { ...parentStyles?.title, ...styles?.title },
      description: { ...parentStyles?.description, ...styles?.description },
      buttons: { ...parentStyles?.buttons, ...styles?.buttons },
      closeButton: { ...parentStyles?.closeButton, ...styles?.closeButton },
      closeButtonIcon: {
        ...parentStyles?.closeButtonIcon,
        ...styles?.closeButtonIcon,
      },
    };
  }, [parentStyles, styles]);

  return { mergedStyle, mergedStyles };
};
