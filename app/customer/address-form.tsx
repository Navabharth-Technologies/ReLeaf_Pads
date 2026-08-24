import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { Address } from '../../src/store/types';

export default function AddressFormScreen() {
  const router = useRouter();
  const { currentCustomer, tempCustomer, selectedLocation, setCurrentAddress, saveNewCustomer, setChatState } = useStore();
  
  const [name, setName] = useState(currentCustomer?.name || tempCustomer?.name || '');
  const [phone, setPhone] = useState(currentCustomer?.phone || tempCustomer?.phone || '');
  const [houseNumber, setHouseNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState(tempCustomer?.pincode || '570001');
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    let valid = true;
    let newErrors: Record<string, string> = {};

    if (!name.trim()) { newErrors.name = 'Name is required'; valid = false; }
    if (!phone.trim()) { newErrors.phone = 'Phone number is required'; valid = false; }
    if (!houseNumber.trim()) { newErrors.houseNumber = 'Please enter your house or flat number.'; valid = false; }
    if (!street.trim()) { newErrors.street = 'Street is required'; valid = false; }
    if (!area.trim()) { newErrors.area = 'Area is required'; valid = false; }
    if (!/^\d{6}$/.test(pincode)) { newErrors.pincode = 'Valid 6-digit pincode is required'; valid = false; }

    setErrors(newErrors);
    return valid;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (validate()) {
      setIsSubmitting(true);
      
      let lat = selectedLocation?.latitude;
      let lon = selectedLocation?.longitude;

      // Ensure GPS coordinates are actually within Mysore limits
      // (in case the user is testing from Bangalore or another city)
      if (lat && lon) {
        if (!(lat >= 12.1 && lat <= 12.5 && lon >= 76.4 && lon <= 76.9)) {
          lat = undefined;
          lon = undefined;
        }
      }

      if (!lat || !lon) {
        try {
          // Strictly search within Mysore with all details to avoid generic area center coordinates
          const queryParts = [];
          if (buildingName) queryParts.push(buildingName.trim());
          if (street) queryParts.push(street.trim());
          queryParts.push(area.trim(), 'Mysore', 'Karnataka', pincode);
          const strictQuery = queryParts.join(', ');
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(strictQuery)}&format=json&limit=1`);
          const data = await res.json();
          if (data && data.length > 0) {
            const fetchedLat = parseFloat(data[0].lat);
            const fetchedLon = parseFloat(data[0].lon);
            
            // Strict Mysore Bounding Box check
            // Mysore is roughly bounded by Lat: 12.2 to 12.4, Lon: 76.5 to 76.8
            if (fetchedLat >= 12.1 && fetchedLat <= 12.5 && fetchedLon >= 76.4 && fetchedLon <= 76.9) {
              lat = fetchedLat;
              lon = fetchedLon;
            } else {
              // Discard coordinates if they point to Bangalore or somewhere else
              lat = undefined;
              lon = undefined;
            }
          }
        } catch (e) {
          console.warn('Strict geocoding failed', e);
        }
      }

      let existingAddress = currentCustomer?.addresses?.find((a: any) => 
        a.houseNumber.toLowerCase() === houseNumber.trim().toLowerCase() && 
        a.street.toLowerCase() === street.trim().toLowerCase() && 
        a.area.toLowerCase() === area.trim().toLowerCase() &&
        a.pincode === pincode
      );

      let finalAddress = existingAddress;

      if (!existingAddress) {
        finalAddress = {
          id: `addr_${Date.now()}`,
          name: name.trim(),
          phone: phone.trim(),
          houseNumber: houseNumber.trim(),
          buildingName: buildingName.trim(),
          street: street.trim(),
          area: area.trim(),
          landmark: landmark.trim(),
          city: 'Mysore',
          state: 'Karnataka',
          pincode: pincode,
          latitude: lat,
          longitude: lon,
          addressType
        };

        if (!currentCustomer) {
          saveNewCustomer({ name, phone, addresses: [finalAddress], pincode: finalAddress.pincode });
        } else {
          useStore.getState().addAddressToCustomer(currentCustomer.id, finalAddress);
        }
      }
      
      setCurrentAddress(finalAddress);
      setChatState('PAYMENT'); // Go directly to payment since location is confirmed
      setIsSubmitting(false);
      router.replace('/customer'); // Return to chat
    } else {
      if (Platform.OS !== 'web') {
        Alert.alert('Incomplete Address', 'Please fill in all required fields.');
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add delivery details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>FULL NAME *</Text>
          <TextInput style={[styles.input, errors.name && styles.inputError]} placeholder="Enter your name" value={name} onChangeText={setName} />
          {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>PHONE NUMBER *</Text>
          <TextInput style={[styles.input, errors.phone && styles.inputError]} placeholder="Enter mobile number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          {!!errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>HOUSE / FLAT / DOOR NUMBER *</Text>
          <TextInput style={[styles.input, errors.houseNumber && styles.inputError]} placeholder="Enter house, flat, or door number" value={houseNumber} onChangeText={setHouseNumber} />
          {!!errors.houseNumber && <Text style={styles.errorText}>{errors.houseNumber}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>BUILDING / APARTMENT NAME</Text>
          <TextInput style={styles.input} placeholder="Enter building or apartment name" value={buildingName} onChangeText={setBuildingName} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>STREET / ROAD *</Text>
          <TextInput style={[styles.input, errors.street && styles.inputError]} placeholder="Enter street or road" value={street} onChangeText={setStreet} />
          {!!errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>AREA / LOCALITY *</Text>
          <TextInput style={[styles.input, errors.area && styles.inputError]} placeholder="Enter area" value={area} onChangeText={setArea} />
          {!!errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>LANDMARK</Text>
          <TextInput style={styles.input} placeholder="Enter landmark (optional)" value={landmark} onChangeText={setLandmark} />
        </View>

        <View style={styles.row}>
           <View style={[styles.fieldGroup, {flex: 1, marginRight: 8}]}>
             <Text style={styles.label}>CITY</Text>
             <TextInput style={[styles.input, styles.disabledInput]} value="Mysore" editable={false} />
           </View>
           <View style={[styles.fieldGroup, {flex: 1, marginLeft: 8}]}>
             <Text style={styles.label}>STATE</Text>
             <TextInput style={[styles.input, styles.disabledInput]} value="Karnataka" editable={false} />
           </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>PINCODE *</Text>
          <TextInput 
            style={[styles.input, errors.pincode && styles.inputError]} 
            value={pincode} 
            onChangeText={setPincode}
            keyboardType="number-pad" 
            maxLength={6} 
          />
          {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>SAVE ADDRESS AS</Text>
          <View style={styles.typeContainer}>
            {['HOME', 'WORK', 'OTHER'].map(type => (
              <TouchableOpacity key={type} style={[styles.typeBtn, addressType === type && styles.typeBtnActive]} onPress={() => setAddressType(type as any)}>
                <Text style={[styles.typeBtnText, addressType === type && styles.typeBtnTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.previewContainer}>
          <Text style={styles.label}>DELIVERY ADDRESS PREVIEW</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewName}>{name || 'Your Name'}</Text>
            <Text style={styles.previewText}>{houseNumber ? `${houseNumber}, ` : ''}{buildingName ? `${buildingName}` : ''}</Text>
            <Text style={styles.previewText}>{street ? `${street}, ` : ''}{area ? `${area}` : ''}</Text>
            {landmark ? <Text style={styles.previewText}>{landmark}</Text> : null}
            <Text style={styles.previewText}>Mysore, Karnataka - {pincode}</Text>
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? (
             <ActivityIndicator color={colors.white} />
          ) : (
             <Text style={styles.primaryBtnText}>Confirm Address</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.darkPurple },
  scrollContent: { padding: 16, paddingBottom: 40 },
  fieldGroup: { marginBottom: 16 },
  row: { flexDirection: 'row' },
  label: { fontSize: 12, fontWeight: '600', color: colors.mutedText, marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: colors.text },
  inputError: { borderColor: 'red' },
  errorText: { color: 'red', fontSize: 12, marginTop: 4 },
  disabledInput: { backgroundColor: '#F3F4F6', color: colors.mutedText },
  typeContainer: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.white },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.softPurple },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: colors.text },
  typeBtnTextActive: { color: colors.primary },
  previewContainer: { marginTop: 8 },
  previewCard: { backgroundColor: colors.white, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  previewName: { fontSize: 15, fontWeight: '700', color: colors.darkPurple, marginBottom: 4 },
  previewText: { fontSize: 14, color: colors.text, marginBottom: 2 },
  previewPinText: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 8 },
  footer: { padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
