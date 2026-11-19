import { act } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { ReactTestInstance } from 'react-test-renderer';
import { toast } from '../toast-fns';
import { ToastContent } from '../toast-content';
import { Toaster } from '../toaster';
import { createToasterHarness, resetToastStore } from './test-utils';

// The wrappers around a toast span the full screen width while the toast is
// often narrower, so every one of them must let touches beside the toast reach
// the app underneath. The mocks render views as bare children, so this reads
// each view's props from the test tree rather than from native output.

type Style = Record<string, unknown> | Style[] | false | null | undefined;

const flattenStyle = (style: Style): Record<string, unknown> => {
  if (!style) return {};
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flattenStyle));
  }
  return style;
};

const isView = (node: ReactTestInstance) =>
  node.type === View || node.type === Animated.View;

// Every View/Animated.View from `start` (exclusive) up to the root.
const viewAncestors = (start: ReactTestInstance) => {
  const views: ReactTestInstance[] = [];
  for (let node = start.parent; node; node = node.parent) {
    if (isView(node)) views.push(node);
  }
  return views;
};

const pointerEventsOf = (node: ReactTestInstance) =>
  flattenStyle(node.props.style).pointerEvents ?? node.props.pointerEvents;

const CustomToast = () => null;

describe('toast wrapper pointer events', () => {
  const { render, cleanup } = createToasterHarness();

  beforeEach(() => {
    resetToastStore();
    jest.clearAllTimers();
  });
  afterEach(cleanup);

  it('lets touches beside a custom toast pass through every wrapper', () => {
    const renderer = render(<Toaster />);
    act(() => {
      toast.custom(<CustomToast />);
    });

    const content = renderer.root.findByType(CustomToast);
    const wrappers = viewAncestors(content);

    expect(wrappers.length).toBeGreaterThan(0);
    for (const wrapper of wrappers) {
      expect(pointerEventsOf(wrapper)).toBe('box-none');
    }
  });

  it('keeps the default toast itself touchable while its wrappers pass through', () => {
    const renderer = render(<Toaster />);
    act(() => {
      toast('Hello');
    });

    const content = renderer.root.findByType(ToastContent);
    const [toastBody, ...wrappers] = viewAncestors(content);

    expect(toastBody).toBeDefined();
    expect(pointerEventsOf(toastBody!)).toBeUndefined();
    expect(wrappers.length).toBeGreaterThan(0);
    for (const wrapper of wrappers) {
      expect(pointerEventsOf(wrapper)).toBe('box-none');
    }
  });
});
