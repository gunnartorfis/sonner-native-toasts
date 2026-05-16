import * as React from 'react';
import { Pressable, Text, useColorScheme } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { useToasterParams } from '../hooks/useToasterParams';

const RootLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const {
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
  } = useToasterParams();

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
          swipeToDismissDirection={swipeDirection}
          visibleToasts={visibleToasts}
          closeButton={closeButton}
          autoWiggleOnUpdate={autoWiggle}
          theme={theme}
          enableStacking={stackingEnabled}
          richColors={richColors}
          invert={invert}
          gap={gap}
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
