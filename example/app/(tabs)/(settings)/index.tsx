import * as React from 'react';
import { useRouter } from 'expo-router';
import { Host, Form, Section, Button } from '@expo/ui/swift-ui';
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';

const SettingsScreen: React.FC = () => {
  const router = useRouter();

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section title="Navigation">
          <Button
            onPress={() => router.push('/modal')}
            label="Open Modal"
            modifiers={[buttonStyle('bordered')]}
          />
        </Section>
      </Form>
    </Host>
  );
};

export default SettingsScreen;
