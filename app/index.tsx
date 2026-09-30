import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../src/theme/colors';
import { useStore } from '../src/store/useStore';

export default function StoreSelectionScreen() {
  const router = useRouter();
  const { setAppStoreType } = useStore();

  const handleSelectStore = (storeType: 'PADS' | 'DIAPERS') => {
    setAppStoreType(storeType);
    router.push('/roles');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/logo.png')} 
            style={{ width: 150, height: 150, marginBottom: 20 }} 
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome to ReLeaf</Text>
          <Text style={styles.subtitle}>Please select a store to continue</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.buttonPrimary, { backgroundColor: '#8A7BB4' }]} 
            onPress={() => handleSelectStore('PADS')}
          >
            <Text style={styles.buttonTextPrimary}>ReLeaf Pads</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.buttonPrimary, { backgroundColor: '#5D9CEC' }]} 
            onPress={() => handleSelectStore('DIAPERS')}
          >
            <Text style={styles.buttonTextPrimary}>Nappee Diapers</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: colors.darkPurple, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.mutedText },
  buttonContainer: { width: '100%', maxWidth: 400, gap: 20 },
  buttonPrimary: {
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonTextPrimary: { color: colors.white, fontSize: 18, fontWeight: '700' }
});
