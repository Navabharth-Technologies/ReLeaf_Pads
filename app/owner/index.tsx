import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { useRouter } from 'expo-router';
import { Package, Truck, ClipboardList, AlertCircle, ChevronRight } from 'lucide-react-native';

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const { orders, products } = useStore();

  const totalSales = orders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.total, 0);
  const openOrders = orders.filter(o => ['ORDER_PLACED', 'PAYMENT_CONFIRMED', 'ORDER_CONFIRMED', 'PREPARING', 'PACKED'].includes(o.status)).length;
  const unassignedDeliveries = orders.filter(o => o.status === 'PACKED' && !o.deliveryPartnerId).length;
  const lowStockItems = products.filter(p => p.stockStatus === 'LOW_STOCK' || p.stockStatus === 'OUT_OF_STOCK').length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>₹{totalSales}</Text>
          <Text style={styles.kpiLabel}>Total Sales</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{openOrders}</Text>
          <Text style={styles.kpiLabel}>Open Orders</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{unassignedDeliveries}</Text>
          <Text style={styles.kpiLabel}>Unassigned Deliveries</Text>
        </View>
        <View style={[styles.kpiCard, lowStockItems > 0 && { borderColor: 'red', backgroundColor: '#FFF0F0' }]}>
          <Text style={[styles.kpiValue, lowStockItems > 0 && { color: 'red' }]}>{lowStockItems}</Text>
          <Text style={[styles.kpiLabel, lowStockItems > 0 && { color: 'red' }]}>Low Stock Items</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/owner/orders')}>
          <View style={styles.actionLeft}>
            <ClipboardList size={24} color={colors.primary} />
            <Text style={styles.actionText}>Manage Orders</Text>
          </View>
          <ChevronRight size={20} color={colors.mutedText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/owner/delivery')}>
          <View style={styles.actionLeft}>
            <Truck size={24} color={colors.primary} />
            <Text style={styles.actionText}>Delivery Partners</Text>
          </View>
          <ChevronRight size={20} color={colors.mutedText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/owner/products')}>
          <View style={styles.actionLeft}>
            <Package size={24} color={colors.primary} />
            <Text style={styles.actionText}>Inventory Management</Text>
          </View>
          <ChevronRight size={20} color={colors.mutedText} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {orders.length === 0 ? (
          <Text style={styles.emptyText}>No orders yet.</Text>
        ) : (
          orders.slice(0, 4).map(order => (
            <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => router.push(`/owner/order/${order.id.replace('#', '')}`)}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.orderAmount}>₹{order.total}</Text>
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.orderDate}>{new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{order.status.replace(/_/g, ' ')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 13,
    color: colors.mutedText,
    textAlign: 'center'
  },
  quickActions: {
    marginBottom: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkPurple,
    marginBottom: 16,
  },
  emptyText: {
    color: colors.mutedText,
    fontStyle: 'italic',
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
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderDate: {
    fontSize: 13,
    color: colors.mutedText,
  },
  statusBadge: {
    backgroundColor: colors.softPurple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  }
});
