import * as React from 'react';
import { ENTERING_ANIMATION_DURATION } from './animations';
import { toastDefaultValues } from './constants';
import { areToastsEqual } from './toast-comparator';
import type { ToastProps, ToastRef } from './types';

type ToastTimer = {
  timeout: ReturnType<typeof setTimeout>;
  startTime: number;
  remainingTime: number;
  isPaused: boolean;
};

type ToastStoreState = {
  toasts: ToastProps[];
  toastsById: Map<string | number, ToastProps>;
  toastsCounter: number;
  toastRefs: Record<string | number, React.RefObject<ToastRef | null>>;
  // Keyed by channel (a Toaster's `id`; DEFAULT_CHANNEL for unnamed ones).
  shouldShowOverlay: Record<string, boolean>;
  toastTimers: Record<string | number, ToastTimer>;
  toastHeights: Record<string | number, number>;
  toastHeightsVersion: number;
  isExpanded: Record<string, boolean>;
};

// Toasts with no toasterId belong to this channel, rendered by an unnamed
// <Toaster />. Matches web Sonner's `!toast.toasterId` rule.
export const DEFAULT_CHANNEL = '';

// The single definition of the routing rule; Toaster's filter uses it too.
export const channelOf = (toast: { toasterId?: string }): string =>
  toast.toasterId ?? DEFAULT_CHANNEL;

// Pure snapshot readers for the sparse channel records. Render code MUST use
// these on the useSyncExternalStore snapshot — never the store-instance
// accessors: the React Compiler memoizes render expressions by their inputs,
// and a store method call has only `channel` as a visible input, so it gets
// cached across renders and never sees state changes. The snapshot object is
// a tracked reactive input, so these recompute exactly when the store
// notifies.
export const getChannelExpanded = (
  state: Pick<ToastStoreState, 'isExpanded'>,
  channel: string = DEFAULT_CHANNEL
): boolean => state.isExpanded[channel] ?? false;

export const getChannelOverlay = (
  state: Pick<ToastStoreState, 'shouldShowOverlay'>,
  channel: string = DEFAULT_CHANNEL
): boolean => state.shouldShowOverlay[channel] ?? false;

type Subscriber = () => void;

type ToastStoreConfig = {
  autoWiggleOnUpdate?: 'never' | 'toast-change' | 'always';
  visibleToasts?: number;
  duration?: number;
  pauseWhenPageIsHidden?: boolean;
};

class ToastStore {
  private state: ToastStoreState = {
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

  private subscribers = new Set<Subscriber>();
  private configByChannel: Record<string, ToastStoreConfig> = {};
  private hideOverlayTimeouts: Record<
    string,
    ReturnType<typeof setTimeout>
  > = {};
  private promiseResolvers = new Map<string | number, boolean>();
  private mountedByChannel: Record<string, number> = {};
  private warnedUnmountedChannels = new Set<string>();
  private clearChannelTimeouts: Record<
    string,
    ReturnType<typeof setTimeout>
  > = {};
  private collapseCooldowns = new Set<string>();
  private collapseCooldownTimeouts: Record<
    string,
    ReturnType<typeof setTimeout>
  > = {};

  subscribe = (callback: Subscriber) => {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  };

  getSnapshot = (): ToastStoreState => {
    return this.state;
  };

  // Channel-scoped: each mounted Toaster owns its own config, so two Toasters
  // can no longer clobber each other's visibleToasts/duration/etc.
  setConfig = (config: ToastStoreConfig, channel = DEFAULT_CHANNEL) => {
    this.configByChannel[channel] = config;
  };

  private configFor = (channel: string): ToastStoreConfig =>
    this.configByChannel[channel] ?? {};

  // Channel state is stored sparsely (a channel appears only once it has been
  // used), so always read it through these — never index the record directly.
  // Store-internal/imperative use only; render code reads the snapshot via
  // getChannelExpanded/getChannelOverlay (see those for why).
  isChannelExpanded = (channel = DEFAULT_CHANNEL): boolean =>
    getChannelExpanded(this.state, channel);

  shouldShowOverlayFor = (channel = DEFAULT_CHANNEL): boolean =>
    getChannelOverlay(this.state, channel);

  // Tracks how many Toasters are mounted for a channel. A named channel exists
  // only while at least one is: when the last unmounts, its toasts are dropped
  // (a sheet-scoped toast outliving the sheet is surprising). The default
  // channel keeps its toasts, so unmount/remount of the root Toaster stays
  // back-compatible; its config is still cleared.
  //
  // The clear is deferred by a tick and cancelled if a Toaster for the channel
  // mounts again, because React double-invokes effects in dev StrictMode
  // (mount, cleanup, mount) — a naive cleanup would wipe live toasts.
  registerChannel = (channel: string): (() => void) => {
    const pendingClear = this.clearChannelTimeouts[channel];
    if (pendingClear) {
      clearTimeout(pendingClear);
      delete this.clearChannelTimeouts[channel];
    }
    const mounted = (this.mountedByChannel[channel] ?? 0) + 1;
    this.mountedByChannel[channel] = mounted;
    // The channel is live again, so a future orphaned toast is worth warning
    // about afresh.
    this.warnedUnmountedChannels.delete(channel);

    if (__DEV__ && channel !== DEFAULT_CHANNEL && mounted > 1) {
      console.warn(
        `[sonner-native] Multiple <Toaster id="${channel}" /> are mounted. ` +
          'Toasts sent to this channel will render once per Toaster, and the ' +
          'Toasters will overwrite the config of one another.'
      );
    }

    return () => {
      const remaining = (this.mountedByChannel[channel] ?? 1) - 1;

      if (remaining > 0) {
        this.mountedByChannel[channel] = remaining;
        return;
      }

      // Delete rather than pin at 0, so dynamic channel ids (a Toaster per
      // sheet instance) don't grow the record for the app's lifetime.
      delete this.mountedByChannel[channel];

      this.clearChannelTimeouts[channel] = setTimeout(() => {
        delete this.clearChannelTimeouts[channel];
        if ((this.mountedByChannel[channel] ?? 0) > 0) {
          return;
        }
        this.clearChannel(channel);
      }, 0);
    };
  };

  // A toast addressed to a channel with no mounted Toaster renders nowhere —
  // the usual cause is a typo in `toasterId`. Checked on a later tick, not
  // inline: registerChannel runs in an effect, so a Toaster mounting in the
  // same commit as the toast (opening a sheet that immediately toasts) would
  // otherwise warn spuriously. The toast is kept either way — it renders if a
  // Toaster for the channel mounts before it auto-closes.
  private warnIfChannelUnmounted = (channel: string) => {
    if (!__DEV__ || channel === DEFAULT_CHANNEL) {
      return;
    }
    if ((this.mountedByChannel[channel] ?? 0) > 0) {
      return;
    }
    setTimeout(() => {
      if ((this.mountedByChannel[channel] ?? 0) > 0) {
        return;
      }
      const stillQueued = this.state.toasts.some(
        (currentToast) => channelOf(currentToast) === channel
      );
      if (!stillQueued || this.warnedUnmountedChannels.has(channel)) {
        return;
      }
      this.warnedUnmountedChannels.add(channel);
      console.warn(
        `[sonner-native] A toast was sent to toasterId "${channel}", but no ` +
          `<Toaster id="${channel}" /> is mounted, so it renders nowhere. ` +
          'Check the id for typos, or mount a Toaster for this channel.'
      );
    }, 0);
  };

  // Teardown, not a dismissal: onDismiss/onAutoClose deliberately don't fire.
  // Config is dropped for every channel — including the default one, whose
  // config used to outlive its Toaster. Toasts are dropped for named channels
  // only.
  private clearChannel = (channel: string) => {
    delete this.configByChannel[channel];

    if (channel === DEFAULT_CHANNEL) {
      return;
    }

    // Channel-keyed state goes unconditionally — even a toastless channel may
    // hold a pending hide timeout or stale expansion/overlay entries, and the
    // keys must not accumulate across dynamic channel ids.
    const pendingHide = this.hideOverlayTimeouts[channel];
    if (pendingHide) {
      clearTimeout(pendingHide);
      delete this.hideOverlayTimeouts[channel];
    }
    const pendingCooldown = this.collapseCooldownTimeouts[channel];
    if (pendingCooldown) {
      clearTimeout(pendingCooldown);
      delete this.collapseCooldownTimeouts[channel];
    }
    this.collapseCooldowns.delete(channel);

    const restExpanded = { ...this.state.isExpanded };
    delete restExpanded[channel];
    const restOverlay = { ...this.state.shouldShowOverlay };
    delete restOverlay[channel];

    const remainingToasts: ToastProps[] = [];
    const clearedIds: Array<string | number> = [];
    for (const currentToast of this.state.toasts) {
      if (channelOf(currentToast) === channel) {
        clearedIds.push(currentToast.id);
      } else {
        remainingToasts.push(currentToast);
      }
    }

    if (clearedIds.length === 0) {
      this.state = {
        ...this.state,
        isExpanded: restExpanded,
        shouldShowOverlay: restOverlay,
      };
      this.notify();
      return;
    }

    const updatedIndex = this.cloneIndex();
    const updatedRefs = { ...this.state.toastRefs };
    const updatedHeights = { ...this.state.toastHeights };
    let heightsChanged = false;

    for (const id of clearedIds) {
      this.clearTimer(id);
      updatedIndex.delete(id);
      delete updatedRefs[id];
      if (id in updatedHeights) {
        delete updatedHeights[id];
        heightsChanged = true;
      }
    }

    this.state = {
      ...this.state,
      toasts: remainingToasts,
      toastsById: updatedIndex,
      toastRefs: updatedRefs,
      toastHeights: heightsChanged ? updatedHeights : this.state.toastHeights,
      toastHeightsVersion: heightsChanged
        ? this.state.toastHeightsVersion + 1
        : this.state.toastHeightsVersion,
      isExpanded: restExpanded,
      shouldShowOverlay: restOverlay,
    };

    this.notify();
  };

  private notify = () => {
    this.subscribers.forEach((callback) => callback());
  };

  private cloneIndex = (): Map<string | number, ToastProps> => {
    return new Map(this.state.toastsById);
  };

  private startTimer = ({
    id,
    duration,
    onComplete,
  }: {
    id: string | number;
    duration: number;
    onComplete: () => void;
  }) => {
    this.clearTimer(id);

    // Don't start timer for infinite duration
    if (duration === Infinity) {
      return;
    }

    const timeout = setTimeout(() => {
      onComplete();
      delete this.state.toastTimers[id];
    }, ENTERING_ANIMATION_DURATION + duration);

    this.state.toastTimers[id] = {
      timeout,
      startTime: Date.now(),
      remainingTime: duration,
      isPaused: false,
    };
  };

  private clearTimer = (id: string | number) => {
    const timer = this.state.toastTimers[id];
    if (timer) {
      clearTimeout(timer.timeout);
      delete this.state.toastTimers[id];
    }
  };

  pauseTimer = (id: string | number) => {
    const timer = this.state.toastTimers[id];
    if (timer && !timer.isPaused) {
      clearTimeout(timer.timeout);
      timer.remainingTime =
        timer.remainingTime - (Date.now() - timer.startTime);
      timer.isPaused = true;
    }
  };

  resumeTimer = (id: string | number) => {
    const timer = this.state.toastTimers[id];
    if (!timer || !timer.isPaused) return;

    const toast = this.state.toastsById.get(id);
    if (!toast) return;

    timer.isPaused = false;
    timer.startTime = Date.now();

    timer.timeout = setTimeout(
      () => {
        this.dismissToast(id, 'onAutoClose');
        delete this.state.toastTimers[id];
      },
      Math.max(timer.remainingTime, 1000)
    );
  };

  pauseAllTimers = (channel?: string) => {
    for (const toast of this.state.toastsById.values()) {
      if (channel !== undefined && channelOf(toast) !== channel) {
        continue;
      }
      this.pauseTimer(toast.id);
    }
  };

  resumeAllTimers = (channel?: string) => {
    for (const toast of this.state.toastsById.values()) {
      if (channel !== undefined && channelOf(toast) !== channel) {
        continue;
      }
      this.resumeTimer(toast.id);
    }
  };

  private handlePromise = async (toast: ToastProps) => {
    if (!toast.promiseOptions?.promise) {
      return;
    }

    const { id, promiseOptions } = toast;

    // Check if already resolving
    if (this.promiseResolvers.has(id)) {
      return;
    }

    this.promiseResolvers.set(id, true);

    try {
      const data = await promiseOptions.promise;

      if (!this.state.toastsById.has(id)) return;

      this.addToast({
        title: promiseOptions.success(data) ?? 'Success',
        id,
        toasterId: toast.toasterId,
        variant: 'success',
        promiseOptions: undefined,
        duration: toast.duration,
        styles: promiseOptions.styles?.success,
      });
    } catch (error) {
      if (!this.state.toastsById.has(id)) return;

      this.addToast({
        title:
          typeof promiseOptions.error === 'function'
            ? promiseOptions.error(error)
            : (promiseOptions.error ?? 'Error'),
        id,
        toasterId: toast.toasterId,
        variant: 'error',
        promiseOptions: undefined,
        duration: toast.duration,
        styles: promiseOptions.styles?.error,
      });
    } finally {
      this.promiseResolvers.delete(id);
    }
  };

  addToast = (
    options: Omit<
      ToastProps,
      'id' | 'numberOfToasts' | 'index' | 'orderedToastIds'
    > & {
      id?: string | number;
    }
  ): string | number => {
    const hasValidId =
      typeof options?.id === 'number' ||
      (typeof options?.id === 'string' && options.id.length > 0);

    const id: string | number =
      hasValidId && options.id !== undefined
        ? options.id
        : this.state.toastsCounter;
    const nextCounter = hasValidId
      ? this.state.toastsCounter
      : this.state.toastsCounter + 1;

    const existingToast = this.state.toastsById.get(id);

    // An update that omits toasterId stays in the existing toast's channel
    // (the merge below keeps the field, so the bookkeeping must match) —
    // otherwise the default channel's config would apply and its overlay flag
    // would be stranded on.
    const channel = channelOf({
      toasterId: options.toasterId ?? existingToast?.toasterId,
    });
    const config = this.configFor(channel);

    const duration =
      options.duration ?? config.duration ?? toastDefaultValues.duration;

    const newToast: ToastProps = {
      ...options,
      id,
      variant: options.variant ?? toastDefaultValues.variant,
      duration,
      // These are set by toaster.tsx at render time; defaults here for type satisfaction
      numberOfToasts: 0,
      index: 0,
      orderedToastIds: [],
    };

    const shouldUpdate = existingToast && options?.id !== undefined;

    if (shouldUpdate) {
      const shouldWiggle =
        config.autoWiggleOnUpdate === 'always' ||
        (config.autoWiggleOnUpdate === 'toast-change' &&
          !areToastsEqual(newToast, existingToast));

      if (shouldWiggle && options.id !== undefined) {
        this.wiggleToast(options.id);
      }

      const updatedToasts = this.state.toasts.map((currentToast) => {
        if (currentToast.id === options.id) {
          return {
            ...currentToast,
            ...newToast,
            duration,
            id: options.id,
          };
        }
        return currentToast;
      });

      // Restart the auto-dismiss timer on every non-promise update
      if (!newToast.promiseOptions) {
        this.startTimer({
          id,
          duration,
          onComplete: () => {
            this.dismissToast(id, 'onAutoClose');
          },
        });
      }

      const updatedIndex = this.cloneIndex();
      const updatedEntry = updatedToasts.find((t) => t.id === options.id);
      if (updatedEntry) updatedIndex.set(options.id!, updatedEntry);

      this.state = {
        ...this.state,
        toasts: updatedToasts,
        toastsById: updatedIndex,
        shouldShowOverlay: { ...this.state.shouldShowOverlay, [channel]: true },
      };
    } else {
      const newToasts: ToastProps[] = [...this.state.toasts, newToast];

      const newToastRefs = { ...this.state.toastRefs };
      if (!(newToast.id in newToastRefs)) {
        newToastRefs[newToast.id] = React.createRef<ToastRef>();
      }

      const visibleToasts =
        config.visibleToasts ?? toastDefaultValues.visibleToasts;
      const newIndex = this.cloneIndex();
      newIndex.set(newToast.id, newToast);
      const updatedHeights = { ...this.state.toastHeights };
      let heightsChanged = false;
      // Trim within the channel only — a busy root Toaster must not evict
      // toasts belonging to a sheet Toaster.
      const channelToasts = newToasts.filter(
        (toast) => channelOf(toast) === channel
      );
      if (channelToasts.length > visibleToasts) {
        const removedToast = channelToasts[0];
        if (removedToast) {
          newToasts.splice(newToasts.indexOf(removedToast), 1);
          this.clearTimer(removedToast.id);
          newIndex.delete(removedToast.id);
          delete newToastRefs[removedToast.id];
          if (removedToast.id in updatedHeights) {
            delete updatedHeights[removedToast.id];
            heightsChanged = true;
          }
        }
      }

      this.state = {
        ...this.state,
        toasts: newToasts,
        toastsById: newIndex,
        toastRefs: newToastRefs,
        toastHeights: heightsChanged ? updatedHeights : this.state.toastHeights,
        toastHeightsVersion: heightsChanged
          ? this.state.toastHeightsVersion + 1
          : this.state.toastHeightsVersion,
        toastsCounter: nextCounter,
        shouldShowOverlay: { ...this.state.shouldShowOverlay, [channel]: true },
      };

      // Handle promise if present
      if (newToast.promiseOptions) {
        this.handlePromise(newToast);
      } else {
        // Start timer for regular toasts
        this.startTimer({
          id,
          duration,
          onComplete: () => {
            this.dismissToast(id, 'onAutoClose');
          },
        });
      }
    }

    const pendingHide = this.hideOverlayTimeouts[channel];
    if (pendingHide) {
      clearTimeout(pendingHide);
      delete this.hideOverlayTimeouts[channel];
    }

    this.warnIfChannelUnmounted(channel);

    this.notify();
    return id;
  };

  dismissToast = (
    id: string | number | undefined,
    origin?: 'onDismiss' | 'onAutoClose'
  ): string | number | undefined => {
    if (id == null) {
      this.state.toasts.forEach((currentToast) => {
        this.clearTimer(currentToast.id);
        if (origin === 'onDismiss') {
          currentToast.onDismiss?.(currentToast.id);
        } else {
          currentToast.onAutoClose?.(currentToast.id);
        }
      });

      const channelsWithToasts = new Set(this.state.toasts.map(channelOf));

      this.state = {
        ...this.state,
        toasts: [],
        toastsById: new Map(),
        toastsCounter: 1,
        toastRefs: {},
        toastTimers: {},
        toastHeights: {},
        toastHeightsVersion: this.state.toastHeightsVersion + 1,
        isExpanded: {},
      };
      for (const channel of channelsWithToasts) {
        this.scheduleHideOverlay(channel);
      }
      this.notify();
      return;
    }

    // Clear timer for this specific toast
    this.clearTimer(id);

    const toastForCallback = this.state.toastsById.get(id);

    const filteredToasts = this.state.toasts.filter(
      (currentToast) => currentToast.id !== id
    );

    // Only touch heights (and bump the version) when this toast actually had
    // a height entry — an unconditional bump would re-render every toast at
    // every position through DynamicToastContext.
    const heightsChanged = id in this.state.toastHeights;
    let updatedHeights = this.state.toastHeights;
    if (heightsChanged) {
      updatedHeights = { ...updatedHeights };
      delete updatedHeights[id];
    }

    const updatedRefs = { ...this.state.toastRefs };
    delete updatedRefs[id];

    const channel = toastForCallback
      ? channelOf(toastForCallback)
      : DEFAULT_CHANNEL;
    const remainingInChannel = filteredToasts.filter(
      (currentToast) => channelOf(currentToast) === channel
    );
    const shouldAutoCollapse =
      remainingInChannel.length <= 1 && this.isChannelExpanded(channel);

    const updatedIndex = this.cloneIndex();
    updatedIndex.delete(id);

    this.state = {
      ...this.state,
      toasts: filteredToasts,
      toastsById: updatedIndex,
      toastRefs: updatedRefs,
      toastHeights: updatedHeights,
      toastHeightsVersion: heightsChanged
        ? this.state.toastHeightsVersion + 1
        : this.state.toastHeightsVersion,
      isExpanded: shouldAutoCollapse
        ? { ...this.state.isExpanded, [channel]: false }
        : this.state.isExpanded,
    };

    if (shouldAutoCollapse) {
      this.resumeAllTimers(channel);
    }

    if (origin === 'onDismiss') {
      toastForCallback?.onDismiss?.(id);
    } else {
      toastForCallback?.onAutoClose?.(id);
    }

    // Schedule hiding overlay if no toasts remain in this channel
    if (remainingInChannel.length === 0) {
      this.scheduleHideOverlay(channel);
    }

    this.notify();
    return id;
  };

  private scheduleHideOverlay = (channel = DEFAULT_CHANNEL) => {
    const pending = this.hideOverlayTimeouts[channel];
    if (pending) {
      clearTimeout(pending);
    }

    // Wait for animation to finish before hiding overlay
    this.hideOverlayTimeouts[channel] = setTimeout(() => {
      this.state = {
        ...this.state,
        shouldShowOverlay: {
          ...this.state.shouldShowOverlay,
          [channel]: false,
        },
      };
      delete this.hideOverlayTimeouts[channel];
      this.notify();
    }, ENTERING_ANIMATION_DURATION);
  };

  wiggleToast = (id: string | number) => {
    const toast = this.state.toastsById.get(id);
    if (!toast) {
      return;
    }

    // Trigger the wiggle animation via the ref
    const toastRef = this.state.toastRefs[id];
    if (toastRef && toastRef.current) {
      toastRef.current.wiggle();
    }

    // Reset timer on wiggle (but not for Infinity duration or promise toasts)
    if (toast.duration !== Infinity && !toast.promiseOptions) {
      this.startTimer({
        id,
        duration:
          toast.duration ??
          this.configFor(channelOf(toast)).duration ??
          toastDefaultValues.duration,
        onComplete: () => {
          this.dismissToast(id, 'onAutoClose');
        },
      });
    }
  };

  getToastRef = (
    id: string | number
  ): React.RefObject<ToastRef | null> | undefined => {
    return this.state.toastRefs[id];
  };

  setToastHeight = (id: string | number, height: number) => {
    if (this.state.toastHeights[id] === height) return;
    this.state = {
      ...this.state,
      toastHeights: {
        ...this.state.toastHeights,
        [id]: height,
      },
      toastHeightsVersion: this.state.toastHeightsVersion + 1,
    };
    this.notify();
  };

  expand = (channel = DEFAULT_CHANNEL) => {
    this.state = {
      ...this.state,
      isExpanded: { ...this.state.isExpanded, [channel]: true },
    };
    // Pause this channel's timers when expanded
    this.pauseAllTimers(channel);
    this.notify();
  };

  collapse = (channel = DEFAULT_CHANNEL) => {
    this.state = {
      ...this.state,
      isExpanded: { ...this.state.isExpanded, [channel]: false },
    };
    // Prevent immediate re-expansion — flag clears after timeout. Scoped to
    // the channel: collapsing the sheet's stack must not swallow an expand
    // tap on the root stack.
    this.collapseCooldowns.add(channel);
    const pendingCooldown = this.collapseCooldownTimeouts[channel];
    if (pendingCooldown) {
      clearTimeout(pendingCooldown);
    }
    this.collapseCooldownTimeouts[channel] = setTimeout(() => {
      this.collapseCooldowns.delete(channel);
      delete this.collapseCooldownTimeouts[channel];
    }, 100);
    // Resume this channel's timers when collapsed
    this.resumeAllTimers(channel);
    this.notify();
  };

  toggleExpand = (channel = DEFAULT_CHANNEL) => {
    const isExpanded = this.isChannelExpanded(channel);
    if (!isExpanded && this.collapseCooldowns.has(channel)) {
      return;
    }

    if (isExpanded) {
      this.collapse(channel);
    } else {
      this.expand(channel);
    }
  };
}

export const toastStore = new ToastStore();
