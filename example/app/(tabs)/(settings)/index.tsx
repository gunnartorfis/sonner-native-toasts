import * as React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const SettingsScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => router.push('/modal')}>
        <Text style={styles.buttonText}>Open Modal</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
