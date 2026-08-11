import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { colors } from '../../../src/theme/colors';
import { useStore } from '../../../src/store/useStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, User, Package, Truck, Play, CheckCircle, Star } from 'lucide-react-native';

export default function OwnerOrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const orderId = `#${id}`;
  
  const { 
    orders, customers, deliveryPartners, 
    updateOrderStatus, assignDeliveryPartner, demoFastForward 
  } = useStore();

  const [partnerModalVisible, setPartnerModalVisible] = useState(false);

  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return (
      <View style={styles.container}>
         <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Not Found</Text>
            <View style={{ width: 24 }} />
          </View>
      </View>
    );
  }

  const customer = customers.find(c => c.id === order.customerId);
  const address = customer?.addresses.find(a => a.id === order.addressId);
  const activePartner = order.deliveryPartnerId ? deliveryPartners.find(dp => dp.id === order.deliveryPartnerId) : null;
  const availablePartners = deliveryPartners; // We will show all, but visually disable offline ones

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DELIVERED': return colors.darkPurple;
      case 'CANCELLED': return 'red';
      case 'OUT_FOR_DELIVERY': return '#d97706';
      default: return colors.primary;
    }
  };

  const statusColor = getStatusColor(order.status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity onPress={() => demoFastForward(order.id)}>
          <Play size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>{order.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{order.status.replace(/_/g, ' ')}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>{new Date(order.date).toLocaleString()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <User size={20} color={colors.mutedText} style={styles.icon} />
            <View>
              <Text style={styles.customerName}>{customer?.name}</Text>
              <Text style={styles.customerPhone}>{customer?.phone}</Text>
            </View>
          </View>
          <View style={[styles.row, { marginTop: 12, alignItems: 'flex-start' }]}>
            <MapPin size={20} color={colors.mutedText} style={[styles.icon, { marginTop: 2 }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressText}>{address?.houseNo}, {address?.street}</Text>
              {address?.landmark && <Text style={styles.addressText}>{address?.landmark}</Text>}
              <Text style={styles.addressText}>{address?.city} - {address?.pincode}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Package size={20} color={colors.primary} style={styles.icon} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemMeta}>{item.quantity}x • ₹{item.unitPrice}</Text>
              </View>
              <Text style={styles.itemTotal}>₹{item.totalPrice}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{order.total}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Management</Text>
          
          {['ORDER_PLACED', 'PAYMENT_CONFIRMED'].includes(order.status) && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => updateOrderStatus(order.id, 'PREPARING')}>
              <Text style={styles.actionBtnText}>Start Preparing Order</Text>
            </TouchableOpacity>
          )}

          {order.status === 'PREPARING' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => updateOrderStatus(order.id, 'PACKED')}>
              <Text style={styles.actionBtnText}>Mark as Packed</Text>
            </TouchableOpacity>
          )}

          {['PACKED', 'ASSIGNED'].includes(order.status) && (
            <View>
               <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => setPartnerModalVisible(true)}>
                 <Truck size={20} color={colors.primary} />
                 <Text style={[styles.actionBtnText, { color: colors.primary, marginLeft: 8 }]}>
                   {order.deliveryPartnerId ? 'Change Delivery Partner' : 'Assign Delivery Partner'}
                 </Text>
               </TouchableOpacity>

               {order.status === 'ASSIGNED' && (
                 <TouchableOpacity style={[styles.actionBtn, { marginTop: 12 }]} onPress={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}>
                   <Text style={styles.actionBtnText}>Hand Over & Dispatch</Text>
                 </TouchableOpacity>
               )}
            </View>
          )}

          {order.status === 'OUT_FOR_DELIVERY' && (
             <View>
               {activePartner && (
                 <View style={styles.assignedPartnerBox}>
                   <Truck size={20} color={colors.primary} />
                   <View style={{ marginLeft: 12 }}>
                     <Text style={styles.assignedPartnerName}>{activePartner.name}</Text>
                     <Text style={styles.assignedPartnerPhone}>{activePartner.phone}</Text>
                   </View>
                 </View>
               )}
               <TouchableOpacity style={styles.actionBtnComplete} onPress={() => updateOrderStatus(order.id, 'DELIVERED')}>
                 <CheckCircle size={20} color={colors.white} />
                 <Text style={[styles.actionBtnText, { marginLeft: 8 }]}>Mark as Delivered</Text>
               </TouchableOpacity>
             </View>
          )}

          {order.status === 'DELIVERED' && (
            <View style={styles.successState}>
              <CheckCircle size={24} color={colors.darkPurple} />
              <Text style={styles.successText}>Order Completed Successfully</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Assign Partner Modal */}
      <Modal visible={partnerModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Partner</Text>
              <TouchableOpacity onPress={() => setPartnerModalVisible(false)}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>All Delivery Partners</Text>
            {availablePartners.length === 0 ? (
              <Text style={styles.noPartnersText}>No partners found.</Text>
            ) : (
              availablePartners.map(dp => {
                const isAvailable = dp.status === 'AVAILABLE';
                return (
                  <TouchableOpacity 
                    key={dp.id} 
                    style={[styles.partnerOption, !isAvailable && { opacity: 0.5 }]}
                    disabled={!isAvailable}
                    onPress={() => {
                      assignDeliveryPartner(order.id, dp.id);
                      setPartnerModalVisible(false);
                    }}
                  >
                    <View>
                      <Text style={styles.partnerName}>{dp.name}</Text>
                      <Text style={styles.partnerPhone}>{dp.phone}</Text>
                      {!isAvailable && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>Offline / Unavailable</Text>}
                    </View>
                    <View style={styles.ratingBadge}>
                      <Star size={12} color={colors.darkPurple} fill={colors.darkPurple} />
                      <Text style={styles.ratingText}>{dp.rating}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </Modal>

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
  content: { padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 18, fontWeight: '700', color: colors.text },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 13, fontWeight: '700' },
  dateText: { fontSize: 14, color: colors.mutedText },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.darkPurple, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 12 },
  customerName: { fontSize: 16, fontWeight: '600', color: colors.text },
  customerPhone: { fontSize: 14, color: colors.mutedText, marginTop: 2 },
  addressText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
  itemMeta: { fontSize: 13, color: colors.mutedText },
  itemTotal: { fontSize: 15, fontWeight: '700', color: colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: '700', color: colors.darkPurple },
  actionBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  actionBtnSecondary: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.softPurple },
  actionBtnComplete: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.darkPurple, padding: 16, borderRadius: 8 },
  assignedPartnerBox: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.softPurple, borderRadius: 8, marginBottom: 16 },
  assignedPartnerName: { fontSize: 15, fontWeight: '600', color: colors.text },
  assignedPartnerPhone: { fontSize: 13, color: colors.mutedText },
  successState: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#F0FFF4', borderRadius: 8 },
  successText: { fontSize: 16, fontWeight: '600', color: colors.darkPurple, marginLeft: 8 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  closeText: { fontSize: 16, color: colors.mutedText, fontWeight: '500' },
  modalSubtitle: { fontSize: 15, color: colors.mutedText, marginBottom: 16 },
  noPartnersText: { fontSize: 15, color: colors.mutedText, fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  partnerOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: 12 },
  partnerName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  partnerPhone: { fontSize: 14, color: colors.mutedText },
  ratingBadge: { backgroundColor: colors.softPurple, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { color: colors.primary, fontWeight: '700', fontSize: 12 }
});
