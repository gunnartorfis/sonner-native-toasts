import * as React from 'react';
import { Pressable, Text } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ToastAction } from './types';

// A labeled action/cancel button rendered from a ToastAction.
export const ToastButton: React.FC<{
  action: ToastAction;
  onPress: () => void;
  allowFontScaling?: boolean;
  maxFontSizeMultiplier?: number;
  style: StyleProp<ViewStyle>;
  textStyle: StyleProp<TextStyle>;
}> = ({
  action,
  onPress,
  allowFontScaling,
  maxFontSizeMultiplier,
  style,
  textStyle,
}) => {
  return (
    <Pressable onPress={onPress} style={style}>
      <Text
        numberOfLines={1}
        allowFontScaling={allowFontScaling}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={textStyle}
      >
        {action.label}
      </Text>
    </Pressable>
  );
};
