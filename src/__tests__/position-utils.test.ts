import { getOrderedToastIds, calculateToastPosition } from '../position-utils';
import type { ToastProps, ToastPosition } from '../types';

describe('position-utils', () => {
  describe('getOrderedToastIds', () => {
    const mockToasts: ToastProps[] = [
      { id: 'toast-1', title: 'Toast 1', variant: 'info', index: 0, numberOfToasts: 3, orderedToastIds: ['toast-1', 'toast-2', 'toast-3'] },
      { id: 'toast-2', title: 'Toast 2', variant: 'info', index: 1, numberOfToasts: 3, orderedToastIds: ['toast-1', 'toast-2', 'toast-3'] },
      { id: 'toast-3', title: 'Toast 3', variant: 'info', index: 2, numberOfToasts: 3, orderedToastIds: ['toast-1', 'toast-2', 'toast-3'] },
    ];

    it('should return normal order for top-center with stacking', () => {
      // With stacking enabled, toasts are returned as-is (already in rendering order)
      const result = getOrderedToastIds(mockToasts, 'top-center', true);
      expect(result).toEqual(['toast-1', 'toast-2', 'toast-3']);
    });

    it('should return normal order for bottom-center with stacking', () => {
      const result = getOrderedToastIds(mockToasts, 'bottom-center', true);
      expect(result).toEqual(['toast-1', 'toast-2', 'toast-3']);
    });

    it('should return normal order for bottom-center without stacking', () => {
      const result = getOrderedToastIds(mockToasts, 'bottom-center', false);
      expect(result).toEqual(['toast-1', 'toast-2', 'toast-3']);
    });

    it('should return reversed order for top-center without stacking', () => {
      const result = getOrderedToastIds(mockToasts, 'top-center', false);
      expect(result).toEqual(['toast-3', 'toast-2', 'toast-1']);
    });

    it('should return reversed order for center without stacking', () => {
      const result = getOrderedToastIds(mockToasts, 'center', false);
      expect(result).toEqual(['toast-3', 'toast-2', 'toast-1']);
    });
  });

  describe('calculateToastPosition', () => {
    const baseParams = {
      numberOfToasts: 3,
      allToastHeights: {
        'toast-1': 60,
        'toast-2': 70,
        'toast-3': 80,
      },
      gap: 14,
      orderedToastIds: ['toast-1', 'toast-2', 'toast-3'],
      isExpanded: false,
      stackGap: 8,
    };

    describe('bottom-center position', () => {
      const position: ToastPosition = 'bottom-center';

      it('should calculate correct position for stacking mode - newest toast', () => {
        const result = calculateToastPosition({
          ...baseParams,
          index: 2,
          enableStacking: true,
          position,
        });

        // Bottom stacking for index 2 (front toast):
        // frontId = orderedToastIds[2] = 'toast-3', frontHeight = 80
        // distFromFront = 3-1-2 = 0
        // result = -(80 + 0*8 - 80) = 0
        expect(Math.abs(result)).toBe(0);
      });

      it('should calculate correct position for stacking mode - older toast', () => {
        const result = calculateToastPosition({
          ...baseParams,
          index: 0,
          enableStacking: true,
          position,
        });

        // Bottom stacking for index 0:
        // frontId = orderedToastIds[2] = 'toast-3', frontHeight = 80
        // currentId = 'toast-1', currentHeight = 60
        // distFromFront = 3-1-0 = 2
        // result = -(80 + 2*8 - 60) = -(80+16-60) = -36
        expect(result).toBe(-36);
      });

      it('should calculate correct position for non-stacking mode', () => {
        const result = calculateToastPosition({
          ...baseParams,
          index: 1,
          enableStacking: false,
          position,
        });

        // Bottom non-stacking: sum heights above index 1 (i.e. index 2)
        // Height of toast-3 = 80, gap = 14
        const expectedOffset = -(80 + 14);
        expect(result).toBe(expectedOffset);
      });

      it('should handle expanded state with stackGap spacing', () => {
        const result = calculateToastPosition({
          ...baseParams,
          index: 1,
          enableStacking: false,
          position,
          isExpanded: true,
          stackGap: 8,
        });

        // When expanded, effectiveEnableStacking = false, effectiveGap = stackGap = 8
        // Height of toast-3 = 80, stackGap = 8
        const expectedOffset = -(80 + 8);
        expect(result).toBe(expectedOffset);
      });
    });

    describe('top-center position', () => {
      const position: ToastPosition = 'top-center';

      it('should calculate correct position for stacking mode - newest toast', () => {
        const result = calculateToastPosition({
          ...baseParams,
          index: 0,
          enableStacking: true,
          position,
        });

        // Top stacking for index 0 (front toast):
        // frontId = orderedToastIds[0] = 'toast-1', frontHeight = 60
        // currentHeight = 60
        // result = 60 + 0*8 - 60 = 0
        expect(result).toBe(0);
      });

      it('should calculate correct position for stacking mode - older toast', () => {
        const result = calculateToastPosition({
          ...baseParams,
          index: 2,
          enableStacking: true,
          position,
        });

        // Top stacking for index 2:
        // frontId = orderedToastIds[0] = 'toast-1', frontHeight = 60
        // currentId = 'toast-3', currentHeight = 80
        // result = 60 + 2*8 - 80 = 60+16-80 = -4
        expect(result).toBe(-4);
      });

      it('should calculate correct position for non-stacking mode', () => {
        const result = calculateToastPosition({
          ...baseParams,
          index: 2,
          enableStacking: false,
          position,
        });

        // Top non-stacking: sum heights for toast-1 and toast-2
        // Heights: toast-1 (60) + gap (14) + toast-2 (70) + gap (14)
        const expectedOffset = 60 + 14 + 70 + 14;
        expect(result).toBe(expectedOffset);
      });
    });

    describe('center position', () => {
      const position: ToastPosition = 'center';

      it('should calculate correct position for stacking mode', () => {
        const result = calculateToastPosition({
          ...baseParams,
          index: 1,
          enableStacking: true,
          position,
        });

        // Center stacking: offset from center
        // offsetFromCenter = stackGap * (numberOfToasts - index - 1)
        // = 8 * (3 - 1 - 1) = 8 * 1 = 8
        expect(result).toBe(8);
      });

      it('should calculate correct position for non-stacking mode', () => {
        const result = calculateToastPosition({
          ...baseParams,
          index: 1,
          enableStacking: false,
          position,
        });

        // Center non-stacking: sum heights for previous toasts
        // Height of toast-1 = 60, gap = 14
        const expectedOffset = 60 + 14;
        expect(result).toBe(expectedOffset);
      });

      it('should use gap in center non-stacking mode even when expanded', () => {
        const result = calculateToastPosition({
          ...baseParams,
          index: 1,
          enableStacking: false,
          position,
          isExpanded: true,
          stackGap: 8,
        });

        // Center non-stacking always uses gap (not stackGap)
        // Height of toast-1 = 60, gap = 14
        const expectedOffset = 60 + 14;
        expect(result).toBe(expectedOffset);
      });
    });

    it('should use estimated height when actual height is not available', () => {
      const result = calculateToastPosition({
        ...baseParams,
        index: 1,
        enableStacking: false,
        position: 'top-center',
        allToastHeights: {},
        orderedToastIds: ['toast-1'],
      });

      // Should use ESTIMATED_TOAST_HEIGHT (70) from the implementation
      const expectedOffset = 70 + 14;
      expect(result).toBe(expectedOffset);
    });

    it('should disable stacking when expanded', () => {
      const stackingResult = calculateToastPosition({
        ...baseParams,
        index: 1,
        enableStacking: true,
        position: 'bottom-center',
        isExpanded: false,
        stackGap: 8,
      });

      const expandedResult = calculateToastPosition({
        ...baseParams,
        index: 1,
        enableStacking: true,
        position: 'bottom-center',
        isExpanded: true,
        stackGap: 8,
      });

      // Results should be different when expanded (stacking disabled)
      expect(stackingResult).not.toBe(expandedResult);
    });
  });
});
