import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ 
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.white,
      headerTitleStyle: { fontWeight: 'bold' },
      contentStyle: { backgroundColor: colors.background } 
    }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'ReLeaf Pads (Online)',
        }} 
      />
    </Stack>
  );
}
