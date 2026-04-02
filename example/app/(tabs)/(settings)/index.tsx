import * as React from 'react';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Host, Form, Section, Switch, Picker, Button } from '@expo/ui/swift-ui';
import type { ToastPosition } from 'sonner-native';

const POSITION_OPTIONS: ToastPosition[] = [
  'top-center',
  'center',
  'bottom-center',
];

const POSITION_LABELS: Record<ToastPosition, string> = {
  'top-center': 'Top Center',
  'center': 'Center',
  'bottom-center': 'Bottom Center',
};

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const params = useGlobalSearchParams<{
    stacking?: string;
    position?: string;
  }>();

  const stackingEnabled = params.stacking !== 'false';
  const defaultPosition = (params.position as ToastPosition) || 'top-center';

  const selectedIndex = POSITION_OPTIONS.indexOf(defaultPosition);
  const positionLabels = POSITION_OPTIONS.map((pos) => POSITION_LABELS[pos]);

  const handleStackingChange = (value: boolean) => {
    router.setParams({ stacking: value.toString() });
  };

  const handlePositionChange = (position: ToastPosition) => {
    router.setParams({ position });
  };

  return (
    <Host style={{ flex: 1 }}>
      <Form scrollEnabled>
        <Section title="Global Toast Options">
          <Picker
            label="Toast Position"
            options={positionLabels}
            selectedIndex={selectedIndex}
            variant="menu"
            onOptionSelected={({ nativeEvent }) => {
              const position = POSITION_OPTIONS[nativeEvent.index];
              if (position) {
                handlePositionChange(position);
              }
            }}
          />
          <Switch
            label="Stacking Enabled"
            value={stackingEnabled}
            onValueChange={handleStackingChange}
          />
          <Button onPress={() => router.push('/modal')}>Open Modal</Button>
        </Section>
      </Form>
    </Host>
  );
};

export default SettingsScreen;
