import { act } from 'react';
import TestRenderer from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';
import { channelOf, DEFAULT_CHANNEL, toastStore } from '../toast-store';

// Single source of truth for resetting ToastStore private state between
// tests. When a field is added to the store, extend THIS helper — not the
// individual test files.
export const resetToastStore = () => {
  toastStore['state'] = {
    toasts: [],
    toastsById: new Map(),
    toastsCounter: 1,
    toastRefs: {},
    shouldShowOverlay: {},
    toastTimers: {},
    toastHeights: {},
    toastHeightsVersion: 0,
    isExpanded: {},
  };
  toastStore['configByChannel'] = {};
  toastStore['subscribers'] = new Set();
  toastStore['promiseResolvers'] = new Map();
  toastStore['hideOverlayTimeouts'] = {};
  toastStore['mountedByChannel'] = {};
  toastStore['clearChannelTimeouts'] = {};
  toastStore['warnedUnmountedChannels'] = new Set();
  toastStore['collapseCooldowns'] = new Set();
  toastStore['collapseCooldownTimeouts'] = {};
};

// afterEach cleanup for tests that mount <Toaster />: dismisses everything and
// flushes the hide-overlay timer inside act() while the trees are still
// mounted (so no store notify() fires outside act against a mounted tree),
// then unmounts every tracked renderer.
export const cleanupToasterRenderers = (renderers: ReactTestRenderer[]) => {
  act(() => {
    toastStore.dismissToast(undefined);
  });
  act(() => {
    jest.runOnlyPendingTimers();
  });
  for (const renderer of renderers) {
    act(() => {
      renderer.unmount();
    });
  }
  renderers.length = 0;
};

// Titles of the store's toasts in one channel, in order — the standard
// assertion helper for channel-routing tests.
export const titlesIn = (channel = DEFAULT_CHANNEL) =>
  toastStore
    .getSnapshot()
    .toasts.filter((entry) => channelOf(entry) === channel)
    .map((entry) => entry.title);

// The render half of the harness whose cleanup half is
// cleanupToasterRenderers: an act()-wrapped TestRenderer.create that tracks
// every renderer so afterEach can unmount them all.
export const createToasterHarness = () => {
  const renderers: ReactTestRenderer[] = [];
  const render = (element: React.ReactElement): ReactTestRenderer => {
    let renderer!: ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(element);
    });
    renderers.push(renderer);
    return renderer;
  };
  const cleanup = () => cleanupToasterRenderers(renderers);
  return { render, cleanup };
};
