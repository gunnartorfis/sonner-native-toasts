import * as React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToastDemo from '../components/toast-demo';

const ModalScreen: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ToastDemo />
    </SafeAreaView>
  );
};

export default ModalScreen;
