import * as React from 'react';
import { Stack } from 'expo-router';

const HomeLayout: React.FC = () => {
  return <Stack screenOptions={{ headerShown: false }} />;
};

export default HomeLayout;
