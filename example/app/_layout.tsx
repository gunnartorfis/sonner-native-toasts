import * as React from 'react';
import { Pressable, Text, useColorScheme } from 'react-native';
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Toaster,
  type AutoWiggle,
  type ToastPosition,
  type ToastSwipeDirection,
  type ToastTheme,
} from 'sonner-native';

const RootLayout: React.FC = () => {
  const colorScheme = useColorScheme();
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

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: 'Toasts',
              headerRight: () => (
                <Pressable
                  onPress={() => router.push('/modal')}
                  hitSlop={8}
                >
                  <Text
                    style={{
                      color:
                        colorScheme === 'dark' ? '#0A84FF' : '#007AFF',
                      fontSize: 17,
                    }}
                  >
                    Modal
                  </Text>
                </Pressable>
              ),
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Modal',
            }}
          />
        </Stack>
        <Toaster
          position={position}
          duration={30000}
          swipeToDismissDirection={swipeDirection}
          visibleToasts={visibleToasts}
          closeButton={closeButton}
          autoWiggleOnUpdate={autoWiggle}
          theme={theme}
          enableStacking={stackingEnabled}
          richColors={richColors}
          invert={invert}
          icons={{
            error: <Text>💥</Text>,
            loading: <Text>🔄</Text>,
          }}
          toastOptions={{
            actionButtonStyle: {
              paddingHorizontal: 20,
            },
          }}
          pauseWhenPageIsHidden
        />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default RootLayout;
