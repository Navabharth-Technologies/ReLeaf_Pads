import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { Gift, TrendingUp, Users, Tag, Plus, CheckCircle, XCircle } from 'lucide-react-native';

export default function OwnerCouponsScreen() {
  const { coupons, orders, addCoupon } = useStore();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LIST' | 'INFLUENCERS'>('OVERVIEW');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountValue: '', type: 'GENERAL' as any, influencerName: '', contactNumber: '' });

  const handleAddCoupon = () => {
    if (!newCoupon.code || !newCoupon.discountValue) return;
    if (newCoupon.type === 'INFLUENCER' && newCoupon.contactNumber.length !== 10) {
      Alert.alert('Invalid Contact', 'Contact number must be exactly 10 digits.');
      return;
    }
    addCoupon({
      code: newCoupon.code,
      discountValue: Number(newCoupon.discountValue),
      type: newCoupon.type,
      influencerName: newCoupon.type === 'INFLUENCER' ? newCoupon.influencerName : undefined,
    });
    setIsAddModalVisible(false);
    setNewCoupon({ code: '', discountValue: '', type: 'GENERAL', influencerName: '', contactNumber: '' });
  };

  const handleInfluencerNameChange = (text: string) => {
    let filtered = text.replace(/[^a-zA-Z\s]/g, '');
    filtered = filtered.replace(/(.)\1{3,}/gi, '$1$1$1');
    const code = filtered ? `${filtered.split(' ')[0].toUpperCase()}${newCoupon.discountValue || ''}` : '';
    setNewCoupon({...newCoupon, influencerName: filtered, code});
  };

  const handleContactNumberChange = (text: string) => {
    let filtered = text.replace(/[^0-9]/g, '');
    filtered = filtered.replace(/^[^6-9]+/, '');
    filtered = filtered.replace(/(.)\1{3,}/g, '$1$1$1');
    filtered = filtered.slice(0, 10);
    setNewCoupon({...newCoupon, contactNumber: filtered});
  };

  const handleDiscountChange = (text: string) => {
    let filtered = text.replace(/[^0-9]/g, '');
    filtered = filtered.slice(0, 3);
    let code = newCoupon.code;
    if (newCoupon.type === 'INFLUENCER' && newCoupon.influencerName) {
        code = `${newCoupon.influencerName.split(' ')[0].toUpperCase()}${filtered}`;
    }
    setNewCoupon({...newCoupon, discountValue: filtered, code});
  };

  const handleCouponCodeChange = (text: string) => {
    let filtered = text.replace(/[^a-zA-Z0-9]/g, '');
    filtered = filtered.replace(/(.)\1{3,}/gi, '$1$1$1');
    setNewCoupon({...newCoupon, code: filtered.toUpperCase()});
  };

  // Computed metrics
  const activeCouponsCount = coupons.filter(c => c.active).length;
  const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0);
  
  const couponOrders = orders.filter(o => o.couponId && o.status !== 'CANCELLED');
  const totalCouponRevenue = couponOrders.reduce((sum, o) => sum + o.total, 0);
  const totalDiscountGiven = couponOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);

  // Influencer stats
  const influencers = coupons.filter(c => c.type === 'INFLUENCER').map(c => {
    const influencerOrders = couponOrders.filter(o => o.couponId === c.id);
    const revenue = influencerOrders.reduce((sum, o) => sum + o.total, 0);
    const discount = influencerOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
    return {
      id: c.influencerId || c.id,
      name: c.influencerName || 'Unknown',
      code: c.code,
      uses: c.usedCount,
      orders: influencerOrders.length,
      revenue,
      discount
    };
  });

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>Total Coupons</Text>
            <Tag size={16} color={colors.primary} />
          </View>
          <Text style={styles.metricValue}>{coupons.length}</Text>
          <Text style={styles.metricSub}>{activeCouponsCount} Active</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>Total Uses</Text>
            <Users size={16} color={colors.primary} />
          </View>
          <Text style={styles.metricValue}>{totalUses}</Text>
          <Text style={styles.metricSub}>Across all coupons</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>Coupon Revenue</Text>
            <TrendingUp size={16} color={colors.primary} />
          </View>
          <Text style={styles.metricValue}>₹{totalCouponRevenue.toFixed(2)}</Text>
          <Text style={styles.metricSub}>From discounted orders</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>Discount Given</Text>
            <Gift size={16} color={colors.primary} />
          </View>
          <Text style={styles.metricValue}>₹{totalDiscountGiven.toFixed(2)}</Text>
          <Text style={styles.metricSub}>Total savings provided</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderCouponList = () => (
    <FlatList
      data={coupons}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{item.code}</Text>
            {item.active ? (
              <View style={[styles.statusBadge, { backgroundColor: '#E6F4EA' }]}>
                <CheckCircle size={12} color="#1E8E3E" style={{ marginRight: 4 }} />
                <Text style={[styles.statusText, { color: '#1E8E3E' }]}>Active</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: '#FCE8E6' }]}>
                <XCircle size={12} color="#D93025" style={{ marginRight: 4 }} />
                <Text style={[styles.statusText, { color: '#D93025' }]}>Inactive</Text>
              </View>
            )}
          </View>
          <View style={styles.listDetails}>
            <Text style={styles.listDetailText}>Type: {item.type.replace('_', ' ')}</Text>
            <Text style={styles.listDetailText}>
              Discount: {item.discountType === 'PERCENTAGE' ? `${item.discountValue}%` : `₹${item.discountValue}`}
            </Text>
            {item.type === 'INFLUENCER' && (
              <Text style={styles.listDetailText}>Influencer: {item.influencerName}</Text>
            )}
            <Text style={styles.listDetailText}>Usage: {item.usedCount} {item.usageLimit ? `/ ${item.usageLimit}` : ''}</Text>
          </View>
        </View>
      )}
    />
  );

  const renderInfluencers = () => (
    <FlatList
      data={influencers}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{item.name}</Text>
            <Text style={styles.influencerCode}>{item.code}</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Uses</Text>
              <Text style={styles.statValue}>{item.uses}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Orders</Text>
              <Text style={styles.statValue}>{item.orders}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Revenue</Text>
              <Text style={styles.statValue}>₹{item.revenue.toFixed(0)}</Text>
            </View>
          </View>
        </View>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Coupons & Offers</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsAddModalVisible(true)}>
          <Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'OVERVIEW' && styles.activeTab]}
          onPress={() => setActiveTab('OVERVIEW')}
        >
          <Text style={[styles.tabText, activeTab === 'OVERVIEW' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'LIST' && styles.activeTab]}
          onPress={() => setActiveTab('LIST')}
        >
          <Text style={[styles.tabText, activeTab === 'LIST' && styles.activeTabText]}>All Coupons</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'INFLUENCERS' && styles.activeTab]}
          onPress={() => setActiveTab('INFLUENCERS')}
        >
          <Text style={[styles.tabText, activeTab === 'INFLUENCERS' && styles.activeTabText]}>Influencers</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'OVERVIEW' && renderOverview()}
      {activeTab === 'LIST' && renderCouponList()}
      {activeTab === 'INFLUENCERS' && renderInfluencers()}

      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Coupon</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <XCircle size={24} color={colors.mutedText} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Coupon Type</Text>
              <View style={{flexDirection: 'row', gap: 10}}>
                <TouchableOpacity onPress={() => setNewCoupon({...newCoupon, type: 'GENERAL', code: ''})} style={[styles.typeBtn, newCoupon.type === 'GENERAL' && styles.typeBtnActive]}>
                  <Text style={[styles.typeBtnText, newCoupon.type === 'GENERAL' && styles.typeBtnTextActive]}>General</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setNewCoupon({...newCoupon, type: 'INFLUENCER', code: ''})} style={[styles.typeBtn, newCoupon.type === 'INFLUENCER' && styles.typeBtnActive]}>
                  <Text style={[styles.typeBtnText, newCoupon.type === 'INFLUENCER' && styles.typeBtnTextActive]}>Influencer</Text>
                </TouchableOpacity>
              </View>
            </View>

            {newCoupon.type === 'INFLUENCER' && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Influencer Name</Text>
                  <TextInput
                    style={styles.input}
                    value={newCoupon.influencerName}
                    onChangeText={handleInfluencerNameChange}
                    placeholder="Enter influencer name"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Contact Number</Text>
                  <TextInput
                    style={styles.input}
                    value={newCoupon.contactNumber}
                    onChangeText={handleContactNumberChange}
                    placeholder="Enter contact number"
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Discount %</Text>
              <TextInput
                style={styles.input}
                value={newCoupon.discountValue}
                onChangeText={handleDiscountChange}
                placeholder="Enter discount percentage"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Coupon Code</Text>
              <TextInput
                style={[styles.input, newCoupon.type === 'INFLUENCER' && {backgroundColor: colors.background, color: colors.mutedText}]}
                value={newCoupon.code}
                onChangeText={handleCouponCodeChange}
                placeholder="Enter coupon code"
                autoCapitalize="characters"
                editable={newCoupon.type !== 'INFLUENCER'}
                selectTextOnFocus={newCoupon.type !== 'INFLUENCER'}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddCoupon}>
              <Text style={styles.saveBtnText}>Save Coupon</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.darkPurple },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: colors.primary
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedText
  },
  activeTabText: {
    color: colors.primary
  },
  tabContent: { flex: 1, padding: 16 },
  listContent: { padding: 16 },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  metricTitle: { fontSize: 13, color: colors.mutedText, fontWeight: '600' },
  metricValue: { fontSize: 24, fontWeight: '700', color: colors.darkPurple, marginBottom: 4 },
  metricSub: { fontSize: 12, color: colors.mutedText },
  listItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  listTitle: { fontSize: 16, fontWeight: '700', color: colors.darkPurple },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  listDetails: { gap: 4 },
  listDetailText: { fontSize: 14, color: colors.text },
  influencerCode: { fontSize: 14, fontWeight: '600', color: colors.primary },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12
  },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: colors.mutedText, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.darkPurple },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.darkPurple },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.darkPurple, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, fontSize: 16, color: colors.text },
  saveBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  typeBtnTextActive: { color: colors.white }
});
