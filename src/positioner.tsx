import React from 'react';
import { View, type ViewStyle } from 'react-native';
import type { ToasterProps } from './types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastContext } from './context';

export const Positioner: React.FC<
  React.PropsWithChildren<Pick<ToasterProps, 'position' | 'style'>>
> = ({ children, position, style, ...props }) => {
  const { offset } = useToastContext();
  const { top, bottom } = useSafeAreaInsets();

  const getContainerStyle = (): ViewStyle => {
    if (position === 'center') {
      return {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
      };
    }

    return {
      position: 'absolute',
      width: '100%',
      alignItems: 'center',
    };
  };

  const getInsetValues = () => {
    if (position === 'bottom-center') {
      return { bottom: offset || bottom || 40 };
    }

    if (position === 'top-center') {
      return { top: offset || top || 40 };
    }

    return {};
  };

  return (
    <View
      style={[getContainerStyle(), getInsetValues(), style]}
      pointerEvents="box-none"
      {...props}
    >
      {children}
    </View>
  );
};
