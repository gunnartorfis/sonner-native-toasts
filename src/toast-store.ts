import * as React from 'react';
import { ANIMATION_DURATION } from './animations';
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
  toastsCounter: number;
  toastRefs: Record<string | number, React.RefObject<ToastRef>>;
  shouldShowOverlay: boolean;
  toastTimers: Record<string | number, ToastTimer>;
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
    toastsCounter: 1,
    toastRefs: {},
    shouldShowOverlay: false,
    toastTimers: {},
  };

  private subscribers = new Set<Subscriber>();
  private config: ToastStoreConfig = {};
  private hideOverlayTimeout: ReturnType<typeof setTimeout> | null = null;
  private promiseResolvers = new Map<string | number, boolean>();

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

    // Clear existing timer if any
    this.clearTimer(id);

    const timeout = setTimeout(() => {
      onComplete();
      delete this.state.toastTimers[id];
    }, ANIMATION_DURATION + duration);

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
    const toast = this.state.toasts.find((t) => t.id === id);

    if (timer && timer.isPaused && toast) {
      timer.isPaused = false;
      timer.startTime = Date.now();

      timer.timeout = setTimeout(
        () => {
          toast.onAutoClose?.(id);
          this.dismissToast(id, 'onAutoClose');
          delete this.state.toastTimers[id];
        },
        Math.max(timer.remainingTime, 1000)
      ); // minimum 1 second
    }
  };

  pauseAllTimers = () => {
    Object.keys(this.state.toastTimers).forEach((id) => {
      this.pauseTimer(id);
    });
  };

  resumeAllTimers = () => {
    Object.keys(this.state.toastTimers).forEach((id) => {
      this.resumeTimer(id);
    });
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

      // Update the toast with success
      this.addToast({
        title: promiseOptions.success(data) ?? 'Success',
        id,
        variant: 'success',
        promiseOptions: undefined,
        duration: toast.duration,
      });
    } catch (error) {
      // Update the toast with error
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
    options: Omit<ToastProps, 'id'> & { id?: string | number }
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
    };

    const existingToast = this.state.toasts.find(
      (currentToast) => currentToast.id === newToast.id
    );

    const shouldUpdate = existingToast && options?.id;

    if (shouldUpdate) {
      const shouldWiggle =
        this.config.autoWiggleOnUpdate === 'always' ||
        (this.config.autoWiggleOnUpdate === 'toast-change' &&
          !areToastsEqual(newToast, existingToast));

      if (shouldWiggle && options.id) {
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
            newToast.onAutoClose?.(id);
            this.dismissToast(id, 'onAutoClose');
          },
        });
      }

      this.state = {
        ...this.state,
        toasts: updatedToasts,
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
      if (newToasts.length > visibleToasts) {
        const removedToast = newToasts.shift();
        if (removedToast) {
          this.clearTimer(removedToast.id);
        }
      }

      this.state = {
        ...this.state,
        toasts: newToasts,
        toastRefs: newToastRefs,
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
            newToast.onAutoClose?.(id);
            this.dismissToast(id, 'onAutoClose');
          },
        });
      }
    }

    // Show overlay when toasts are added
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
    if (!id) {
      // Clear all timers
      Object.keys(this.state.toastTimers).forEach((timerId) => {
        this.clearTimer(timerId);
      });

      this.state.toasts.forEach((currentToast) => {
        if (origin === 'onDismiss') {
          currentToast.onDismiss?.(currentToast.id);
        } else {
          currentToast.onAutoClose?.(currentToast.id);
        }
      });

      this.state = {
        ...this.state,
        toasts: [],
        toastsCounter: 1,
        toastTimers: {},
      };
      this.scheduleHideOverlay();
      this.notify();
      return;
    }

    // Clear timer for this specific toast
    this.clearTimer(id);

    const toastForCallback = this.state.toasts.find(
      (currentToast) => currentToast.id === id
    );

    const filteredToasts = this.state.toasts.filter(
      (currentToast) => currentToast.id !== id
    );

    this.state = {
      ...this.state,
      toasts: filteredToasts,
    };

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
    }, ANIMATION_DURATION);
  };

  wiggleToast = (id: string | number) => {
    const toast = this.state.toasts.find((t) => t.id === id);
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
          toast.onAutoClose?.(id);
          this.dismissToast(id, 'onAutoClose');
        },
      });
    }
  };

  getToastRef = (
    id: string | number
  ): React.RefObject<ToastRef> | undefined => {
    return this.state.toastRefs[id];
  };
}

export const toastStore = new ToastStore();
