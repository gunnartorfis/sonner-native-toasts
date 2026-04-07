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
  shouldShowOverlay: boolean;
  toastTimers: Record<string | number, ToastTimer>;
  toastHeights: Record<string | number, number>;
  toastHeightsVersion: number;
  isExpanded: boolean;
};

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
    shouldShowOverlay: false,
    toastTimers: {},
    toastHeights: {},
    toastHeightsVersion: 0,
    isExpanded: false,
  };

  private subscribers = new Set<Subscriber>();
  private config: ToastStoreConfig = {};
  private hideOverlayTimeout: ReturnType<typeof setTimeout> | null = null;
  private promiseResolvers = new Map<string | number, boolean>();
  private collapseCooldown = false;
  private collapseCooldownTimeout: ReturnType<typeof setTimeout> | null = null;

  subscribe = (callback: Subscriber) => {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  };

  getSnapshot = (): ToastStoreState => {
    return this.state;
  };

  setConfig = (config: ToastStoreConfig) => {
    this.config = config;
  };

  private notify = () => {
    this.subscribers.forEach((callback) => callback());
  };

  private rebuildIndex = (toasts: ToastProps[]): Map<string | number, ToastProps> => {
    const map = new Map<string | number, ToastProps>();
    for (const toast of toasts) {
      map.set(toast.id, toast);
    }
    return map;
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
    // Don't start timer for infinite duration
    if (duration === Infinity) {
      return;
    }

    this.clearTimer(id);

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

  pauseAllTimers = () => {
    for (const toast of this.state.toastsById.values()) {
      this.pauseTimer(toast.id);
    }
  };

  resumeAllTimers = () => {
    for (const toast of this.state.toastsById.values()) {
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
        variant: 'success',
        promiseOptions: undefined,
        duration: toast.duration,
      });
    } catch (error) {
      if (!this.state.toastsById.has(id)) return;

      this.addToast({
        title:
          typeof promiseOptions.error === 'function'
            ? promiseOptions.error(error)
            : (promiseOptions.error ?? 'Error'),
        id,
        variant: 'error',
        promiseOptions: undefined,
        duration: toast.duration,
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

    const duration =
      options.duration ?? this.config.duration ?? toastDefaultValues.duration;

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

    const existingToast = this.state.toastsById.get(newToast.id);

    const shouldUpdate = existingToast && options?.id !== undefined;

    if (shouldUpdate) {
      const shouldWiggle =
        this.config.autoWiggleOnUpdate === 'always' ||
        (this.config.autoWiggleOnUpdate === 'toast-change' &&
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

      // Restart timer if duration changed
      if (!newToast.promiseOptions) {
        this.startTimer({
          id,
          duration,
          onComplete: () => {
            this.dismissToast(id, 'onAutoClose');
          },
        });
      }

      this.state = {
        ...this.state,
        toasts: updatedToasts,
        toastsById: this.rebuildIndex(updatedToasts),
        shouldShowOverlay: true,
      };
    } else {
      const newToasts: ToastProps[] = [...this.state.toasts, newToast];

      const newToastRefs = { ...this.state.toastRefs };
      if (!(newToast.id in newToastRefs)) {
        newToastRefs[newToast.id] = React.createRef<ToastRef>();
      }

      const visibleToasts =
        this.config.visibleToasts ?? toastDefaultValues.visibleToasts;
      const updatedHeights = { ...this.state.toastHeights };
      let heightsChanged = false;
      if (newToasts.length > visibleToasts) {
        const removedToast = newToasts.shift();
        if (removedToast) {
          this.clearTimer(removedToast.id);
          if (removedToast.id in updatedHeights) {
            delete updatedHeights[removedToast.id];
            heightsChanged = true;
          }
        }
      }

      this.state = {
        ...this.state,
        toasts: newToasts,
        toastsById: this.rebuildIndex(newToasts),
        toastRefs: newToastRefs,
        toastHeights: heightsChanged ? updatedHeights : this.state.toastHeights,
        toastHeightsVersion: heightsChanged
          ? this.state.toastHeightsVersion + 1
          : this.state.toastHeightsVersion,
        toastsCounter: nextCounter,
        shouldShowOverlay: true,
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

    if (this.hideOverlayTimeout) {
      clearTimeout(this.hideOverlayTimeout);
      this.hideOverlayTimeout = null;
    }

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

      this.state = {
        ...this.state,
        toasts: [],
        toastsById: new Map(),
        toastsCounter: 1,
        toastTimers: {},
        toastHeights: {},
        toastHeightsVersion: this.state.toastHeightsVersion + 1,
        isExpanded: false,
      };
      this.scheduleHideOverlay();
      this.notify();
      return;
    }

    // Clear timer for this specific toast
    this.clearTimer(id);

    const toastForCallback = this.state.toastsById.get(id);

    const filteredToasts = this.state.toasts.filter(
      (currentToast) => currentToast.id !== id
    );

    const updatedHeights = { ...this.state.toastHeights };
    delete updatedHeights[id];

    const shouldAutoCollapse =
      filteredToasts.length <= 1 && this.state.isExpanded;

    this.state = {
      ...this.state,
      toasts: filteredToasts,
      toastsById: this.rebuildIndex(filteredToasts),
      toastHeights: updatedHeights,
      toastHeightsVersion: this.state.toastHeightsVersion + 1,
      isExpanded: shouldAutoCollapse ? false : this.state.isExpanded,
    };

    if (shouldAutoCollapse) {
      this.resumeAllTimers();
    }

    if (origin === 'onDismiss') {
      toastForCallback?.onDismiss?.(id);
    } else {
      toastForCallback?.onAutoClose?.(id);
    }

    // Schedule hiding overlay if no toasts remain
    if (filteredToasts.length === 0) {
      this.scheduleHideOverlay();
    }

    this.notify();
    return id;
  };

  private scheduleHideOverlay = () => {
    if (this.hideOverlayTimeout) {
      clearTimeout(this.hideOverlayTimeout);
    }

    // Wait for animation to finish before hiding overlay
    this.hideOverlayTimeout = setTimeout(() => {
      this.state = {
        ...this.state,
        shouldShowOverlay: false,
      };
      this.hideOverlayTimeout = null;
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
          toast.duration ?? this.config.duration ?? toastDefaultValues.duration,
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

  expand = () => {
    this.state = {
      ...this.state,
      isExpanded: true,
    };
    // Pause all timers when expanded
    this.pauseAllTimers();
    this.notify();
  };

  collapse = () => {
    this.state = {
      ...this.state,
      isExpanded: false,
    };
    // Prevent immediate re-expansion — flag clears after timeout
    this.collapseCooldown = true;
    if (this.collapseCooldownTimeout) {
      clearTimeout(this.collapseCooldownTimeout);
    }
    this.collapseCooldownTimeout = setTimeout(() => {
      this.collapseCooldown = false;
      this.collapseCooldownTimeout = null;
    }, 100);
    // Resume all timers when collapsed
    this.resumeAllTimers();
    this.notify();
  };

  toggleExpand = () => {
    if (!this.state.isExpanded && this.collapseCooldown) {
      return;
    }

    if (this.state.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  };
}

export const toastStore = new ToastStore();
