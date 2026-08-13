import { act } from 'react';
import TestRenderer from 'react-test-renderer';
import { Toaster } from '../toaster';
import { toast } from '../toast-fns';
import { toastStore } from '../toast-store';
import { cleanupToasterRenderers, resetToastStore } from './test-utils';

// Wraps useToastPosition so every Toast render is observable: the hook runs
// exactly once per Toast body render, and receives the orderedToastIds prop.
const mockPositionCalls: Array<{
  id: string | number;
  orderedToastIds: Array<string | number>;
}> = [];
jest.mock('../use-toast-position', () => {
  const actual = jest.requireActual('../use-toast-position');
  return {
    ...actual,
    useToastPosition: (args: {
      id: string | number;
      orderedToastIds: Array<string | number>;
    }) => {
      mockPositionCalls.push({
        id: args.id,
        orderedToastIds: args.orderedToastIds,
      });
      return actual.useToastPosition(args);
    },
  };
});

const callsFor = (id: string | number) =>
  mockPositionCalls.filter((call) => call.id === id);

describe('Toaster (re-render blast radius)', () => {
  const renderers: TestRenderer.ReactTestRenderer[] = [];
  const renderToaster = () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Toaster />);
    });
    renderers.push(renderer);
    return renderer;
  };

  beforeEach(() => {
    resetToastStore();
    mockPositionCalls.length = 0;
    jest.clearAllTimers();
  });
  afterEach(() => {
    cleanupToasterRenderers(renderers);
  });

  it('keeps orderedToastIds identity stable for a toast when an unrelated position changes', () => {
    renderToaster();
    let idA: string | number = '';
    act(() => {
      idA = toast('A');
    });
    const before = callsFor(idA);
    expect(before.length).toBeGreaterThan(0);
    const idsBefore = before[before.length - 1]!.orderedToastIds;

    let idB: string | number = '';
    act(() => {
      idB = toast('B', { position: 'bottom-center' });
    });
    // A height write flows through DynamicToastContext and legitimately
    // re-renders every toast — forcing A to re-render so the identity of
    // its orderedToastIds prop is verified unconditionally.
    act(() => {
      toastStore.setToastHeight(idB, 80);
    });

    const after = callsFor(idA);
    expect(after.length).toBeGreaterThan(before.length);
    // A re-rendered; the array it receives must be the SAME object,
    // or React.memo can never take effect.
    expect(after[after.length - 1]!.orderedToastIds).toBe(idsBefore);
  });

  it('does not re-render a toast when a toast is added to a different position', () => {
    renderToaster();
    let idA: string | number = '';
    act(() => {
      idA = toast('A');
      toast('B', { position: 'bottom-center' });
    });
    const rendersBefore = callsFor(idA).length;

    act(() => {
      toast('C', { position: 'bottom-center' });
    });

    const extraRenders = callsFor(idA).length - rendersBefore;
    // A's container (top-center default) is untouched by C; with stable
    // per-position props and React.memo, A must not re-render at all.
    expect(extraRenders).toBe(0);
  });

  it('does not re-render a toast when a heightless toast at a different position is dismissed', () => {
    renderToaster();
    let idA: string | number = '';
    let idB: string | number = '';
    act(() => {
      idA = toast('A');
      idB = toast('B', { position: 'bottom-center' });
    });
    const rendersBefore = callsFor(idA).length;

    // B never reported a height, so dismissing it must not bump
    // toastHeightsVersion — and A's position is untouched by the removal.
    act(() => {
      toastStore.dismissToast(idB);
    });

    const extraRenders = callsFor(idA).length - rendersBefore;
    expect(extraRenders).toBe(0);
  });

  it('does not re-render toasts when the Toaster host re-renders with unchanged props', () => {
    const renderer = renderToaster();
    let idA: string | number = '';
    act(() => {
      idA = toast('A');
    });
    const rendersBefore = callsFor(idA).length;

    // Only stable props reach Toast (no rest-spread), so a host re-render
    // with unchanged Toaster props must not defeat React.memo.
    act(() => {
      renderer.update(<Toaster />);
    });

    const extraRenders = callsFor(idA).length - rendersBefore;
    expect(extraRenders).toBe(0);
  });
});
