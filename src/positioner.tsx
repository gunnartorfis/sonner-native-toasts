import React, { useContext } from 'react';
import { Platform, Pressable, View } from 'react-native';
import {
  SafeAreaInsetsContext,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { useToastContext } from './context';
import {
  calculateOutsidePressableArea,
  getContainerStyle,
  getInsetValues,
} from './positioner-utils';
import type { ToasterProps } from './types';

const fallbackInsets = initialWindowMetrics?.insets ?? {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

const useInsets = () => {
  return useContext(SafeAreaInsetsContext) ?? fallbackInsets;
};

export const Positioner: React.FC<
  React.PropsWithChildren<Pick<ToasterProps, 'position' | 'style'>>
> = ({ children, position, style, ...props }) => {
  const { offset, isExpanded, collapse, toastHeights, gap, visibleToasts } =
    useToastContext();
  const { top, bottom } = useInsets();

  const resolvedPosition = position || 'bottom-center';
  const containerStyle = getContainerStyle(resolvedPosition);

  const insetValues = getInsetValues({
    position: resolvedPosition,
    offset,
    safeAreaInsets: { top, bottom },
  });

  const handleOutsidePress = () => {
    if (isExpanded) {
      collapse();
    }
  };

  const outsidePressableStyle = calculateOutsidePressableArea({
    position: resolvedPosition,
    toastHeights,
    gap,
    visibleToasts: visibleToasts || 3,
    insetValues,
  });

  // Don't show expand/collapse for center position
  const shouldAllowCollapse = resolvedPosition !== 'center' && isExpanded;

  const hasChildren = React.Children.count(children) > 0;

  return (
    <>
      {/* Outside pressable area - positioned outside the toast stack */}
      {shouldAllowCollapse && (
        <Pressable style={outsidePressableStyle} onPress={handleOutsidePress} />
      )}
      <View
        style={[containerStyle, insetValues, style]}
        pointerEvents={
          Platform.OS === 'android' && !hasChildren ? 'none' : 'box-none'
        }
        {...props}
      >
        {children}
      </View>
    </>
  );
};
