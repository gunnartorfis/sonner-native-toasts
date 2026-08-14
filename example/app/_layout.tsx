import * as React from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { useToasterParams } from '../hooks/useToasterParams';

const HeaderLink: React.FC<{ label: string; onPress: () => void }> = ({
  label,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text
        style={{
          color: colorScheme === 'dark' ? '#0A84FF' : '#007AFF',
          fontSize: 17,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const RootLayout: React.FC = () => {
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
    animation,
    allowFontScaling,
    maxFontSizeMultiplier,
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
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <HeaderLink
                    label="Channels"
                    onPress={() => router.push('/multiple-toasters')}
                  />
                  <HeaderLink
                    label="Modal"
                    onPress={() => router.push('/modal')}
                  />
                </View>
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
          <Stack.Screen
            name="multiple-toasters"
            options={{ title: 'Multiple toasters' }}
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
          animation={animation}
          allowFontScaling={allowFontScaling}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
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
