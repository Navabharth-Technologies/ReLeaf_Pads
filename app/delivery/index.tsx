import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { Package, User, LogOut, CheckCircle, Navigation, MapPin } from 'lucide-react-native';

export default function DeliveryDashboard() {
  const router = useRouter();
  const { currentDeliveryPartner, logoutDeliveryPartner, orders, customers } = useStore();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

  useEffect(() => {
    if (!currentDeliveryPartner) {
      router.replace('/delivery/login');
    }
  }, [currentDeliveryPartner]);

  if (!currentDeliveryPartner) return null;

  // Active deliveries: orders assigned to this partner that are either ASSIGNED or OUT_FOR_DELIVERY
  const partnerOrders = orders.filter(o => o.deliveryPartnerId === currentDeliveryPartner.id);

  // Active orders sorted strictly in the sequence the owner assigned them (FIFO)
  const activeOrders = partnerOrders
    .filter(o => o.status === 'ASSIGNED' || o.status === 'OUT_FOR_DELIVERY')
    .sort((a, b) => {
      const aTime = a.assignedAt || a.trackingEvents?.find(e => e.status === 'ASSIGNED')?.timestamp || a.date;
      const bTime = b.assignedAt || b.trackingEvents?.find(e => e.status === 'ASSIGNED')?.timestamp || b.date;
      return new Date(aTime).getTime() - new Date(bTime).getTime();
    });

  const completedOrders = partnerOrders
    .filter(o => o.status === 'DELIVERED')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const completedOrdersCount = completedOrders.length;
  
  const handleLogout = () => {
    logoutDeliveryPartner();
    router.replace('/delivery/login');
  };

  const renderOrderItem = ({ item, index }: { item: any; index: number }) => {
    const customer = customers.find(c => c.id === item.customerId);
    const address = customer?.addresses.find(a => a.id === item.addressId);
    const isFirstActive = activeTab === 'ACTIVE' && index === 0;

    return (
      <TouchableOpacity 
        style={[styles.orderCard, isFirstActive && styles.activeOrderCardHighlighted]}
        onPress={() => router.push(`/delivery/order/${item.id.replace('#', '')}`)}
      >
        <View style={styles.orderHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={styles.orderId}>{item.id}</Text>
            {activeTab === 'ACTIVE' && (
              <View style={[styles.queuePill, isFirstActive ? styles.queuePillCurrent : styles.queuePillUpcoming]}>
                <Text style={[styles.queuePillText, isFirstActive ? styles.queuePillTextCurrent : styles.queuePillTextUpcoming]}>
                  {isFirstActive ? 'NEXT TO DELIVER' : `QUEUE #${index + 1}`}
                </Text>
              </View>
            )}
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'OUT_FOR_DELIVERY' ? '#F59E0B' : item.status === 'DELIVERED' ? colors.darkPurple : colors.softPurple }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.status === 'OUT_FOR_DELIVERY' || item.status === 'DELIVERED' ? colors.white : colors.primary }
            ]}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <User size={16} color={colors.mutedText} />
            <Text style={styles.detailText}>{customer?.name || 'Customer'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={16} color={colors.mutedText} />
            <Text style={styles.detailText} numberOfLines={1}>
              {address ? `${address.street}, ${address.city}` : 'No address'}
            </Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.itemCount}>{item.items.reduce((acc: number, i: any) => acc + i.quantity, 0)} Items</Text>
          <View style={[styles.actionButton, isFirstActive && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            <Text style={[styles.actionButtonText, isFirstActive && { color: colors.white }]}>
              {isFirstActive ? 'Deliver Now →' : 'View Details'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{currentDeliveryPartner.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Hello, {currentDeliveryPartner.name}</Text>
            <Text style={styles.partnerRoleText}>Delivery Partner • {currentDeliveryPartner.phone}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Package size={24} color={colors.primary} />
          <Text style={styles.kpiValue}>{activeOrders.length}</Text>
          <Text style={styles.kpiLabel}>Active Orders</Text>
        </View>
        <View style={styles.kpiCard}>
          <CheckCircle size={24} color={colors.primary} />
          <Text style={[styles.kpiValue, { color: colors.darkPurple }]}>{completedOrdersCount}</Text>
          <Text style={styles.kpiLabel}>Delivered</Text>
        </View>
        <View style={styles.kpiCard}>
          <Navigation size={24} color={colors.primary} />
          <Text style={styles.kpiValue}>{currentDeliveryPartner.rating?.toFixed(1) || '5.0'}</Text>
          <Text style={styles.kpiLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'ACTIVE' && styles.activeTabBtn]}
            onPress={() => setActiveTab('ACTIVE')}
          >
            <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.activeTabText]}>
              Active {activeOrders.length > 0 ? `(${activeOrders.length})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'COMPLETED' && styles.activeTabBtn]}
            onPress={() => setActiveTab('COMPLETED')}
          >
            <Text style={[styles.tabText, activeTab === 'COMPLETED' && styles.activeTabText]}>
              Delivered {completedOrdersCount > 0 ? `(${completedOrdersCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'ACTIVE' ? (
          activeOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <CheckCircle size={56} color={colors.primary} />
              <Text style={styles.emptyStateText}>All Deliveries Completed! 🎉</Text>
              <Text style={styles.emptyStateSubtext}>
                {completedOrdersCount > 0 
                  ? `You have delivered all ${completedOrdersCount} assigned orders. Excellent work!` 
                  : 'No active deliveries at the moment. Take a break!'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={activeOrders}
              renderItem={renderOrderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : (
          completedOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <CheckCircle size={48} color={colors.border} />
              <Text style={styles.emptyStateText}>No delivered orders yet.</Text>
              <Text style={styles.emptyStateSubtext}>Orders you complete will appear here.</Text>
            </View>
          ) : (
            <FlatList
              data={completedOrders}
              renderItem={renderOrderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  partnerRoleText: {
    fontSize: 13,
    color: colors.mutedText,
    fontWeight: '500',
  },
  activeOrderCardHighlighted: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#FAF5FF',
  },
  queuePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  queuePillCurrent: {
    backgroundColor: colors.primary,
  },
  queuePillUpcoming: {
    backgroundColor: '#E5E7EB',
  },
  queuePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  queuePillTextCurrent: {
    color: colors.white,
  },
  queuePillTextUpcoming: {
    color: colors.text,
  },
  logoutButton: {
    padding: 8,
  },
  kpiContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.mutedText,
    fontWeight: '500',
  },
  section: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: colors.softPurple,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedText,
  },
  activeTabText: {
    color: colors.primary,
  },
  listContainer: {
    paddingBottom: 20,
    gap: 12,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  orderDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemCount: {
    fontSize: 14,
    color: colors.mutedText,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: colors.softPurple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: 8,
  },
});
