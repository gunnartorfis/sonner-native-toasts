import * as React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToastDemo from '../components/toast-demo';

const ModalScreen: React.FC = () => {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
      }}
    >
      <ToastDemo />
    </SafeAreaView>
  );
};

export default ModalScreen;
