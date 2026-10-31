import { Stack, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { TouchableOpacity } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

export default function CustomerLayout() {
  const router = useRouter();

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
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/legal')} 
              style={{ padding: 6, marginRight: 4 }}
              accessibilityLabel="Policies & Compliance"
            >
              <ShieldCheck size={22} color={colors.white} />
            </TouchableOpacity>
          )
        }} 
      />
    </Stack>
  );
}
