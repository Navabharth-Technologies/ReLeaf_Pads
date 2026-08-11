import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { useRouter } from 'expo-router';
import { Truck, Star, Phone, ArrowLeft, CheckCircle2, Plus, Trash2 } from 'lucide-react-native';
import { DeliveryPartner } from '../../src/store/types';

export default function OwnerDeliveryScreen() {
  const router = useRouter();
  const { deliveryPartners, addDeliveryPartner, removeDeliveryPartner } = useStore();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [partnerToDelete, setPartnerToDelete] = React.useState<DeliveryPartner | null>(null);
  
  const [newName, setNewName] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('');

  const handlePhoneChange = (text: string) => {
    // 1. Remove non-numeric characters
    const numbersOnly = text.replace(/[^0-9]/g, '');
    
    if (numbersOnly.length === 0) {
      setNewPhone(numbersOnly);
      return;
    }
    
    // 2. Enforce 10 digits max
    if (numbersOnly.length > 10) return;
    
    // 3. First digit must be 6, 7, 8, or 9
    if (!/^[6-9]/.test(numbersOnly[0])) return;
    
    // 4. No more than 3 continuous same digits
    if (/(.)\1{3,}/.test(numbersOnly)) return;
    
    setNewPhone(numbersOnly);
  };

  const validatePhone = (input: string) => {
    const digits = input.replace(/\D/g, '');
    let phone10 = digits;
    if (digits.length === 12 && digits.startsWith('91')) {
      phone10 = digits.slice(2);
    }
    
    if (phone10.length !== 10) {
      return { valid: false, message: 'Phone number must be exactly 10 digits.' };
    }
    
    if (!/^[6-9]/.test(phone10)) {
      return { valid: false, message: 'Phone number must start with 6, 7, 8, or 9.' };
    }
    
    if (/(.)\1{3,}/.test(phone10)) {
      return { valid: false, message: 'Invalid phone number format (more than 3 continuous same numbers).' };
    }
    
    return { valid: true };
  };

  const handleAddPartner = () => {
    if (newName.trim() && newPhone.trim()) {
      const validation = validatePhone(newPhone);
      if (!validation.valid) {
        Alert.alert('Invalid Phone Number', validation.message);
        return;
      }

      addDeliveryPartner(newName, newPhone);
      setNewName('');
      setNewPhone('');
      setModalVisible(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AVAILABLE': return colors.darkPurple;
      case 'ON_DELIVERY': return '#d97706'; // orange
      case 'ASSIGNED': return colors.primary;
      case 'OFFLINE': return colors.mutedText;
      default: return colors.text;
    }
  };

  const renderPartner = ({ item }: { item: DeliveryPartner }) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.partnerInfo}>
            <View style={styles.avatar}>
              <Truck size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.phoneRow}>
                <Phone size={14} color={colors.mutedText} />
                <Text style={styles.phone}>{item.phone}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.replace(/_/g, ' ')}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                setPartnerToDelete(item);
                setDeleteModalVisible(true);
              }}
            >
              <Trash2 size={20} color={colors.error || '#ef4444'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Active Orders</Text>
            <Text style={[styles.statValue, { color: item.activeOrders > 0 ? colors.primary : colors.text }]}>
              {item.activeOrders}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{item.completedOrders}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rating</Text>
            <View style={styles.ratingRow}>
              <Star size={16} color="#d97706" fill="#d97706" />
              <Text style={styles.statValue}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Partners</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={deliveryPartners}
        keyExtractor={item => item.id}
        renderItem={renderPartner}
        contentContainerStyle={styles.list}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Delivery Partner</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rahul Kumar"
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210"
              value={newPhone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <TouchableOpacity 
              style={[styles.saveBtn, (!newName || !newPhone) && styles.saveBtnDisabled]}
              onPress={handleAddPartner}
              disabled={!newName || !newPhone}
            >
              <Text style={styles.saveBtnText}>Add Partner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Remove Delivery Partner</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to remove {partnerToDelete?.name}? This action cannot be undone.
            </Text>
            
            <View style={styles.confirmActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={() => {
                  if (partnerToDelete) {
                    removeDeliveryPartner(partnerToDelete.id);
                  }
                  setDeleteModalVisible(false);
                  setPartnerToDelete(null);
                }}
              >
                <Text style={styles.confirmBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
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
  addBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  list: { padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  phone: {
    fontSize: 14,
    color: colors.mutedText,
    marginLeft: 6
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700'
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingVertical: 12
  },
  statBox: {
    flex: 1,
    alignItems: 'center'
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border
  },
  statLabel: {
    fontSize: 12,
    color: colors.mutedText,
    marginBottom: 4
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  closeText: { fontSize: 16, color: colors.mutedText, fontWeight: '500' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: colors.background },
  saveBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  confirmModalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 16,
    color: colors.mutedText,
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  }
});
