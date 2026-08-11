import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { Package, User, LogOut, CheckCircle, Navigation, MapPin } from 'lucide-react-native';

export default function DeliveryDashboard() {
  const router = useRouter();
  const { currentDeliveryPartner, logoutDeliveryPartner, togglePartnerStatus, orders, customers } = useStore();

  useEffect(() => {
    if (!currentDeliveryPartner) {
      router.replace('/delivery/login');
    }
  }, [currentDeliveryPartner]);

  if (!currentDeliveryPartner) return null;

  // Active deliveries: orders assigned to this partner that are either ASSIGNED or OUT_FOR_DELIVERY
  const activeOrders = orders.filter(
    o => o.deliveryPartnerId === currentDeliveryPartner.id && 
         (o.status === 'ASSIGNED' || o.status === 'OUT_FOR_DELIVERY')
  );

  const completedOrdersCount = currentDeliveryPartner.completedOrders || 0;
  
  const handleLogout = () => {
    logoutDeliveryPartner();
    router.replace('/delivery/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return colors.primary;
      case 'ON_DELIVERY': return '#F59E0B';
      case 'ASSIGNED': return '#F59E0B';
      case 'OFFLINE': return colors.mutedText;
      default: return colors.mutedText;
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const customer = customers.find(c => c.id === item.customerId);
    const address = customer?.addresses.find(a => a.id === item.addressId);

    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => router.push(`/delivery/order/${item.id.replace('#', '')}`)}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{item.id}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'OUT_FOR_DELIVERY' ? '#F59E0B' : colors.softPurple }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.status === 'OUT_FOR_DELIVERY' ? colors.white : colors.primary }
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
          <View style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Details</Text>
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
            <TouchableOpacity 
              style={[styles.statusToggle, { borderColor: getStatusColor(currentDeliveryPartner.status) }]}
              onPress={togglePartnerStatus}
            >
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(currentDeliveryPartner.status) }]} />
              <Text style={[styles.statusToggleText, { color: getStatusColor(currentDeliveryPartner.status) }]}>
                {currentDeliveryPartner.status}
              </Text>
            </TouchableOpacity>
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
          <Text style={styles.kpiLabel}>Active</Text>
        </View>
        <View style={styles.kpiCard}>
          <CheckCircle size={24} color={colors.primary} />
          <Text style={styles.kpiValue}>{completedOrdersCount}</Text>
          <Text style={styles.kpiLabel}>Completed</Text>
        </View>
        <View style={styles.kpiCard}>
          <Navigation size={24} color={colors.primary} />
          <Text style={styles.kpiValue}>4.9</Text>
          <Text style={styles.kpiLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Deliveries</Text>
        {activeOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color={colors.border} />
            <Text style={styles.emptyStateText}>No active deliveries at the moment.</Text>
            <Text style={styles.emptyStateSubtext}>Take a break or check back later!</Text>
          </View>
        ) : (
          <FlatList
            data={activeOrders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
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
    marginBottom: 4,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
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
