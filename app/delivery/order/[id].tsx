import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { useStore } from '../../../src/store/useStore';
import { MapPin, Phone, User, Package, Check, ArrowRight } from 'lucide-react-native';

export default function DeliveryOrderDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { orders, customers, updateOrderStatus, currentDeliveryPartner } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const orderId = typeof id === 'string' && id.startsWith('#') ? id : `#${id}`;
  const order = orders.find(o => o.id === orderId);
  if (!order || !currentDeliveryPartner) return null;

  const customer = customers.find(c => c.id === order.customerId);
  const address = customer?.addresses.find(a => a.id === order.addressId);

  const handleUpdateStatus = (newStatus: 'OUT_FOR_DELIVERY' | 'DELIVERED') => {
    setIsProcessing(true);
    // Simulate network delay for demo
    setTimeout(() => {
      updateOrderStatus(order.id, newStatus);
      setIsProcessing(false);
      
      if (newStatus === 'DELIVERED') {
        Alert.alert('Success', 'Order delivered successfully!', [
          { text: 'OK', onPress: () => router.replace('/delivery') }
        ]);
      }
    }, 800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.orderId}>{order.id}</Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: order.status === 'OUT_FOR_DELIVERY' ? '#F59E0B' : colors.softPurple }
        ]}>
          <Text style={[
            styles.statusText,
            { color: order.status === 'OUT_FOR_DELIVERY' ? colors.white : colors.primary }
          ]}>
            {order.status.replace(/_/g, ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer Details</Text>
        
        <View style={styles.detailRow}>
          <View style={styles.iconBox}>
            <User size={20} color={colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{customer?.name}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.iconBox}>
            <Phone size={20} color={colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{customer?.phone}</Text>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.iconBox}>
            <MapPin size={20} color={colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Delivery Address</Text>
            <Text style={styles.detailValue}>{address?.street}</Text>
            <Text style={styles.detailValue}>{address?.city} {address?.pincode}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <Text style={styles.itemCountText}>
            {order.items.reduce((acc, item) => acc + item.quantity, 0)} Items
          </Text>
        </View>
        
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemIconBox}>
              <Package size={20} color={colors.mutedText} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemPackSize}>Pack of {item.packSize}</Text>
            </View>
            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Amount to Collect</Text>
          <Text style={styles.totalValue}>
            {order.paymentStatus === 'PAID' ? 'PREPAID' : `₹${order.total}`}
          </Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        {order.status === 'ASSIGNED' && (
          <TouchableOpacity 
            style={styles.primaryActionBtn}
            onPress={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
            disabled={isProcessing}
          >
            <Text style={styles.primaryActionText}>
              {isProcessing ? 'Processing...' : 'Pick Up Order'}
            </Text>
            {!isProcessing && <ArrowRight size={20} color={colors.white} />}
          </TouchableOpacity>
        )}

        {order.status === 'OUT_FOR_DELIVERY' && (
          <TouchableOpacity 
            style={[styles.primaryActionBtn, { backgroundColor: colors.success }]}
            onPress={() => handleUpdateStatus('DELIVERED')}
            disabled={isProcessing}
          >
            <Text style={styles.primaryActionText}>
              {isProcessing ? 'Processing...' : 'Mark as Delivered'}
            </Text>
            {!isProcessing && <Check size={20} color={colors.white} />}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  itemCountText: {
    fontSize: 14,
    color: colors.mutedText,
    fontWeight: '500',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.mutedText,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: colors.softPurple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  callButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  itemIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  itemPackSize: {
    fontSize: 14,
    color: colors.mutedText,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
  actionContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  primaryActionBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
