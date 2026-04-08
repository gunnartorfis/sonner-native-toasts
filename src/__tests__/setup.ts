import 'react-native-gesture-handler/jestSetup';

type MockComponentProps = { children?: React.ReactNode };

// Mock react-native first
jest.mock('react-native', () => {
  // Create a basic View component for testing
  const View = (props: MockComponentProps) => props.children;
  const Text = (props: MockComponentProps) => props.children;
  const Pressable = (props: MockComponentProps) => props.children;
  const ActivityIndicator = () => null;

  return {
    Platform: { OS: 'ios', select: jest.fn() },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    View,
    Text,
    Pressable,
    ActivityIndicator,
    StyleSheet: {
      create: <T extends Record<string, unknown>>(styles: T): T => styles,
      flatten: <T>(style: T): T => style,
    },
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  // Use the mocked View from react-native
  const View = (props: MockComponentProps) => props.children;
  return {
    default: {
      View: View,
      createAnimatedComponent: (component: React.ComponentType) => component,
      interpolate: jest.fn(),
      withTiming: jest.fn((value) => value),
      withRepeat: jest.fn((value) => value),
      useDerivedValue: jest.fn((fn) => ({ value: fn() })),
      useSharedValue: jest.fn((value) => ({ value })),
      useAnimatedStyle: jest.fn((fn) => fn()),
      runOnJS: jest.fn((fn) => fn),
      Easing: {
        inOut: jest.fn(),
        ease: jest.fn(),
        elastic: jest.fn(),
        bezier: jest.fn(() => jest.fn()),
        bezierFn: jest.fn(() => jest.fn()),
      },
      LinearTransition: {
        easing: jest.fn(),
      },
    },
    Easing: {
      inOut: jest.fn(),
      ease: jest.fn(),
      elastic: jest.fn(),
      bezier: jest.fn(() => jest.fn()),
      bezierFn: jest.fn(() => jest.fn()),
    },
    withTiming: jest.fn((value) => value),
    withRepeat: jest.fn((value) => value),
    useDerivedValue: jest.fn((fn) => ({ value: fn() })),
    useSharedValue: jest.fn((value) => ({ value })),
    useAnimatedStyle: jest.fn((fn) => fn()),
    runOnJS: jest.fn((fn) => fn),
    LinearTransition: {
      easing: jest.fn(),
    },
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Pan: jest.fn(() => ({
      onBegin: jest.fn(() => ({})),
      onChange: jest.fn(() => ({})),
      onFinalize: jest.fn(() => ({})),
    })),
    Tap: jest.fn(() => ({
      onEnd: jest.fn(() => ({})),
    })),
    Race: jest.fn(),
  },
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock console to avoid unnecessary noise in tests
global.console = {
  ...console,
  // Comment out any methods you want to keep in tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup fake timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
});

// Dummy test to prevent "must contain at least one test" error
describe('setup', () => {
  it('should setup test environment', () => {
    expect(true).toBe(true);
  });
});
