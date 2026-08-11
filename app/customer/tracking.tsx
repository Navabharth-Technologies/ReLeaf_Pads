import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Circle, Truck, MapPin, PackageX } from 'lucide-react-native';
import { OrderStatus } from '../../src/store/types';

export default function CustomerTrackingScreen() {
  const router = useRouter();
  const { orders, currentCustomer, deliveryPartners, cancelOrder } = useStore();
  const [now, setNow] = useState(Date.now());

  // Update time for the demo "fast forward" to re-render
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const activeOrder = currentCustomer 
    ? orders.find(o => o.customerId === currentCustomer.id && o.status !== 'DELIVERED' && o.status !== 'CANCELLED')
    : null;

  if (!activeOrder) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You don't have any active orders to track.</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace('/customer')}>
            <Text style={styles.shopBtnText}>Go to Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const activePartner = activeOrder.deliveryPartnerId ? deliveryPartners.find(dp => dp.id === activeOrder.deliveryPartnerId) : null;
  
  const canCancel = !['PACKED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(activeOrder.status);

  const handleCancel = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel this order?')) {
        cancelOrder(activeOrder.id);
        router.back();
      }
    } else {
      Alert.alert(
        'Cancel Order',
        'Are you sure you want to cancel this order?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes, Cancel', style: 'destructive', onPress: () => {
            cancelOrder(activeOrder.id);
            router.back();
          }}
        ]
      );
    }
  };

  const getTimelineSteps = () => {
    const steps: { status: OrderStatus, label: string }[] = [
      { status: 'ORDER_PLACED', label: 'Order Placed' },
      { status: 'ORDER_CONFIRMED', label: 'Order Confirmed' },
      { status: 'PREPARING', label: 'Preparing' },
      { status: 'PACKED', label: 'Packed' },
      { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
      { status: 'DELIVERED', label: 'Delivered' }
    ];

    const currentIdx = steps.findIndex(s => s.status === activeOrder.status);
    // If ASSIGNED, it maps functionally between PACKED and OUT_FOR_DELIVERY but we just show it as part of OUT_FOR_DELIVERY preparation.
    const resolvedIdx = activeOrder.status === 'ASSIGNED' ? 3 : currentIdx;

    return steps.map((s, idx) => {
      const event = activeOrder.trackingEvents.find(e => e.status === s.status);
      let isCompleted = false;
      let isCurrent = false;

      if (resolvedIdx >= idx) isCompleted = true;
      if (resolvedIdx === idx) isCurrent = true;

      // Also mark OUT_FOR_DELIVERY as completed if we are ASSIGNED, wait no, ASSIGNED is before OUT_FOR_DELIVERY
      
      return { ...s, isCompleted, isCurrent, timestamp: event?.timestamp };
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tracking {activeOrder.id}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Status</Text>
          <View style={styles.timeline}>
            {getTimelineSteps().map((step, idx) => (
              <View key={step.status} style={styles.timelineRow}>
                <View style={styles.timelineIcon}>
                  {step.isCompleted ? (
                     <CheckCircle2 size={24} color={colors.primary} />
                  ) : (
                     <Circle size={24} color={colors.border} />
                  )}
                  {idx < 5 && (
                    <View style={[styles.timelineLine, step.isCompleted && !step.isCurrent && { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, step.isCurrent && styles.timelineLabelActive]}>
                    {step.label}
                  </Text>
                  {step.timestamp && (
                    <Text style={styles.timelineTime}>
                      {new Date(step.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {activePartner && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Delivery Partner</Text>
            <View style={styles.partnerRow}>
              <View style={styles.partnerAvatar}>
                <Truck size={24} color={colors.primary} />
              </View>
              <View style={styles.partnerDetails}>
                <Text style={styles.partnerName}>{activePartner.name}</Text>
                <Text style={styles.partnerPhone}>{activePartner.phone}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressRow}>
            <MapPin size={20} color={colors.primary} style={{ marginTop: 2 }} />
            <View style={styles.addressDetails}>
              <Text style={styles.addressName}>{currentCustomer?.name}</Text>
              <Text style={styles.addressText}>{currentCustomer?.addresses[0]?.houseNo}, {currentCustomer?.addresses[0]?.street}</Text>
              <Text style={styles.addressText}>{currentCustomer?.addresses[0]?.landmark && `${currentCustomer?.addresses[0].landmark}, `}{currentCustomer?.addresses[0]?.city} - {currentCustomer?.addresses[0]?.pincode}</Text>
            </View>
          </View>
        </View>

        {canCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <PackageX size={20} color="red" />
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
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
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: colors.mutedText, marginBottom: 20 },
  shopBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  shopBtnText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  content: { padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkPurple,
    marginBottom: 16
  },
  timeline: { paddingLeft: 8 },
  timelineRow: { flexDirection: 'row', marginBottom: 24 },
  timelineIcon: { alignItems: 'center', marginRight: 16 },
  timelineLine: { width: 2, height: 32, backgroundColor: colors.border, marginTop: 4, position: 'absolute', top: 24 },
  timelineContent: { flex: 1, justifyContent: 'center' },
  timelineLabel: { fontSize: 15, color: colors.text, fontWeight: '500' },
  timelineLabelActive: { color: colors.primary, fontWeight: '700' },
  timelineTime: { fontSize: 13, color: colors.mutedText, marginTop: 4 },
  partnerRow: { flexDirection: 'row', alignItems: 'center' },
  partnerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.softPurple, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  partnerDetails: { flex: 1 },
  partnerName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 },
  partnerPhone: { fontSize: 14, color: colors.mutedText },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  addressDetails: { marginLeft: 12, flex: 1 },
  addressName: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 },
  addressText: { fontSize: 14, color: colors.mutedText, lineHeight: 20 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'red', backgroundColor: '#FFF0F0' },
  cancelBtnText: { color: 'red', fontWeight: '600', fontSize: 16, marginLeft: 8 }
});
