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
    useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
    View,
    Text,
    Pressable,
    ActivityIndicator,
    StyleSheet: {
      create: <T extends Record<string, unknown>>(styles: T): T => styles,
      flatten: <T>(style: T): T => style,
    },
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
    useColorScheme: jest.fn(() => 'light'),
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  // Use the mocked View from react-native
  const View = (props: MockComponentProps) => props.children;
  const sharedMock = {
    View,
    createAnimatedComponent: (component: React.ComponentType) => component,
    interpolate: jest.fn(() => 1),
    withTiming: jest.fn((value: unknown) => value),
    withRepeat: jest.fn((value: unknown) => value),
    useDerivedValue: jest.fn((fn: () => unknown) => ({ value: fn() })),
    useSharedValue: jest.fn((value: unknown) => ({ value })),
    useAnimatedStyle: jest.fn((fn: () => unknown) => fn()),
    useReducedMotion: jest.fn(() => false),
    runOnJS: jest.fn((fn: unknown) => fn),
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
  };
  return {
    __esModule: true,
    default: sharedMock,
    ...sharedMock,
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const defaultInsets = { top: 44, bottom: 34, left: 0, right: 0 };
  const SafeAreaInsetsContext = React.createContext(defaultInsets);
  return {
    useSafeAreaInsets: () => defaultInsets,
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaInsetsContext,
    initialWindowMetrics: {
      insets: defaultInsets,
      frame: { x: 0, y: 0, width: 375, height: 812 },
    },
  };
});

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  __esModule: true,
  FullWindowOverlay: ({ children }: { children?: React.ReactNode }) => children,
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const Passthrough = ({ children }: { children?: React.ReactNode }) => children ?? null;
  return {
    __esModule: true,
    default: Passthrough,
    Svg: Passthrough,
    Path: Passthrough,
    Circle: Passthrough,
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const createChainablePanMock = () => {
    const mock: Record<string, jest.Mock> = {};
    const chainable = (name: string) => {
      mock[name] = jest.fn(() => mock);
    };
    chainable('onBegin');
    chainable('onChange');
    chainable('onFinalize');
    chainable('onEnd');
    chainable('onStart');
    chainable('onUpdate');
    chainable('enabled');
    chainable('activeOffsetX');
    chainable('activeOffsetY');
    chainable('failOffsetX');
    chainable('failOffsetY');
    chainable('minDistance');
    return mock;
  };

  const createChainableTapMock = () => {
    const mock: Record<string, jest.Mock> = {};
    const chainable = (name: string) => {
      mock[name] = jest.fn(() => mock);
    };
    chainable('onEnd');
    chainable('onStart');
    chainable('onBegin');
    chainable('onFinalize');
    chainable('enabled');
    chainable('maxDuration');
    chainable('numberOfTaps');
    return mock;
  };

  return {
    Gesture: {
      Pan: jest.fn(() => createChainablePanMock()),
      Tap: jest.fn(() => createChainableTapMock()),
      Race: jest.fn(),
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  };
});

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
