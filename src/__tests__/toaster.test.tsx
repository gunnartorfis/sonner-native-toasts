import { act, type ReactElement } from 'react';
import TestRenderer from 'react-test-renderer';
import { Positioner } from '../positioner';
import { Toaster } from '../toaster';
import { toast } from '../toast-fns';
import type { ToastPosition } from '../types';
import { cleanupToasterRenderers, resetToastStore } from './test-utils';

const textOf = (instance: TestRenderer.ReactTestRenderer): string => {
  return JSON.stringify(instance.toJSON());
};

describe('Toaster (render)', () => {
  const renderers: TestRenderer.ReactTestRenderer[] = [];
  const renderToaster = (element: ReactElement) => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(element);
    });
    renderers.push(renderer);
    return renderer;
  };

  beforeEach(() => {
    resetToastStore();
    jest.clearAllTimers();
  });
  afterEach(() => {
    cleanupToasterRenderers(renderers);
  });

  it('renders nothing notable when there are no toasts', () => {
    const renderer = renderToaster(<Toaster />);
    expect(textOf(renderer)).not.toContain('Hello world');
  });

  it('renders a toast title after toast() is called', () => {
    const renderer = renderToaster(<Toaster />);
    act(() => {
      toast('Hello world');
    });
    expect(textOf(renderer)).toContain('Hello world');
  });

  it('renders the description when provided', () => {
    const renderer = renderToaster(<Toaster />);
    act(() => {
      toast('Title here', { description: 'Some description' });
    });
    const json = textOf(renderer);
    expect(json).toContain('Title here');
    expect(json).toContain('Some description');
  });

  describe('position bucketing', () => {
    const findPositioner = (
      renderer: TestRenderer.ReactTestRenderer,
      position: ToastPosition
    ) => {
      const match = renderer.root
        .findAllByType(Positioner)
        .find((positioner) => positioner.props.position === position);
      if (!match) {
        throw new Error(`No Positioner rendered for position ${position}`);
      }
      return match;
    };

    const positionerContains = (
      positioner: TestRenderer.ReactTestInstance,
      title: string
    ): boolean => {
      return (
        positioner.findAll((node) => node.props?.children === title).length > 0
      );
    };

    it('keeps position-less toasts in the Toaster default container when another toast uses an explicit position', () => {
      const renderer = renderToaster(<Toaster position="bottom-center" />);
      act(() => {
        toast('plain');
        toast('pinned', { position: 'top-center' });
      });

      expect(
        positionerContains(findPositioner(renderer, 'bottom-center'), 'plain')
      ).toBe(true);
      expect(
        positionerContains(findPositioner(renderer, 'top-center'), 'pinned')
      ).toBe(true);
      expect(
        positionerContains(findPositioner(renderer, 'top-center'), 'plain')
      ).toBe(false);
    });

    it('keeps position-less toasts in a center default container alongside an explicit bottom-center toast', () => {
      const renderer = renderToaster(<Toaster position="center" />);
      act(() => {
        toast('floaty');
        toast('grounded', { position: 'bottom-center' });
      });

      expect(
        positionerContains(findPositioner(renderer, 'center'), 'floaty')
      ).toBe(true);
      expect(
        positionerContains(
          findPositioner(renderer, 'bottom-center'),
          'grounded'
        )
      ).toBe(true);
      expect(
        positionerContains(findPositioner(renderer, 'bottom-center'), 'floaty')
      ).toBe(false);
    });

    it('orders a top-center container newest-first even when the Toaster default is bottom-center', () => {
      const renderer = renderToaster(<Toaster position="bottom-center" />);
      act(() => {
        toast('a', { position: 'top-center' });
        toast('b', { position: 'top-center' });
      });

      const topPositioner = findPositioner(renderer, 'top-center');
      const titlesInRenderOrder = topPositioner
        .findAll(
          (node) => node.props?.children === 'a' || node.props?.children === 'b'
        )
        .map((node) => node.props.children);
      // top-center renders newest first (same as a top-center default Toaster)
      expect(titlesInRenderOrder).toEqual(['b', 'a']);
    });
  });

  it('removes the toast after dismiss', () => {
    const renderer = renderToaster(<Toaster />);
    let id: string | number = '';
    act(() => {
      id = toast('Dismiss me');
    });
    expect(textOf(renderer)).toContain('Dismiss me');
    act(() => {
      toast.dismiss(id);
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(textOf(renderer)).not.toContain('Dismiss me');
  });
});
