import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { Order } from '../../src/store/types';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';

export default function OwnerOrdersScreen() {
  const { orders, customers } = useStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    customers.find(c => c.id === o.customerId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DELIVERED': return colors.darkPurple;
      case 'CANCELLED': return 'red';
      case 'OUT_FOR_DELIVERY': return '#d97706'; // orange
      default: return colors.primary;
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const customer = customers.find(c => c.id === item.customerId);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity 
        style={styles.orderCard} 
        onPress={() => router.push(`/owner/order/${item.id.replace('#', '')}`)}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'DELIVERED' ? colors.background : `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
        
        <View style={styles.customerRow}>
          <Text style={styles.customerName}>{customer?.name || 'Customer'}</Text>
          <Text style={styles.customerPhone}>{customer?.phone}</Text>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderDate}>{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
          <Text style={styles.orderAmount}>₹{item.total}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.mutedText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Order ID or Customer Name"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 15,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.mutedText,
    marginTop: 40,
  },
  orderCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  customerPhone: {
    fontSize: 14,
    color: colors.mutedText,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  orderDate: {
    fontSize: 13,
    color: colors.mutedText,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkPurple,
  }
});
