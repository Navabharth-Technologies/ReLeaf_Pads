import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, Modal, Alert } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { Order } from '../../src/store/types';
import { useRouter } from 'expo-router';
import { Search, Truck, CheckSquare, Square, Star, Layers, X } from 'lucide-react-native';

export default function OwnerOrdersScreen() {
  const { orders, customers, deliveryPartners, fetchOrders, assignMultipleOrders } = useStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = React.useState<string[]>([]);
  const [partnerModalVisible, setPartnerModalVisible] = React.useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const filteredOrders = orders.filter(o => 
    o.paymentStatus === 'PAID' &&
    (o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    customers.find(c => c.id === o.customerId)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleOrderSelection = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter(item => item !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  const handleBatchAssign = async (partnerId: string) => {
    const partner = deliveryPartners.find(dp => dp.id === partnerId);
    await assignMultipleOrders(selectedOrderIds, partnerId);
    setPartnerModalVisible(false);
    const count = selectedOrderIds.length;
    setSelectedOrderIds([]);
    setSelectionMode(false);
    Alert.alert('Orders Assigned', `Successfully assigned ${count} order(s) to ${partner?.name || 'delivery partner'}.`);
  };

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
    const assignedPartner = item.deliveryPartnerId ? deliveryPartners.find(dp => dp.id === item.deliveryPartnerId) : null;
    const isSelected = selectedOrderIds.includes(item.id);

    return (
      <TouchableOpacity 
        style={[styles.orderCard, isSelected && styles.orderCardSelected]} 
        onPress={() => {
          if (selectionMode) {
            toggleOrderSelection(item.id);
          } else {
            router.push(`/owner/order/${item.id.replace('#', '')}`);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {selectionMode && (
              <TouchableOpacity onPress={() => toggleOrderSelection(item.id)}>
                {isSelected ? (
                  <CheckSquare size={22} color={colors.primary} />
                ) : (
                  <Square size={22} color={colors.border} />
                )}
              </TouchableOpacity>
            )}
            <Text style={styles.orderId}>{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'DELIVERED' ? colors.background : `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
        
        <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <View style={[styles.statusBadge, { backgroundColor: item.paymentStatus === 'PAID' ? '#dcfce7' : '#fee2e2', paddingHorizontal: 8, paddingVertical: 4 }]}>
             <Text style={[styles.statusText, { color: item.paymentStatus === 'PAID' ? '#166534' : '#991b1b', fontSize: 11 }]}>
               {item.paymentStatus} {item.paymentMethod ? `(${item.paymentMethod})` : ''}
             </Text>
          </View>

          {assignedPartner ? (
            <View style={styles.assignedBadge}>
              <Truck size={12} color={colors.primary} />
              <Text style={styles.assignedBadgeText}>Assigned: {assignedPartner.name}</Text>
            </View>
          ) : ['PACKED', 'PREPARING'].includes(item.status) ? (
            <View style={styles.unassignedBadge}>
              <Text style={styles.unassignedBadgeText}>Ready to Assign</Text>
            </View>
          ) : null}
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
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.mutedText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Order ID or Customer Name"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity 
          style={[styles.multiAssignToggleBtn, selectionMode && styles.multiAssignToggleBtnActive]}
          onPress={() => {
            setSelectionMode(!selectionMode);
            setSelectedOrderIds([]);
          }}
        >
          {selectionMode ? (
            <X size={18} color={colors.white} />
          ) : (
            <Layers size={18} color={colors.primary} />
          )}
          <Text style={[styles.multiAssignToggleText, selectionMode && { color: colors.white }]}>
            {selectionMode ? 'Cancel' : 'Multi-Assign'}
          </Text>
        </TouchableOpacity>
      </View>

      {selectionMode && (
        <View style={styles.selectionInfoBar}>
          <Text style={styles.selectionInfoText}>
            {selectedOrderIds.length} order(s) selected
          </Text>
          <TouchableOpacity 
            onPress={() => {
              const eligible = filteredOrders
                .filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED')
                .map(o => o.id);
              setSelectedOrderIds(eligible);
            }}
          >
            <Text style={styles.selectAllText}>Select All Open</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={[styles.list, selectionMode && selectedOrderIds.length > 0 && { paddingBottom: 100 }]}
        ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />

      {/* Floating Bottom Bar for Batch Assignment */}
      {selectionMode && selectedOrderIds.length > 0 && (
        <View style={styles.floatingActionBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.floatingBarTitle}>{selectedOrderIds.length} Orders Selected</Text>
            <Text style={styles.floatingBarSubtitle}>Assign simultaneously to a delivery partner</Text>
          </View>
          <TouchableOpacity 
            style={styles.floatingAssignBtn}
            onPress={() => setPartnerModalVisible(true)}
          >
            <Truck size={18} color={colors.white} />
            <Text style={styles.floatingAssignBtnText}>Assign Partner</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Partner Selection Modal */}
      <Modal visible={partnerModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Assign {selectedOrderIds.length} Orders</Text>
                <Text style={styles.modalSubtitle}>Orders will be queued in sequence for this partner</Text>
              </View>
              <TouchableOpacity onPress={() => setPartnerModalVisible(false)}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {deliveryPartners.length === 0 ? (
              <Text style={styles.emptyText}>No delivery partners registered.</Text>
            ) : (
              <FlatList
                data={deliveryPartners}
                keyExtractor={item => item.id}
                renderItem={({ item: dp }) => {
                  const partnerActiveCount = orders.filter(
                    o => o.deliveryPartnerId === dp.id && (o.status === 'ASSIGNED' || o.status === 'OUT_FOR_DELIVERY')
                  ).length;
                  const partnerDeliveredCount = orders.filter(
                    o => o.deliveryPartnerId === dp.id && o.status === 'DELIVERED'
                  ).length;

                  return (
                    <TouchableOpacity
                      style={styles.partnerOption}
                      onPress={() => handleBatchAssign(dp.id)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.partnerName}>{dp.name}</Text>
                        <Text style={styles.partnerPhone}>{dp.phone}</Text>
                        <Text style={styles.partnerWorkload}>
                          {partnerActiveCount} active in queue • {partnerDeliveredCount} delivered
                        </Text>
                      </View>
                      <View style={styles.ratingBadge}>
                        <Star size={12} color={colors.darkPurple} fill={colors.darkPurple} />
                        <Text style={styles.ratingText}>{dp.rating?.toFixed(1) || '5.0'}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  multiAssignToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.softPurple,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  multiAssignToggleBtnActive: {
    backgroundColor: colors.primary,
  },
  multiAssignToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  selectionInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#FAF5FF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectionInfoText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.darkPurple,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  orderCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#FAF5FF',
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
  assignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.softPurple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assignedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  unassignedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unassignedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
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
  },
  floatingActionBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#1E1B4B',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingBarTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  floatingBarSubtitle: {
    color: '#A5B4FC',
    fontSize: 12,
    marginTop: 2,
  },
  floatingAssignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  floatingAssignBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 2,
  },
  closeText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  partnerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 12,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  partnerPhone: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: 2,
  },
  partnerWorkload: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.softPurple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.darkPurple,
  },
});
