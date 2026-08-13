import { act } from 'react';
import type { ReactTestRenderer } from 'react-test-renderer';
import { toastStore } from '../toast-store';

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
  toastStore['collapseCooldown'] = false;
  toastStore['collapseCooldownTimeout'] = null;
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
