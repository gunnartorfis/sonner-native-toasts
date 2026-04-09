import * as React from 'react';
import { useRouter } from 'expo-router';
import { Host, Button, Column, Text as ComposeText } from '@expo/ui/jetpack-compose';
import { paddingAll, fillMaxSize } from '@expo/ui/jetpack-compose/modifiers';

const SettingsScreen: React.FC = () => {
  const router = useRouter();

  return (
    <Host style={{ flex: 1 }}>
      <Column modifiers={[fillMaxSize(), paddingAll(16)]}>
        <Button onClick={() => router.push('/modal')}>
          <ComposeText>Open Modal</ComposeText>
        </Button>
      </Column>
    </Host>
  );
};

export default SettingsScreen;
