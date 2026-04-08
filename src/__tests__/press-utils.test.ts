import { Dimensions } from 'react-native';
import {
  isPressNearCloseButton,
  getCloseButtonAreaWidth,
} from '../press-utils';

// Mock Dimensions to have consistent test results
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

const mockDimensions = Dimensions as jest.Mocked<typeof Dimensions>;

describe('press-utils', () => {
  describe('isPressNearCloseButton', () => {
    beforeEach(() => {
      // Reset mock to default screen width
      mockDimensions.get.mockReturnValue({ width: 375, height: 812, scale: 2, fontScale: 1 });
    });

    it('should return true when press is in close button area', () => {
      // Close button area is 60px from right edge
      // Screen width is 375, so close button area starts at 375 - 60 = 315
      const result = isPressNearCloseButton({ x: 320 });
      expect(result).toBe(true);
    });

    it('should return false when press is exactly at close button boundary', () => {
      // Exactly at the boundary (375 - 60 = 315) - should be false with '>' comparison
      const result = isPressNearCloseButton({ x: 315 });
      expect(result).toBe(false);
    });

    it('should return true when press is just inside close button area', () => {
      // Just inside the close button area (375 - 60 + 1 = 316)
      const result = isPressNearCloseButton({ x: 316 });
      expect(result).toBe(true);
    });

    it('should return false when press is outside close button area', () => {
      // Just outside the close button area
      const result = isPressNearCloseButton({ x: 314 });
      expect(result).toBe(false);
    });

    it('should return false when press is far from close button area', () => {
      // Far from close button area
      const result = isPressNearCloseButton({ x: 100 });
      expect(result).toBe(false);
    });

    it('should return false when press is at left edge', () => {
      const result = isPressNearCloseButton({ x: 0 });
      expect(result).toBe(false);
    });

    it('should return true when press is at right edge', () => {
      const result = isPressNearCloseButton({ x: 375 });
      expect(result).toBe(true);
    });

    it('should handle different screen widths', () => {
      // Test with a different screen width
      mockDimensions.get.mockReturnValue({ width: 414, height: 896, scale: 3, fontScale: 1 });

      // Close button area starts at 414 - 60 = 354, need > 354 to be true
      expect(isPressNearCloseButton({ x: 355 })).toBe(true);
      expect(isPressNearCloseButton({ x: 354 })).toBe(false);
    });

    it('should handle small screen widths', () => {
      // Test with a very small screen
      mockDimensions.get.mockReturnValue({ width: 320, height: 568, scale: 2, fontScale: 1 });

      // Close button area starts at 320 - 60 = 260, need > 260 to be true
      expect(isPressNearCloseButton({ x: 261 })).toBe(true);
      expect(isPressNearCloseButton({ x: 260 })).toBe(false);
    });

    it('should handle negative x coordinates', () => {
      const result = isPressNearCloseButton({ x: -10 });
      expect(result).toBe(false);
    });

    it('should handle x coordinates beyond screen width', () => {
      const result = isPressNearCloseButton({ x: 500 });
      expect(result).toBe(true);
    });

    describe('edge cases', () => {
      it('should handle floating point coordinates', () => {
        // 375 - 60 = 315, need > 315 to be true, so 315.1 should be true, 314.9 should be false
        expect(isPressNearCloseButton({ x: 314.9 })).toBe(false);
        expect(isPressNearCloseButton({ x: 315.1 })).toBe(true);
      });

      it('should work when close button area is larger than screen', () => {
        // Extreme case: very small screen
        mockDimensions.get.mockReturnValue({ width: 50, height: 100, scale: 1, fontScale: 1 });

        // Close button area would start at 50 - 60 = -10
        // Need x > -10 to be true, so any x >= -9 should be true
        expect(isPressNearCloseButton({ x: 0 })).toBe(true);
        expect(isPressNearCloseButton({ x: 25 })).toBe(true);
        expect(isPressNearCloseButton({ x: -9 })).toBe(true);
        expect(isPressNearCloseButton({ x: -11 })).toBe(false);
      });
    });
  });

  describe('getCloseButtonAreaWidth', () => {
    it('should return the correct close button area width', () => {
      const result = getCloseButtonAreaWidth();
      expect(result).toBe(60);
    });

    it('should return a consistent value', () => {
      const result1 = getCloseButtonAreaWidth();
      const result2 = getCloseButtonAreaWidth();
      expect(result1).toBe(result2);
    });

    it('should return a number', () => {
      const result = getCloseButtonAreaWidth();
      expect(typeof result).toBe('number');
    });
  });

  describe('integration between isPressNearCloseButton and getCloseButtonAreaWidth', () => {
    it('should use the same close button area width consistently', () => {
      const areaWidth = getCloseButtonAreaWidth();
      const screenWidth = 375;

      mockDimensions.get.mockReturnValue({ width: screenWidth, height: 812, scale: 2, fontScale: 1 });

      const boundary = screenWidth - areaWidth;

      // Test that the boundary calculation is consistent
      // boundary = 375 - 60 = 315, need > 315 to be true
      expect(isPressNearCloseButton({ x: boundary - 1 })).toBe(false); // 314 -> false
      expect(isPressNearCloseButton({ x: boundary })).toBe(false); // 315 -> false
      expect(isPressNearCloseButton({ x: boundary + 1 })).toBe(true); // 316 -> true
    });
  });
});
