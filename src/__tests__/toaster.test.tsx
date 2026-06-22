import { act } from 'react';
import TestRenderer from 'react-test-renderer';
import { Toaster } from '../toaster';
import { toast } from '../toast-fns';
import { toastStore } from '../toast-store';

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

const textOf = (instance: TestRenderer.ReactTestRenderer): string => {
  return JSON.stringify(instance.toJSON());
};

describe('Toaster (render)', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllTimers();
  });
  afterEach(() => {
    act(() => {
      toastStore.dismissToast(undefined);
    });
  });

  it('renders nothing notable when there are no toasts', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Toaster />);
    });
    expect(textOf(renderer)).not.toContain('Hello world');
  });

  it('renders a toast title after toast() is called', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Toaster />);
    });
    act(() => {
      toast('Hello world');
    });
    expect(textOf(renderer)).toContain('Hello world');
  });

  it('renders the description when provided', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Toaster />);
    });
    act(() => {
      toast('Title here', { description: 'Some description' });
    });
    const json = textOf(renderer);
    expect(json).toContain('Title here');
    expect(json).toContain('Some description');
  });

  it('removes the toast after dismiss', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<Toaster />);
    });
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
