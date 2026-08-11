import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/theme/colors';
import { useEffect } from 'react';
import { useStore } from '../src/store/useStore';

export default function RootLayout() {
  useEffect(() => {
    // Cross-tab syncing for the demo
    const interval = setInterval(() => {
      useStore.persist.rehydrate();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="customer" />
        <Stack.Screen name="owner" />
      </Stack>
    </>
  );
}
