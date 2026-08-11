import React from 'react';
import { View, Text, StyleSheet, FlatList, Switch, TouchableOpacity, Modal, TextInput, Image } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { Plus, Minus, ArrowLeft, ImagePlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Product } from '../../src/store/types';

export default function OwnerProductsScreen() {
  const router = useRouter();
  const { products, toggleProductStock, toggleProductActive, updateProductStock, addProduct } = useStore();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [stock, setStock] = React.useState('');
  const [imageUri, setImageUri] = React.useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddProduct = () => {
    if (name.trim() && price.trim() && stock.trim()) {
      addProduct({
        name,
        sellingPrice: Number(price) || 0,
        mrp: Number(price) + 20, // Add arbitrary MRP difference
        stock: Number(stock) || 0,
        packSize: '1',
        imageUrl: imageUri || undefined,
      });
      setName('');
      setPrice('');
      setStock('');
      setImageUri(null);
      setModalVisible(false);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    let stockColor = colors.primary;
    if (item.stockStatus === 'OUT_OF_STOCK') stockColor = 'red';
    else if (item.stockStatus === 'LOW_STOCK') stockColor = 'orange';

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.imagePlaceholder} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: item.imageFallback }]} />
          )}
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>₹{item.sellingPrice}</Text>
            
            <View style={styles.salesInfo}>
              <Text style={styles.salesText}>Sold: {item.totalSold}</Text>
              <Text style={[styles.statusText, { color: stockColor }]}>
                {item.stockStatus.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBottom}>
          <View style={styles.stockControl}>
            <Text style={styles.controlLabel}>Stock: {item.stock}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateProductStock(item.id, -1)}>
                <Minus size={16} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateProductStock(item.id, 1)}>
                <Plus size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.activeControl}>
            <Text style={styles.controlLabel}>Active</Text>
            <Switch 
              value={item.active} 
              onValueChange={() => toggleProductActive(item.id)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
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
        <Text style={styles.headerTitle}>Products Inventory</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Product</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Product Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Regular Flow Pads"
              value={name}
              onChangeText={setName}
            />

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Selling Price (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 199"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Initial Stock</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 50"
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.imagePickerContainer}>
              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                <ImagePlus size={20} color={colors.primary} />
                <Text style={styles.imagePickerText}>{imageUri ? 'Change Image' : 'Add Image'}</Text>
              </TouchableOpacity>
              {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              )}
            </View>

            <TouchableOpacity  
              style={[styles.saveBtn, (!name || !price || !stock) && styles.saveBtnDisabled]}
              onPress={handleAddProduct}
              disabled={!name || !price || !stock}
            >
              <Text style={styles.saveBtnText}>Add Product</Text>
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
    borderColor: colors.border 
  },
  cardTop: {
    flexDirection: 'row',
    padding: 16,
  },
  imagePlaceholder: { width: 70, height: 70, borderRadius: 8, marginRight: 12 },
  info: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  price: { fontSize: 14, color: colors.darkPurple, fontWeight: '600', marginBottom: 8 },
  salesInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  salesText: { fontSize: 13, color: colors.mutedText },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.background,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  stockControl: { flexDirection: 'row', alignItems: 'center' },
  controlLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginRight: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  stepBtn: { padding: 8 },
  activeControl: { flexDirection: 'row', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  closeText: { fontSize: 16, color: colors.mutedText, fontWeight: '500' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: colors.background },
  imagePickerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 16 },
  imagePickerBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.white },
  imagePickerText: { color: colors.primary, fontWeight: '600', marginLeft: 8 },
  previewImage: { width: 48, height: 48, borderRadius: 8 },
  saveBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' }
});
