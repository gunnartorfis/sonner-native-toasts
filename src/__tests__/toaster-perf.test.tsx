import { act } from 'react';
import TestRenderer from 'react-test-renderer';
import { Toaster } from '../toaster';
import { toast } from '../toast-fns';
import { toastStore } from '../toast-store';

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

const resetStore = () => {
  toastStore['state'] = {
    toasts: [],
    toastsById: new Map(),
    toastsCounter: 1,
    toastRefs: {},
    shouldShowOverlay: false,
    toastTimers: {},
    toastHeights: {},
    toastHeightsVersion: 0,
    isExpanded: false,
  };
  toastStore['config'] = {};
  toastStore['subscribers'] = new Set();
  toastStore['promiseResolvers'] = new Map();
  toastStore['hideOverlayTimeout'] = null;
  toastStore['collapseCooldown'] = false;
  toastStore['collapseCooldownTimeout'] = null;
};

const callsFor = (id: string | number) =>
  mockPositionCalls.filter((call) => call.id === id);

describe('Toaster (re-render blast radius)', () => {
  beforeEach(() => {
    resetStore();
    mockPositionCalls.length = 0;
    jest.clearAllTimers();
  });
  afterEach(() => {
    act(() => {
      toastStore.dismissToast(undefined);
    });
  });

  it('keeps orderedToastIds identity stable for a toast when an unrelated position changes', () => {
    act(() => {
      TestRenderer.create(<Toaster />);
    });
    let idA: string | number = '';
    act(() => {
      idA = toast('A');
    });
    const before = callsFor(idA);
    expect(before.length).toBeGreaterThan(0);
    const idsBefore = before[before.length - 1]!.orderedToastIds;

    act(() => {
      toast('B', { position: 'bottom-center' });
    });

    const after = callsFor(idA);
    if (after.length > before.length) {
      // A re-rendered; the array it receives must be the SAME object,
      // or React.memo can never take effect.
      expect(after[after.length - 1]!.orderedToastIds).toBe(idsBefore);
    }
  });

  it('does not re-render a toast when a toast is added to a different position', () => {
    act(() => {
      TestRenderer.create(<Toaster />);
    });
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
});
