import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function DeliveryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background,
        }
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Delivery Partner Login',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Delivery Dashboard',
          headerBackVisible: false // Prevent going back to login without logging out
        }} 
      />
      <Stack.Screen 
        name="order/[id]" 
        options={{ 
          title: 'Delivery Details' 
        }} 
      />
    </Stack>
  );
}
