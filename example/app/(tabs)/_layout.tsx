import * as React from 'react';
import { useColorScheme } from 'react-native';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

const TabsLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const blurEffect = colorScheme === 'dark' ? 'systemMaterialDark' : 'systemMaterialLight';

  return (
    <NativeTabs blurEffect={blurEffect}>
      <NativeTabs.Trigger name="(home)">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(settings)">
        <Icon sf="gear" drawable="custom_settings_drawable" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
