import { useGlobalSearchParams, useRouter } from 'expo-router';
import {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import {
  type AutoWiggle,
  type ToastAnimation,
  type ToastPosition,
  type ToastSwipeDirection,
  type ToastTheme,
} from 'sonner-native';

export type ToasterAnimationKey = 'default' | 'fade' | 'slide';

export const TOASTER_ANIMATION_KEYS: ToasterAnimationKey[] = [
  'default',
  'fade',
  'slide',
];

// `undefined` means "don't pass an `animation` prop to the Toaster" — i.e.
// fall through to the library default. The named entries showcase the new
// `animation` prop with concrete Reanimated builders.
export const TOASTER_ANIMATION_PRESETS: Record<
  ToasterAnimationKey,
  ToastAnimation | undefined
> = {
  default: undefined,
  fade: {
    enter: FadeIn.duration(300),
    exit: FadeOut.duration(200),
  },
  slide: {
    enter: SlideInDown.duration(400),
    exit: SlideOutDown.duration(300),
  },
};

function parseAnimationKey(value: string | undefined): ToasterAnimationKey {
  if (value === 'default' || value === 'fade' || value === 'slide') {
    return value;
  }
  return 'fade';
}

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
    gap?: string;
    animation?: string;
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
  const gap = params.gap ? parseInt(params.gap, 10) : undefined;
  const animationKey = parseAnimationKey(params.animation);
  const animation = TOASTER_ANIMATION_PRESETS[animationKey];

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
    gap,
    animationKey,
    animation,
    setParam,
  };
}
