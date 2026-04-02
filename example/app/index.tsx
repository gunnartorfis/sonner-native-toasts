import { Text } from '@react-navigation/elements';
import { Link } from 'expo-router';
import { ScrollView } from 'react-native';
import ToastDemo from '../components/toast-demo';

export default function Index() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingVertical: 20,
        flex: 1,
      }}
    >
      <Link href="/modal">
        <Text>Show modal</Text>
      </Link>
      <ToastDemo />
    </ScrollView>
  );
}
