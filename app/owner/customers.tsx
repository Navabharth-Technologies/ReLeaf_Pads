import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { Customer } from '../../src/store/types';

export default function OwnerCustomersScreen() {
  const { customers, orders } = useStore();

  const renderCustomer = ({ item }: { item: Customer }) => {
    const customerOrders = orders.filter(o => o.customerId === item.id);
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name || 'Unknown'}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        <Text style={styles.pincode}>Pincode: {item.pincode}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>{customerOrders.length} Orders</Text>
          <Text style={styles.statsText}>₹{totalSpent} Spent</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={customers}
        keyExtractor={item => item.id}
        renderItem={renderCustomer}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  card: { backgroundColor: colors.white, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  name: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  phone: { fontSize: 14, color: colors.mutedText, marginBottom: 4 },
  pincode: { fontSize: 14, color: colors.mutedText, marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  statsText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
