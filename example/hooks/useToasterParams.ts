import { useGlobalSearchParams, useRouter } from 'expo-router';
import {
  type AutoWiggle,
  type ToastPosition,
  type ToastSwipeDirection,
  type ToastTheme,
} from 'sonner-native';

export function useToasterParams() {
  const router = useRouter();
  const params = useGlobalSearchParams<{
    stacking?: string;
    position?: string;
    theme?: string;
    swipeDirection?: string;
    closeButton?: string;
    visibleToasts?: string;
    autoWiggle?: string;
    richColors?: string;
    invert?: string;
  }>();

  const position = (params.position as ToastPosition) || 'top-center';
  const stackingEnabled = params.stacking !== 'false';
  const theme = (params.theme as ToastTheme) || 'system';
  const swipeDirection =
    (params.swipeDirection as ToastSwipeDirection) || 'up';
  const closeButton = params.closeButton !== 'false';
  const visibleToasts = parseInt(params.visibleToasts || '4', 10);
  const autoWiggle = (params.autoWiggle as AutoWiggle) || 'toast-change';
  const richColors = params.richColors === 'true';
  const invert = params.invert === 'true';

  const setParam = (key: string, value: string) => {
    router.setParams({ [key]: value });
  };

  return {
    position,
    stackingEnabled,
    theme,
    swipeDirection,
    closeButton,
    visibleToasts,
    autoWiggle,
    richColors,
    invert,
    setParam,
  };
}
