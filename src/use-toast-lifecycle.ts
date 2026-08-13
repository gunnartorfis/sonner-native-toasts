import * as React from 'react';
import type { View } from 'react-native';
import { useToastContext } from './context';
import { toastStore } from './toast-store';
import type { ToastProps } from './types';
import { useAppStateListener } from './use-app-state';

export type MeasurableToastRef = React.RefObject<
  (View & { getBoundingClientRect?: () => DOMRect }) | null
>;

// Per-toast wiring that doesn't render anything: timer pause/resume on app
// background/foreground, and reporting the measured height to the store.
export const useToastLifecycle = ({
  id,
  toastRef,
  variant,
  title,
  description,
  jsx,
}: {
  id: ToastProps['id'];
  toastRef: MeasurableToastRef;
  variant: ToastProps['variant'];
  title: string;
  description?: string;
  jsx?: React.ReactNode;
}) => {
  const { pauseWhenPageIsHidden } = useToastContext();

  const onBackground = React.useCallback(() => {
    if (!pauseWhenPageIsHidden) {
      return;
    }
    toastStore.pauseTimer(id);
  }, [pauseWhenPageIsHidden, id]);

  const onForeground = React.useCallback(() => {
    if (!pauseWhenPageIsHidden) {
      return;
    }
    toastStore.resumeTimer(id);
  }, [pauseWhenPageIsHidden, id]);

  useAppStateListener({
    onBackground,
    onForeground,
  });

  // Synchronous layout read via getBoundingClientRect when available
  // (refs are ReactNativeElement by default from RN 0.83). Older New Arch
  // versions (e.g. RN 0.81/Expo SDK 54) don't expose it on refs, so fall
  // back to async measureInWindow.
  React.useLayoutEffect(() => {
    if (!toastRef.current) {
      return;
    }
    if (typeof toastRef.current.getBoundingClientRect === 'function') {
      const { height } = toastRef.current.getBoundingClientRect();
      toastStore.setToastHeight(id, height);
      return;
    }
    let stale = false;
    toastRef.current.measureInWindow((_x, _y, _w, height) => {
      if (!stale) {
        toastStore.setToastHeight(id, height);
      }
    });
    return () => {
      stale = true;
    };
    // Content-affecting fields are deps so the toast re-measures on change.
  }, [toastRef, id, variant, title, description, jsx]);
};
