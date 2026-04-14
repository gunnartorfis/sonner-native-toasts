import { isPressNearCloseButton } from '../press-utils';
import { CLOSE_BUTTON_HIT_AREA } from '../constants';

describe('press-utils', () => {
  describe('isPressNearCloseButton', () => {
    const screenWidth = 375;

    it('should return true when press is in close button area', () => {
      // Close button area is 60px from right edge
      // Screen width is 375, so close button area starts at 375 - 60 = 315
      const result = isPressNearCloseButton({ x: 320, viewWidth: screenWidth });
      expect(result).toBe(true);
    });

    it('should return false when press is exactly at close button boundary', () => {
      // Exactly at the boundary (375 - 60 = 315) - should be false with '>' comparison
      const result = isPressNearCloseButton({ x: 315, viewWidth: screenWidth });
      expect(result).toBe(false);
    });

    it('should return true when press is just inside close button area', () => {
      // Just inside the close button area (375 - 60 + 1 = 316)
      const result = isPressNearCloseButton({ x: 316, viewWidth: screenWidth });
      expect(result).toBe(true);
    });

    it('should return false when press is outside close button area', () => {
      const result = isPressNearCloseButton({ x: 314, viewWidth: screenWidth });
      expect(result).toBe(false);
    });

    it('should return false when press is far from close button area', () => {
      const result = isPressNearCloseButton({ x: 100, viewWidth: screenWidth });
      expect(result).toBe(false);
    });

    it('should return false when press is at left edge', () => {
      const result = isPressNearCloseButton({ x: 0, viewWidth: screenWidth });
      expect(result).toBe(false);
    });

    it('should return true when press is at right edge', () => {
      const result = isPressNearCloseButton({ x: 375, viewWidth: screenWidth });
      expect(result).toBe(true);
    });

    it('should handle different screen widths', () => {
      const wideScreen = 414;
      // Close button area starts at 414 - 60 = 354, need > 354 to be true
      expect(isPressNearCloseButton({ x: 355, viewWidth: wideScreen })).toBe(true);
      expect(isPressNearCloseButton({ x: 354, viewWidth: wideScreen })).toBe(false);
    });

    it('should handle small screen widths', () => {
      const smallScreen = 320;
      // Close button area starts at 320 - 60 = 260, need > 260 to be true
      expect(isPressNearCloseButton({ x: 261, viewWidth: smallScreen })).toBe(true);
      expect(isPressNearCloseButton({ x: 260, viewWidth: smallScreen })).toBe(false);
    });

    it('should handle negative x coordinates', () => {
      const result = isPressNearCloseButton({ x: -10, viewWidth: screenWidth });
      expect(result).toBe(false);
    });

    it('should handle x coordinates beyond screen width', () => {
      const result = isPressNearCloseButton({ x: 500, viewWidth: screenWidth });
      expect(result).toBe(true);
    });

    describe('edge cases', () => {
      it('should handle floating point coordinates', () => {
        // 375 - 60 = 315, need > 315 to be true
        expect(isPressNearCloseButton({ x: 314.9, viewWidth: screenWidth })).toBe(false);
        expect(isPressNearCloseButton({ x: 315.1, viewWidth: screenWidth })).toBe(true);
      });

      it('should work when close button area is larger than screen', () => {
        const tinyScreen = 50;
        // Close button area would start at 50 - 60 = -10
        // Need x > -10 to be true
        expect(isPressNearCloseButton({ x: 0, viewWidth: tinyScreen })).toBe(true);
        expect(isPressNearCloseButton({ x: 25, viewWidth: tinyScreen })).toBe(true);
        expect(isPressNearCloseButton({ x: -9, viewWidth: tinyScreen })).toBe(true);
        expect(isPressNearCloseButton({ x: -11, viewWidth: tinyScreen })).toBe(false);
      });
    });
  });

  describe('CLOSE_BUTTON_HIT_AREA constant', () => {
    it('should be 60', () => {
      expect(CLOSE_BUTTON_HIT_AREA).toBe(60);
    });
  });

  describe('integration', () => {
    it('should use CLOSE_BUTTON_HIT_AREA for boundary calculation', () => {
      const viewWidth = 375;
      const boundary = viewWidth - CLOSE_BUTTON_HIT_AREA;

      // boundary = 375 - 60 = 315, need > 315 to be true
      expect(isPressNearCloseButton({ x: boundary - 1, viewWidth })).toBe(false);
      expect(isPressNearCloseButton({ x: boundary, viewWidth })).toBe(false);
      expect(isPressNearCloseButton({ x: boundary + 1, viewWidth })).toBe(true);
    });
  });
});
