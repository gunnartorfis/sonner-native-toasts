import { act } from 'react';
import { Platform } from 'react-native';
import { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import TestRenderer from 'react-test-renderer';
import { Toaster } from '../toaster';
import { toast } from '../toast-fns';
import { cleanupToasterRenderers, resetToastStore } from './test-utils';

// Reanimated warns in dev when a dependency array is passed on native, where
// it is ignored. Dependencies must only be forwarded on web.
describe('Reanimated hook dependencies', () => {
  const renderers: TestRenderer.ReactTestRenderer[] = [];
  const originalOS = Platform.OS;

  const renderToast = () => {
    act(() => {
      renderers.push(TestRenderer.create(<Toaster />));
    });
    act(() => {
      toast('Hello');
    });
  };

  const depsArgs = () =>
    [
      ...jest.mocked(useDerivedValue).mock.calls,
      ...jest.mocked(useAnimatedStyle).mock.calls,
    ].map((call) => call[1]);

  beforeEach(() => {
    resetToastStore();
    jest.mocked(useDerivedValue).mockClear();
    jest.mocked(useAnimatedStyle).mockClear();
  });
  afterEach(() => {
    cleanupToasterRenderers(renderers);
    Platform.OS = originalOS;
  });

  it.each(['ios', 'android'] as const)(
    'does not pass dependencies on %s',
    (os) => {
      Platform.OS = os;
      renderToast();

      const deps = depsArgs();
      expect(deps.length).toBeGreaterThan(0);
      expect(deps.every((d) => d === undefined)).toBe(true);
    }
  );

  it('passes dependencies on web', () => {
    Platform.OS = 'web';
    renderToast();

    const deps = depsArgs();
    expect(deps.length).toBeGreaterThan(0);
    expect(deps.every(Array.isArray)).toBe(true);
  });
});
