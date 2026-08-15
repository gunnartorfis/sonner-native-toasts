import { act } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { toast } from '../toast-fns';
import { toastStore } from '../toast-store';
import { Toaster } from '../toaster';
import { createToasterHarness, resetToastStore } from './test-utils';

// End-to-end tap path: fires the actual onEnd handler the toast registered on
// its Tap gesture (the same callback a native tap invokes via runOnJS), so the
// whole chain is covered — gesture handler → onSwipePress gate → context
// toggleExpand → store → re-render.
//
// A real tap fires exactly one handler: the LATEST gesture instance of the
// tapped toast. Firing older instances too would simulate rapid repeated taps
// (expand, collapse, cooldown) and assert the wrong thing.
const fireSingleTap = (x: number) => {
  const tapMock = Gesture.Tap as unknown as jest.Mock;
  const results = tapMock.mock.results;
  const lastChainable = results[results.length - 1]?.value as {
    onEnd: jest.Mock;
  };
  const calls = lastChainable.onEnd.mock.calls;
  const handler = calls[calls.length - 1]?.[0] as (event: {
    x: number;
    y: number;
  }) => void;
  act(() => {
    handler({ x, y: 10 });
  });
};

describe('tap-to-expand', () => {
  const { render, cleanup } = createToasterHarness();

  beforeEach(() => {
    resetToastStore();
    jest.clearAllTimers();
  });
  afterEach(cleanup);

  it('a tap on a stacked toast expands the stack', () => {
    render(<Toaster enableStacking />);
    act(() => {
      toast('a');
      toast('b');
      toast('c');
    });

    fireSingleTap(50); // away from the right-edge close-button zone

    expect(toastStore.isChannelExpanded()).toBe(true);
  });

  it('a tap on a sheet stack expands only the sheet channel', () => {
    render(<Toaster />);
    render(<Toaster id="sheet" enableStacking />);
    act(() => {
      toast('s1', { toasterId: 'sheet' });
      toast('s2', { toasterId: 'sheet' });
    });

    fireSingleTap(50);

    expect(toastStore.isChannelExpanded('sheet')).toBe(true);
    expect(toastStore.isChannelExpanded()).toBe(false);
  });

  it('a tap in the close-button zone does not expand (pre-existing design)', () => {
    render(<Toaster enableStacking />);
    act(() => {
      toast('a');
      toast('b');
    });

    // Within CLOSE_BUTTON_HIT_AREA (60px) of the right edge of the mocked
    // 375px window: reserved for the close button, eaten while collapsed.
    fireSingleTap(370);

    expect(toastStore.isChannelExpanded()).toBe(false);
  });
});
