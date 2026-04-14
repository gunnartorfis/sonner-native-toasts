import * as React from 'react';
import { Stack } from 'expo-router';

const SettingsLayout: React.FC = () => {
  return (
    <Stack screenOptions={{ headerShown: true }}>
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
