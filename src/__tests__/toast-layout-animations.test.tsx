import { act } from 'react';
import TestRenderer from 'react-test-renderer';
import { useReducedMotion } from 'react-native-reanimated';
import { useToastLayoutAnimations } from '../animations';
import type { ToastAnimation } from '../types';

jest.mock('../context', () => ({
  useToastContext: () => ({
    position: 'top-center',
    gap: 8,
    animation: { exit: 'none' },
  }),
}));

describe('useToastLayoutAnimations', () => {
  const getAnimations = (animation?: ToastAnimation, hidden = false) => {
    let result: ReturnType<typeof useToastLayoutAnimations> | undefined;
    const Probe = () => {
      result = useToastLayoutAnimations(undefined, animation, hidden, 4);
      return null;
    };
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });
    act(() => renderer.unmount());
    if (!result) throw new Error('Animation probe did not render');
    return result;
  };

  afterEach(() => {
    jest.mocked(useReducedMotion).mockReturnValue(false);
  });

  it('disables exit independently of enter at the Toaster level', () => {
    const result = getAnimations();
    expect(result.entering).toEqual(expect.any(Function));
    expect(result.exiting).toBeUndefined();
  });

  it('disables both animations per toast', () => {
    expect(getAnimations({ enter: 'none', exit: 'none' })).toEqual({
      entering: undefined,
      exiting: undefined,
    });
  });

  it('keeps exit disabled when the toast overflows visibleToasts', () => {
    expect(getAnimations(undefined, true).exiting).toBeUndefined();
    expect(getAnimations({ exit: 'none' }, true).exiting).toBeUndefined();
  });

  it('uses the library fade for a custom exit on an overflowing toast', () => {
    const customExit = jest.fn();
    const result = getAnimations({ exit: customExit }, true);
    expect(result.exiting).toEqual(expect.any(Function));
    expect(result.exiting).not.toBe(customExit);
  });

  it('lets per-toast default restore exit animations', () => {
    expect(getAnimations({ exit: 'default' }).exiting).toEqual(
      expect.any(Function)
    );
  });

  it('keeps reduced motion authoritative over per-toast defaults', () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    expect(getAnimations({ enter: 'default', exit: 'default' })).toEqual({
      entering: undefined,
      exiting: undefined,
    });
  });
});
