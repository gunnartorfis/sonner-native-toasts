import {
  getContainerStyle,
  getInsetValues,
  calculateOutsidePressableArea,
} from '../positioner-utils';
import type { ToastPosition } from '../types';

describe('positioner-utils', () => {
  describe('getContainerStyle', () => {
    it('should return center container style for center position', () => {
      const result = getContainerStyle('center');

      expect(result).toEqual({
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        alignItems: 'center',
        overflow: 'visible',
      });
    });

    it('should return default container style for top-center position', () => {
      const result = getContainerStyle('top-center');

      expect(result).toEqual({
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
        overflow: 'visible',
      });
    });

    it('should return default container style for bottom-center position', () => {
      const result = getContainerStyle('bottom-center');

      expect(result).toEqual({
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
        overflow: 'visible',
      });
    });

    it('should return default container style for any other position', () => {
      const result = getContainerStyle('bottom-left' as ToastPosition);

      expect(result).toEqual({
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
        overflow: 'visible',
      });
    });
  });

  describe('getInsetValues', () => {
    const mockSafeAreaInsets = { top: 44, bottom: 34 };

    it('should return bottom inset for bottom-center position with safe area', () => {
      const result = getInsetValues({
        position: 'bottom-center',
        safeAreaInsets: mockSafeAreaInsets,
      });

      // bottom (34) + 8 = 42
      expect(result).toEqual({ bottom: 42 });
    });

    it('should return bottom inset for bottom-center position without safe area', () => {
      const result = getInsetValues({
        position: 'bottom-center',
        safeAreaInsets: { top: 0, bottom: 0 },
      });

      // Default to 16 when no safe area
      expect(result).toEqual({ bottom: 16 });
    });

    it('should use offset directly when provided', () => {
      const result = getInsetValues({
        position: 'bottom-center',
        offset: 20,
        safeAreaInsets: mockSafeAreaInsets,
      });

      // offset is used directly
      expect(result).toEqual({ bottom: 20 });
    });

    it('should return top inset for top-center position with safe area', () => {
      const result = getInsetValues({
        position: 'top-center',
        safeAreaInsets: mockSafeAreaInsets,
      });

      // top (44) + 8 = 52
      expect(result).toEqual({ top: 52 });
    });

    it('should return top inset for top-center position without safe area', () => {
      const result = getInsetValues({
        position: 'top-center',
        safeAreaInsets: { top: 0, bottom: 0 },
      });

      // Default to 16 when no safe area
      expect(result).toEqual({ top: 16 });
    });

    it('should use offset directly for top-center when provided', () => {
      const result = getInsetValues({
        position: 'top-center',
        offset: 30,
        safeAreaInsets: mockSafeAreaInsets,
      });

      // offset is used directly
      expect(result).toEqual({ top: 30 });
    });

    it('should return empty object for center position', () => {
      const result = getInsetValues({
        position: 'center',
        safeAreaInsets: mockSafeAreaInsets,
      });

      expect(result).toEqual({});
    });

    it('should return empty object for any other position', () => {
      const result = getInsetValues({
        position: 'bottom-left' as ToastPosition,
        safeAreaInsets: mockSafeAreaInsets,
      });

      expect(result).toEqual({});
    });

    it('should handle missing safe area insets gracefully', () => {
      const result = getInsetValues({
        position: 'bottom-center',
      });

      // Defaults to 16 when no safe area insets
      expect(result).toEqual({ bottom: 16 });
    });
  });

  describe('calculateOutsidePressableArea', () => {
    const baseParams = {
      toastHeights: { 'toast-1': 60, 'toast-2': 70, 'toast-3': 80 },
      gap: 14,
      visibleToasts: 3,
      insetValues: { top: 52, bottom: 42 },
    };

    it('should calculate correct pressable area for top-center position', () => {
      const result = calculateOutsidePressableArea({
        ...baseParams,
        position: 'top-center',
      });

      // totalToastHeight = 60 + 70 + 80 = 210
      // gapHeight = 14 * (3 - 1) = 28
      // stackHeight = 210 + 28 + 20 = 258
      // topOffset = 52 + 258 = 310
      expect(result).toEqual({
        position: 'absolute',
        top: 310,
        bottom: 0,
        left: 0,
        right: 0,
      });
    });

    it('should calculate correct pressable area for bottom-center position', () => {
      const result = calculateOutsidePressableArea({
        ...baseParams,
        position: 'bottom-center',
      });

      // totalToastHeight = 60 + 70 + 80 = 210
      // gapHeight = 14 * (3 - 1) = 28
      // stackHeight = 210 + 28 + 20 = 258
      // bottomOffset = 42 + 258 = 300
      expect(result).toEqual({
        position: 'absolute',
        top: 0,
        bottom: 300,
        left: 0,
        right: 0,
      });
    });

    it('should return hidden style for center position', () => {
      const result = calculateOutsidePressableArea({
        ...baseParams,
        position: 'center',
      });

      expect(result).toEqual({ display: 'none' });
    });

    it('should use estimated height when no actual heights available', () => {
      const result = calculateOutsidePressableArea({
        ...baseParams,
        position: 'top-center',
        toastHeights: {},
      });

      // With empty heights, numberOfToastsToCalculate = min(0, 3) = 0
      // totalToastHeight = 70 * 0 = 0, gapHeight = 14 * max(0, -1) = 0
      // stackHeight = 0 + 0 + 20 = 20, topOffset = 52 + 20 = 72
      expect(result).toEqual({
        position: 'absolute',
        top: 72,
        bottom: 0,
        left: 0,
        right: 0,
      });
    });

    it('should limit calculation to visible toasts count', () => {
      const result = calculateOutsidePressableArea({
        ...baseParams,
        position: 'top-center',
        visibleToasts: 2,
      });

      // totalToastHeight = 60 + 70 = 130 (only first 2 toasts)
      // gapHeight = 14 * (2 - 1) = 14
      // stackHeight = 130 + 14 + 20 = 164
      // topOffset = 52 + 164 = 216
      expect(result).toEqual({
        position: 'absolute',
        top: 216,
        bottom: 0,
        left: 0,
        right: 0,
      });
    });

    it('should handle empty toast heights array', () => {
      const result = calculateOutsidePressableArea({
        ...baseParams,
        position: 'bottom-center',
        toastHeights: {},
        visibleToasts: 2,
      });

      // With empty heights, numberOfToastsToCalculate = min(0, 2) = 0
      // totalToastHeight = 70 * 0 = 0, gapHeight = 0
      // stackHeight = 0 + 0 + 20 = 20, bottomOffset = 42 + 20 = 62
      expect(result).toEqual({
        position: 'absolute',
        top: 0,
        bottom: 62,
        left: 0,
        right: 0,
      });
    });

    it('should handle zero gap', () => {
      const result = calculateOutsidePressableArea({
        ...baseParams,
        position: 'top-center',
        gap: 0,
      });

      // totalToastHeight = 60 + 70 + 80 = 210
      // gapHeight = 0 * (3 - 1) = 0
      // stackHeight = 210 + 0 + 20 = 230
      // topOffset = 52 + 230 = 282
      expect(result).toEqual({
        position: 'absolute',
        top: 282,
        bottom: 0,
        left: 0,
        right: 0,
      });
    });

    it('should handle single visible toast', () => {
      const result = calculateOutsidePressableArea({
        ...baseParams,
        position: 'bottom-center',
        visibleToasts: 1,
      });

      // totalToastHeight = 60 (only first toast)
      // gapHeight = 14 * Math.max(0, 1 - 1) = 0
      // stackHeight = 60 + 0 + 20 = 80
      // bottomOffset = 42 + 80 = 122
      expect(result).toEqual({
        position: 'absolute',
        top: 0,
        bottom: 122,
        left: 0,
        right: 0,
      });
    });

    it('should use fallback inset values when not provided', () => {
      const result = calculateOutsidePressableArea({
        ...baseParams,
        position: 'top-center',
        insetValues: {},
      });

      // totalToastHeight = 60 + 70 + 80 = 210
      // gapHeight = 14 * (3 - 1) = 28
      // stackHeight = 210 + 28 + 20 = 258
      // topOffset = 40 + 258 = 298 (fallback to 40)
      expect(result).toEqual({
        position: 'absolute',
        top: 298,
        bottom: 0,
        left: 0,
        right: 0,
      });
    });
  });
});
