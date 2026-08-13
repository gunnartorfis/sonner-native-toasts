import { act } from 'react';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import { toast } from '../toast-fns';
import { toastStore } from '../toast-store';
import { Toaster } from '../toaster';
import { cleanupToasterRenderers, resetToastStore } from './test-utils';

const titlesIn = (channel = '') =>
  toastStore
    .getSnapshot()
    .toasts.filter((entry) => (entry.toasterId ?? '') === channel)
    .map((entry) => entry.title);

// The channel clear is deferred by a tick so a StrictMode/same-commit remount
// can cancel it; flush that tick.
const flushChannelClear = () => {
  act(() => {
    jest.advanceTimersByTime(1);
  });
};

describe('channel lifetime', () => {
  const renderers: TestRenderer.ReactTestRenderer[] = [];
  const render = (element: React.ReactElement) => {
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

  it('drops a named channel’s toasts, timers and refs when its Toaster unmounts', () => {
    render(<Toaster />);
    const sheet = render(<Toaster id="sheet" />);
    let sheetId: string | number = '';
    act(() => {
      toast('root');
      sheetId = toast('sheet', { toasterId: 'sheet' });
    });

    act(() => {
      sheet.unmount();
    });
    flushChannelClear();

    const snapshot = toastStore.getSnapshot();
    expect(titlesIn('sheet')).toEqual([]);
    expect(titlesIn()).toEqual(['root']);
    expect(snapshot.toastTimers[sheetId]).toBeUndefined();
    expect(snapshot.toastRefs[sheetId]).toBeUndefined();
  });

  it('does not fire onDismiss or onAutoClose on teardown', () => {
    const onDismiss = jest.fn();
    const onAutoClose = jest.fn();
    const sheet = render(<Toaster id="sheet" />);
    act(() => {
      toast('sheet', { toasterId: 'sheet', onDismiss, onAutoClose });
    });

    act(() => {
      sheet.unmount();
    });
    flushChannelClear();

    expect(onDismiss).not.toHaveBeenCalled();
    expect(onAutoClose).not.toHaveBeenCalled();
  });

  it('keeps the default channel’s toasts when the root Toaster unmounts', () => {
    const root = render(<Toaster />);
    act(() => {
      toast('root');
    });
    act(() => {
      root.unmount();
    });
    flushChannelClear();

    expect(titlesIn()).toEqual(['root']);
  });

  it('keeps a channel alive across a remount in the same commit', () => {
    const sheet = render(<Toaster id="sheet" />);
    act(() => {
      toast('sheet', { toasterId: 'sheet' });
    });

    act(() => {
      sheet.unmount();
      render(<Toaster id="sheet" />);
    });
    flushChannelClear();

    expect(titlesIn('sheet')).toEqual(['sheet']);
  });

  it('survives StrictMode’s double-invoked effects', () => {
    render(
      <React.StrictMode>
        <Toaster id="sheet" />
      </React.StrictMode>
    );
    act(() => {
      toast('sheet', { toasterId: 'sheet' });
    });
    flushChannelClear();

    expect(titlesIn('sheet')).toEqual(['sheet']);
  });

  it('clears a channel only when its last Toaster unmounts', () => {
    const first = render(<Toaster id="sheet" />);
    render(<Toaster id="sheet" />);
    act(() => {
      toast('sheet', { toasterId: 'sheet' });
    });

    act(() => {
      first.unmount();
    });
    flushChannelClear();

    expect(titlesIn('sheet')).toEqual(['sheet']);
  });

  it('does not apply a torn-down channel’s config to later toasts', () => {
    const sheet = render(<Toaster id="sheet" visibleToasts={1} />);
    act(() => {
      sheet.unmount();
    });
    flushChannelClear();

    // A stale visibleToasts={1} would trim these to one.
    act(() => {
      toast('s1', { toasterId: 'sheet' });
      toast('s2', { toasterId: 'sheet' });
      toast('s3', { toasterId: 'sheet' });
    });

    expect(titlesIn('sheet')).toEqual(['s1', 's2', 's3']);
  });

  it('does not apply an unmounted default Toaster’s config to later toasts', () => {
    const root = render(<Toaster visibleToasts={1} />);
    act(() => {
      root.unmount();
    });
    flushChannelClear();

    // Before per-channel config cleanup, visibleToasts={1} outlived its
    // Toaster and kept trimming the default channel to a single toast.
    act(() => {
      toast('r1');
      toast('r2');
      toast('r3');
    });

    expect(titlesIn()).toEqual(['r1', 'r2', 'r3']);
  });
});
