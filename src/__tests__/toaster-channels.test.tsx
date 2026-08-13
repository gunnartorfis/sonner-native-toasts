import { act } from 'react';
import TestRenderer from 'react-test-renderer';
import { toast } from '../toast-fns';
import { toastStore } from '../toast-store';
import { Toaster } from '../toaster';
import { cleanupToasterRenderers, resetToastStore } from './test-utils';

// One entry per Toast body render, so a toast rendered by two Toasters is
// visible as two entries.
const renderedIds: Array<string | number> = [];
jest.mock('../use-toast-position', () => {
  const actual = jest.requireActual('../use-toast-position');
  return {
    ...actual,
    useToastPosition: (args: { id: string | number }) => {
      renderedIds.push(args.id);
      return actual.useToastPosition(args);
    },
  };
});

const rendersOf = (id: string | number) =>
  renderedIds.filter((rendered) => rendered === id).length;

const titlesIn = (channel = '') =>
  toastStore
    .getSnapshot()
    .toasts.filter((entry) => (entry.toasterId ?? '') === channel)
    .map((entry) => entry.title);

describe('Toaster channels', () => {
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
    renderedIds.length = 0;
    jest.clearAllTimers();
  });
  afterEach(() => {
    cleanupToasterRenderers(renderers);
  });

  describe('routing', () => {
    it('renders each toast in exactly one Toaster', () => {
      render(<Toaster />);
      render(<Toaster id="sheet" />);

      let rootId: string | number = '';
      let sheetId: string | number = '';
      act(() => {
        rootId = toast('root');
        sheetId = toast('sheet', { toasterId: 'sheet' });
      });

      expect(rendersOf(rootId)).toBe(1);
      expect(rendersOf(sheetId)).toBe(1);
      expect(titlesIn()).toEqual(['root']);
      expect(titlesIn('sheet')).toEqual(['sheet']);
    });

    it('gives toasts unique ids across channels', () => {
      render(<Toaster />);
      render(<Toaster id="sheet" />);
      let rootId: string | number = '';
      let sheetId: string | number = '';
      act(() => {
        rootId = toast('root');
        sheetId = toast('sheet', { toasterId: 'sheet' });
      });
      expect(rootId).not.toBe(sheetId);
    });

    it('does not render an unaddressed toast in a named Toaster', () => {
      render(<Toaster id="sheet" />);
      let id: string | number = '';
      act(() => {
        id = toast('unaddressed');
      });
      expect(rendersOf(id)).toBe(0);
    });

    it('does not render an addressed toast in an unnamed Toaster', () => {
      render(<Toaster />);
      let id: string | number = '';
      act(() => {
        id = toast('addressed', { toasterId: 'sheet' });
      });
      expect(rendersOf(id)).toBe(0);
    });

    it('keeps an updated toast in its channel', () => {
      render(<Toaster />);
      render(<Toaster id="sheet" />);
      act(() => {
        toast('first', { id: 'x', toasterId: 'sheet' });
      });
      act(() => {
        toast('second', { id: 'x', toasterId: 'sheet' });
      });
      expect(titlesIn('sheet')).toEqual(['second']);
      expect(titlesIn()).toEqual([]);
    });

    it('resolves a promise toast inside its own channel', async () => {
      render(<Toaster />);
      render(<Toaster id="sheet" />);
      act(() => {
        toast.promise(Promise.resolve('done'), {
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
      expect(titlesIn()).toEqual([]);
    });

    it('does not re-render one channel’s toasts when another channel changes', () => {
      render(<Toaster />);
      render(<Toaster id="sheet" />);
      let rootId: string | number = '';
      act(() => {
        rootId = toast('root');
      });
      const rendersBefore = rendersOf(rootId);

      // Every Toaster subscribes to the same store, so the root Toaster does
      // re-render here — but its per-position props keep their identity, so
      // React.memo must keep the Toast itself from re-rendering.
      act(() => {
        toast('sheet', { toasterId: 'sheet' });
      });

      expect(rendersOf(rootId) - rendersBefore).toBe(0);
    });

    it('leaves the single-Toaster path unchanged', () => {
      render(<Toaster />);
      let id: string | number = '';
      act(() => {
        id = toast('A');
      });
      expect(rendersOf(id)).toBe(1);
      expect(toastStore.shouldShowOverlayFor()).toBe(true);
    });
  });

  describe('config', () => {
    it('applies visibleToasts and duration per channel', () => {
      render(<Toaster visibleToasts={5} duration={1000} />);
      render(<Toaster id="sheet" visibleToasts={1} duration={9000} />);

      let rootId: string | number = '';
      let sheetId: string | number = '';
      act(() => {
        rootId = toast('r1');
        toast('r2');
        toast('r3');
        toast('s1', { toasterId: 'sheet' });
        toast('s2', { toasterId: 'sheet' });
        sheetId = toast('s3', { toasterId: 'sheet' });
      });

      const snapshot = toastStore.getSnapshot();
      expect(titlesIn()).toEqual(['r1', 'r2', 'r3']);
      expect(titlesIn('sheet')).toEqual(['s3']);
      expect(snapshot.toastsById.get(rootId)?.duration).toBe(1000);
      expect(snapshot.toastsById.get(sheetId)?.duration).toBe(9000);
    });

    it('never evicts another channel’s toasts when trimming', () => {
      render(<Toaster visibleToasts={1} />);
      render(<Toaster id="sheet" visibleToasts={1} />);
      act(() => {
        toast('keep-me', { toasterId: 'sheet' });
        toast('r1');
        toast('r2');
        toast('r3');
      });
      expect(titlesIn('sheet')).toEqual(['keep-me']);
      expect(titlesIn()).toEqual(['r3']);
    });
  });

  describe('expansion', () => {
    it('expands one channel without expanding the other', () => {
      render(<Toaster />);
      render(<Toaster id="sheet" />);
      act(() => {
        toast('r1');
        toast('r2');
        toast('s1', { toasterId: 'sheet' });
        toast('s2', { toasterId: 'sheet' });
      });

      act(() => {
        toastStore.expand('sheet');
      });

      expect(toastStore.isChannelExpanded('sheet')).toBe(true);
      expect(toastStore.isChannelExpanded()).toBe(false);
    });

    it('pauses only the expanded channel’s timers', () => {
      render(<Toaster />);
      render(<Toaster id="sheet" />);
      let rootId: string | number = '';
      let sheetId: string | number = '';
      act(() => {
        rootId = toast('r1');
        toast('r2');
        sheetId = toast('s1', { toasterId: 'sheet' });
        toast('s2', { toasterId: 'sheet' });
      });

      act(() => {
        toastStore.expand('sheet');
      });

      const timers = toastStore.getSnapshot().toastTimers;
      expect(timers[sheetId]?.isPaused).toBe(true);
      expect(timers[rootId]?.isPaused).toBe(false);
    });
  });

  describe('dismissal', () => {
    it('clears every channel on a bare toast.dismiss()', () => {
      render(<Toaster />);
      render(<Toaster id="sheet" />);
      act(() => {
        toast('root');
        toast('sheet', { toasterId: 'sheet' });
      });
      act(() => {
        toast.dismiss();
      });
      expect(toastStore.getSnapshot().toasts).toHaveLength(0);
    });

    it('dismisses by id without a channel argument', () => {
      render(<Toaster />);
      render(<Toaster id="sheet" />);
      let sheetId: string | number = '';
      act(() => {
        toast('root');
        sheetId = toast('sheet', { toasterId: 'sheet' });
      });
      act(() => {
        toast.dismiss(sheetId);
      });
      expect(titlesIn('sheet')).toEqual([]);
      expect(titlesIn()).toEqual(['root']);
    });
  });

  describe('dev warnings', () => {
    it('warns when two Toasters share a channel id', () => {
      render(<Toaster id="sheet" />);
      expect(console.warn).not.toHaveBeenCalled();

      render(<Toaster id="sheet" />);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(jest.mocked(console.warn).mock.calls[0]?.[0]).toContain(
        'Multiple <Toaster id="sheet" />'
      );
    });

    it('does not warn for two unnamed Toasters', () => {
      render(<Toaster />);
      render(<Toaster />);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('warns when a toast targets a channel with no mounted Toaster', () => {
      render(<Toaster />);
      act(() => {
        toast('nowhere', { toasterId: 'typo' });
      });
      expect(console.warn).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(jest.mocked(console.warn).mock.calls[0]?.[0]).toContain(
        'toasterId "typo"'
      );
    });

    it('warns once per channel, not once per orphaned toast', () => {
      render(<Toaster />);
      act(() => {
        toast('one', { toasterId: 'typo' });
        toast('two', { toasterId: 'typo' });
        toast('three', { toasterId: 'typo' });
      });
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it('does not warn when the channel’s Toaster mounts in the same commit', () => {
      act(() => {
        TestRenderer.create(<Toaster id="sheet" />);
        toast('fine', { toasterId: 'sheet' });
      });
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('does not warn for toasts on the default channel with no Toaster', () => {
      act(() => {
        toast('before mount');
      });
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});
