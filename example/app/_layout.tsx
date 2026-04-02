import * as React from 'react';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster, type ToastPosition } from 'sonner-native';

const RootLayout: React.FC = () => {
  const params = useGlobalSearchParams<{
    stacking?: string;
    position?: string;
  }>();

  const stackingEnabled = params.stacking !== 'false';
  const defaultPosition = (params.position as ToastPosition) || 'top-center';

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          {/* Tabs group - all tab screens are handled in (tabs)/_layout.tsx */}
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          {/* Modal screens outside of tabs */}
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
          position={defaultPosition}
          duration={30000}
          swipeToDismissDirection="up"
          visibleToasts={4}
          closeButton
          autoWiggleOnUpdate="toast-change"
          theme="system"
          enableStacking={stackingEnabled}
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
