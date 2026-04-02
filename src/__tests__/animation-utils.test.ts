import {
  getEnteringTranslateY,
  getExitingTranslateY,
} from '../animation-utils';
import type { ToastPosition } from '../types';

describe('animation-utils', () => {
  describe('getEnteringTranslateY', () => {
    it('should return -20 for top-center position', () => {
      const result = getEnteringTranslateY('top-center');
      expect(result).toBe(-20);
    });

    it('should return 50 for bottom-center position', () => {
      const result = getEnteringTranslateY('bottom-center');
      expect(result).toBe(50);
    });

    it('should return 0 for center position', () => {
      const result = getEnteringTranslateY('center');
      expect(result).toBe(0);
    });

    it('should return 0 for any other position', () => {
      // Test with an arbitrary position that should default to 0
      const result = getEnteringTranslateY('bottom-left' as ToastPosition);
      expect(result).toBe(0);
    });
  });

  describe('getExitingTranslateY', () => {
    it('should return 0 when toast is hidden by limit', () => {
      const result = getExitingTranslateY({
        position: 'top-center',
        isHiddenByLimit: true,
        numberOfToasts: 3,
        stackGap: 8,
      });

      expect(result).toBe(0);
    });

    describe('with single toast', () => {
      it('should return -150 for top-center with single toast', () => {
        const result = getExitingTranslateY({
          position: 'top-center',
          isHiddenByLimit: false,
          numberOfToasts: 1,
          stackGap: 8,
        });

        expect(result).toBe(-150);
      });

      it('should return 150 for bottom-center with single toast', () => {
        const result = getExitingTranslateY({
          position: 'bottom-center',
          isHiddenByLimit: false,
          numberOfToasts: 1,
        stackGap: 8,
        });

        expect(result).toBe(150);
      });

      it('should return 50 for center with single toast', () => {
        const result = getExitingTranslateY({
          position: 'center',
          isHiddenByLimit: false,
          numberOfToasts: 1,
        stackGap: 8,
        });

        expect(result).toBe(50);
      });
    });

    describe('with multiple toasts', () => {
      it('should return negative stackGap for top-center with multiple toasts', () => {
        const result = getExitingTranslateY({
          position: 'top-center',
          isHiddenByLimit: false,
          numberOfToasts: 3,
        stackGap: 8,
        });

        // stackGap from constants is 8
        expect(result).toBe(-8);
      });

      it('should return positive stackGap for bottom-center with multiple toasts', () => {
        const result = getExitingTranslateY({
          position: 'bottom-center',
          isHiddenByLimit: false,
          numberOfToasts: 3,
        stackGap: 8,
        });

        // stackGap from constants is 8
        expect(result).toBe(8);
      });

      it('should return stackGap for center with multiple toasts', () => {
        const result = getExitingTranslateY({
          position: 'center',
          isHiddenByLimit: false,
          numberOfToasts: 2,
        stackGap: 8,
        });

        // stackGap from constants is 8
        expect(result).toBe(8);
      });

      it('should return stackGap for any other position with multiple toasts', () => {
        const result = getExitingTranslateY({
          position: 'bottom-left' as ToastPosition,
          isHiddenByLimit: false,
          numberOfToasts: 2,
        stackGap: 8,
        });

        // stackGap from constants is 8
        expect(result).toBe(8);
      });
    });

    describe('edge cases', () => {
      it('should handle undefined numberOfToasts', () => {
        const result = getExitingTranslateY({
          position: 'top-center',
          isHiddenByLimit: false,
          numberOfToasts: undefined,
        stackGap: 8,
        });

        // Should use stackGap for multiple toasts (since logic treats undefined as falsy)
        expect(result).toBe(-8);
      });

      it('should handle zero numberOfToasts', () => {
        const result = getExitingTranslateY({
          position: 'top-center',
          isHiddenByLimit: false,
          numberOfToasts: 0,
        stackGap: 8,
        });

        // Should use stackGap for multiple toasts (since logic treats 0 as falsy)
        expect(result).toBe(-8);
      });

      it('should handle undefined isHiddenByLimit', () => {
        const result = getExitingTranslateY({
          position: 'top-center',
          isHiddenByLimit: undefined,
          numberOfToasts: 2,
        stackGap: 8,
        });

        // Should use stackGap for multiple toasts
        expect(result).toBe(-8);
      });
    });

    describe('consistency with entering animation', () => {
      it('should have opposite direction values for entering vs exiting single toasts', () => {
        const enteringTop = getEnteringTranslateY('top-center');
        const exitingTop = getExitingTranslateY({
          position: 'top-center',
          isHiddenByLimit: false,
          numberOfToasts: 1,
        stackGap: 8,
        });

        // Both should be negative (up direction) but exiting should be much larger magnitude
        expect(enteringTop).toBe(-20);
        expect(exitingTop).toBe(-150);
        expect(Math.sign(enteringTop)).toBe(Math.sign(exitingTop));

        const enteringBottom = getEnteringTranslateY('bottom-center');
        const exitingBottom = getExitingTranslateY({
          position: 'bottom-center',
          isHiddenByLimit: false,
          numberOfToasts: 1,
        stackGap: 8,
        });

        // Both should be positive (down direction) but exiting should be much larger
        expect(enteringBottom).toBe(50);
        expect(exitingBottom).toBe(150);
        expect(Math.sign(enteringBottom)).toBe(Math.sign(exitingBottom));
      });
    });
  });
});
