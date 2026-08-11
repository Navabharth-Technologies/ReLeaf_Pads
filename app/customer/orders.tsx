import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react-native';

export default function CustomerOrdersScreen() {
  const router = useRouter();
  const { orders, currentCustomer } = useStore();

  const customerOrders = currentCustomer 
    ? orders.filter(o => o.customerId === currentCustomer.id)
    : [];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DELIVERED': return colors.darkPurple;
      case 'CANCELLED': return 'red';
      default: return colors.primary;
    }
  };

  const getStatusIcon = (status: string, color: string) => {
    switch(status) {
      case 'DELIVERED': return <CheckCircle size={16} color={color} />;
      case 'OUT_FOR_DELIVERY': return <Truck size={16} color={color} />;
      case 'CANCELLED': return <Clock size={16} color={color} />; // or x icon
      default: return <Package size={16} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {customerOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.back()}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={customerOrders}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const statusColor = getStatusColor(item.status);
            return (
              <TouchableOpacity 
                style={styles.orderCard}
                onPress={() => {
                  if (item.status !== 'DELIVERED' && item.status !== 'CANCELLED') {
                    router.push('/customer/tracking');
                  }
                }}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>{item.id}</Text>
                  <Text style={styles.orderDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>

                <View style={styles.itemsList}>
                  {item.items.map((cartItem, idx) => (
                    <Text key={idx} style={styles.itemText} numberOfLines={1}>
                      {cartItem.quantity}x {cartItem.productName}
                    </Text>
                  ))}
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.statusRow}>
                    {getStatusIcon(item.status, statusColor)}
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {item.status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                  <Text style={styles.orderTotal}>₹{item.total}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  list: { padding: 16 },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  orderId: { fontSize: 16, fontWeight: '700', color: colors.darkPurple },
  orderDate: { fontSize: 14, color: colors.mutedText },
  itemsList: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  itemText: { fontSize: 14, color: colors.text, marginBottom: 4 },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  orderTotal: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: colors.mutedText, marginBottom: 20 },
  shopBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  shopBtnText: { color: colors.white, fontWeight: '600', fontSize: 16 }
});
