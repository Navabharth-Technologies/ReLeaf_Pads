import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { colors } from '../../src/theme/colors';
import { MapPin, Navigation } from 'lucide-react-native';
import { useStore } from '../../src/store/useStore';
import Map from '../../src/components/Map';

export default function LocationScreen() {
  const router = useRouter();
  const { setSelectedLocation } = useStore();
  const { pincode } = useLocalSearchParams<{ pincode: string }>();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Finding your current location...');
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const [detectedAddress, setDetectedAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const fetchAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      setIsGeocoding(true);

      // Web Fallback: expo-location reverse geocoding is not supported on web
      if (Platform.OS === 'web') {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            setDetectedAddress({
              city: data.address.city || data.address.town || data.address.village || 'Mysore',
              district: data.address.suburb || data.address.neighbourhood || data.address.residential || '',
              street: data.address.road || '',
              name: data.address.amenity || data.address.building || data.address.shop || '',
              region: data.address.state || 'Karnataka',
              country: data.address.country || 'India',
              postalCode: data.address.postcode || pincode || '570001',
              isoCountryCode: data.address.country_code?.toUpperCase() || 'IN',
              timezone: 'Asia/Kolkata',
              subregion: data.address.county || data.address.state_district || 'Mysore'
            } as any);
          }
        } catch (err) {
          console.warn('OSM Reverse geocoding failed', err);
        }
        setIsGeocoding(false);
        return;
      }

      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result && result.length > 0) {
        setDetectedAddress(result[0]);
      }
      setIsGeocoding(false);
    } catch (e) {
      console.warn('Reverse geocode failed', e);
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location access is unavailable.');
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        setSelectedCoords({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });
        await fetchAddressFromCoords(currentLocation.coords.latitude, currentLocation.coords.longitude);
        setLoadingMsg('Location detected ✓');
        setTimeout(() => setLoading(false), 800);
      } catch (error) {
        setErrorMsg('We couldn\'t detect your location right now.');
        setLoading(false);
      }
    })();
  }, []);

  const handleRecenter = async () => {
    if (!location) return;
    setSelectedCoords({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });
    fetchAddressFromCoords(location.coords.latitude, location.coords.longitude);
  };

  const confirmLocation = () => {
    if (selectedCoords && pincode) {
      const state = useStore.getState();
      const currentCustomer = state.currentCustomer;
      const tempCustomer = state.tempCustomer;
      
      const name = currentCustomer?.name || tempCustomer?.name || 'Customer';
      const phone = currentCustomer?.phone || tempCustomer?.phone || '';
      
      const detectedStreet = detectedAddress?.street || detectedAddress?.name || 'Current Location';
      const detectedArea = detectedAddress?.district || detectedAddress?.subregion || detectedAddress?.city || 'Unknown Area';
      
      let existingAddress = currentCustomer?.addresses?.find((a: any) => 
        a.street === detectedStreet && 
        a.area === detectedArea &&
        a.pincode === pincode
      );

      let finalAddress = existingAddress;

      if (!existingAddress) {
        finalAddress = {
          id: `addr_${Date.now()}`,
          name: name,
          phone: phone,
          houseNumber: 'Current Location',
          buildingName: '',
          street: detectedStreet,
          area: detectedArea,
          landmark: '',
          city: detectedAddress?.city || 'Mysore',
          state: detectedAddress?.region || 'Karnataka',
          pincode: pincode,
          latitude: selectedCoords.latitude,
          longitude: selectedCoords.longitude,
          addressType: 'CURRENT_LOCATION'
        };

        if (!currentCustomer) {
          state.saveNewCustomer({ name, phone, addresses: [finalAddress], pincode });
        } else {
          state.addAddressToCustomer(currentCustomer.id, finalAddress);
        }
      }
      
      state.setCurrentAddress(finalAddress);
      state.setChatState('PAYMENT');
      router.replace('/customer');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{loadingMsg}</Text>
      </View>
    );
  }

  if (errorMsg && !selectedCoords) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Text style={styles.subErrorText}>Don't worry — you can enter your delivery location manually.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => {
          setSelectedLocation({ latitude: 12.2958, longitude: 76.6394, pincode: pincode || '570001' }); // Default Mysore
          router.push(`/customer/address-form`);
        }}>
          <Text style={styles.primaryBtnText}>Enter Location Manually</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Map Web Fallback Check
  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Confirm your delivery location</Text>
        <Text style={styles.headerSub}>We've detected your current location. Please confirm the location before continuing.</Text>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapWrapper}>
          {selectedCoords && (
            <Map
              style={styles.map}
              latitude={selectedCoords.latitude}
              longitude={selectedCoords.longitude}
              onRegionChangeComplete={(region: any) => {
                setSelectedCoords({
                  latitude: region.latitude,
                  longitude: region.longitude
                });
                fetchAddressFromCoords(region.latitude, region.longitude);
              }}
            />
          )}
          <TouchableOpacity style={styles.recenterBtn} onPress={handleRecenter}>
            <Navigation size={20} color={colors.darkPurple} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.locationHeaderRow}>
          <View style={styles.locationIconBlock}>
            <MapPin size={24} color={colors.primary} />
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.deliveryTitle}>Delivery location</Text>
            {isGeocoding ? (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.detectingText}>Fetching precise location...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.areaTitle} numberOfLines={1}>
                  {detectedAddress?.district || detectedAddress?.subregion || detectedAddress?.city || 'Mysore'}
                </Text>
                <Text style={styles.fullAddressText} numberOfLines={2}>
                  {detectedAddress?.name || detectedAddress?.street ? `${detectedAddress.name || detectedAddress.street}, ` : ''}
                  {detectedAddress?.district || detectedAddress?.subregion || detectedAddress?.city ? `${detectedAddress.district || detectedAddress.subregion || detectedAddress.city}, ` : ''}
                  {detectedAddress?.region || 'Karnataka'} {pincode}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.primaryBtn} onPress={confirmLocation}>
          <Text style={styles.primaryBtnText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, color: colors.text, fontWeight: '500' },
  errorText: { fontSize: 18, color: colors.darkPurple, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subErrorText: { fontSize: 15, color: colors.text, marginBottom: 24, textAlign: 'center' },
  header: { padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.darkPurple, marginBottom: 4 },
  headerSub: { fontSize: 14, color: colors.text },
  mapContainer: { flex: 1, backgroundColor: '#E2E8F0', position: 'relative' },
  mapWrapper: { flex: 1 },
  map: { width: '100%', height: '100%' },
  webFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  webFallbackText: { marginTop: 12, fontSize: 16, fontWeight: '600', color: colors.darkPurple },
  coordText: { marginTop: 8, fontSize: 14, color: colors.text },
  recenterBtn: { position: 'absolute', bottom: 20, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  bottomSheet: { padding: 24, backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 15 },
  locationHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  locationIconBlock: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.softPurple, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  locationTextContainer: { flex: 1 },
  deliveryTitle: { fontSize: 13, color: colors.mutedText, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  areaTitle: { fontSize: 20, fontWeight: '800', color: colors.darkPurple, marginBottom: 4 },
  fullAddressText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  detectingText: { fontSize: 15, color: colors.text, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 16 },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', width: '100%' },
  primaryBtnText: { color: colors.white, fontWeight: '800', fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
});
