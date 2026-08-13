import * as React from 'react';
import { Pressable, Text, type ViewProps } from 'react-native';
import { X } from './icons';
import type { ToastProps } from './types';
import type { DefaultStyles } from './use-default-styles';

export const CloseButton: React.FC<{
  dismissible: ToastProps['dismissible'];
  close: ToastProps['close'];
  closeButton: ToastProps['closeButton'];
  onDismiss: ToastProps['onDismiss'];
  id: ToastProps['id'];
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
    // `close` typechecks as a bare string/number, which crashes React Native
    // when rendered directly inside a View.
    return typeof close === 'string' || typeof close === 'number' ? (
      <Text>{close}</Text>
    ) : (
      close
    );
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
