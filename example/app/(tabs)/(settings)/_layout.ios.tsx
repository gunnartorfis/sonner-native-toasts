import * as React from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { isLiquidGlassAvailable } from 'expo-glass-effect';

const SettingsLayout: React.FC = () => {
  const rawTheme = useColorScheme();
  const theme = rawTheme === 'dark' ? 'dark' : 'light';
  const isGlassAvailable = isLiquidGlassAvailable();
  const blurEffect =
    theme === 'dark' ? 'systemMaterialDark' : 'systemMaterialLight';

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLargeTitle: true,
        headerTransparent: true,
        headerTintColor: theme === 'dark' ? 'white' : 'black',
        headerLargeStyle: { backgroundColor: 'transparent' },
        headerBlurEffect: isGlassAvailable ? undefined : blurEffect,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
        }}
      />
    </Stack>
  );
};

export default SettingsLayout;
