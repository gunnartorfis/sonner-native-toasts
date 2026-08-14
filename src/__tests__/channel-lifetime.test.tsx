import { act } from 'react';
import * as React from 'react';
import { toast } from '../toast-fns';
import { toastStore } from '../toast-store';
import { Toaster } from '../toaster';
import { createToasterHarness, resetToastStore, titlesIn } from './test-utils';

// The channel clear is deferred by a tick so a StrictMode/same-commit remount
// can cancel it; flush that tick.
const flushChannelClear = () => {
  act(() => {
    jest.advanceTimersByTime(1);
  });
};

describe('channel lifetime', () => {
  const { render, cleanup } = createToasterHarness();

  beforeEach(() => {
    resetToastStore();
    jest.clearAllTimers();
  });
  afterEach(cleanup);

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

  it('drops channel-keyed state even when the channel has no toasts', () => {
    const sheet = render(<Toaster id="sheet" />);
    act(() => {
      toast('s1', { toasterId: 'sheet' });
    });
    // Dismissing leaves isExpanded/shouldShowOverlay KEYS behind (values
    // false-ish) and schedules a hide timeout for the channel.
    act(() => {
      toast.dismiss();
    });

    act(() => {
      sheet.unmount();
    });
    flushChannelClear();

    // Key-absence assertions: this is a leak check on the sparse records, so
    // direct indexing (normally forbidden) is the point.
    const snapshot = toastStore.getSnapshot();
    expect('sheet' in snapshot.shouldShowOverlay).toBe(false);
    expect('sheet' in snapshot.isExpanded).toBe(false);
  });

  describe('toasts sent before the channel mounts (web-Sonner parity)', () => {
    it('does not tick the auto-close timer while the channel is unmounted', () => {
      act(() => {
        toast('waiting', { toasterId: 'sheet', duration: 4000 });
      });

      expect(Object.keys(toastStore.getSnapshot().toastTimers)).toHaveLength(0);

      // Way past the duration: the toast must still be waiting.
      act(() => {
        jest.advanceTimersByTime(60_000);
      });
      expect(titlesIn('sheet')).toEqual(['waiting']);
    });

    it('starts the timer when the channel mounts, then auto-closes', () => {
      const onAutoClose = jest.fn();
      act(() => {
        toast('waiting', { toasterId: 'sheet', duration: 4000, onAutoClose });
      });
      act(() => {
        jest.advanceTimersByTime(60_000);
      });

      render(<Toaster id="sheet" />);
      expect(titlesIn('sheet')).toEqual(['waiting']);

      act(() => {
        jest.advanceTimersByTime(10_000);
      });
      expect(titlesIn('sheet')).toEqual([]);
      expect(onAutoClose).toHaveBeenCalledTimes(1);
    });

    it('keeps main’s behavior for the default channel: timers always run', () => {
      const onAutoClose = jest.fn();
      act(() => {
        toast('root', { duration: 4000, onAutoClose });
      });
      act(() => {
        jest.advanceTimersByTime(10_000);
      });
      expect(titlesIn()).toEqual([]);
      expect(onAutoClose).toHaveBeenCalledTimes(1);
    });

    it('does not reset running timers when a second Toaster mounts the channel', () => {
      render(<Toaster id="sheet" />);
      act(() => {
        toast('live', { toasterId: 'sheet', duration: 4000 });
      });
      const before =
        toastStore.getSnapshot().toastTimers[
          toastStore.getSnapshot().toasts[0]!.id
        ];

      const second = render(<Toaster id="sheet" />);
      const after =
        toastStore.getSnapshot().toastTimers[
          toastStore.getSnapshot().toasts[0]!.id
        ];
      expect(after).toBe(before);
      act(() => {
        second.unmount();
      });
    });

    it('a promise toast resolved while unmounted waits, then auto-closes on mount', async () => {
      act(() => {
        toast.promise(Promise.resolve('ok'), {
          loading: 'loading',
          success: () => 'resolved',
          error: 'failed',
          toasterId: 'sheet',
        });
      });
      await act(async () => {
        await Promise.resolve();
      });
      expect(titlesIn('sheet')).toEqual(['resolved']);
      expect(Object.keys(toastStore.getSnapshot().toastTimers)).toHaveLength(0);

      render(<Toaster id="sheet" />);
      act(() => {
        jest.advanceTimersByTime(10_000);
      });
      expect(titlesIn('sheet')).toEqual([]);
    });
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
