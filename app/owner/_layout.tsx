import { Tabs } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { LayoutDashboard, ShoppingBag, Users, Package } from 'lucide-react-native';

export default function OwnerLayout() {
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: colors.white },
      headerTintColor: colors.darkPurple,
      headerTitleStyle: { fontWeight: 'bold' },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.mutedText,
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{ 
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="customers" 
        options={{ 
          title: 'Customers',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="products" 
        options={{ 
          title: 'Products',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />
        }} 
      />
    </Tabs>
  );
}
