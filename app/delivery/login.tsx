import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { Truck, ArrowLeft } from 'lucide-react-native';

export default function DeliveryLoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const { loginDeliveryPartner, deliveryPartners } = useStore();

  const handlePhoneChange = (text: string) => {
    // 1. Remove non-numeric characters
    const numbersOnly = text.replace(/[^0-9]/g, '');
    
    if (numbersOnly.length === 0) {
      setPhone(numbersOnly);
      return;
    }
    
    // 2. Enforce 10 digits max
    if (numbersOnly.length > 10) return;
    
    // 3. First digit must be 6, 7, 8, or 9
    if (!/^[6-9]/.test(numbersOnly[0])) return;
    
    // 4. No more than 3 continuous same digits
    if (/(.)\1{3,}/.test(numbersOnly)) return;
    
    setPhone(numbersOnly);
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

  const handleLogin = () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    const validation = validatePhone(phone);
    if (!validation.valid) {
      Alert.alert('Invalid Phone Number', validation.message);
      return;
    }

    const success = loginDeliveryPartner(phone.trim());
    if (success) {
      router.replace('/delivery');
    } else {
      Alert.alert('Login Failed', 'Delivery partner not found. Try +91 98765 43210 for Demo.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
          <ArrowLeft color={colors.text} size={24} />
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Truck size={48} color={colors.primary} />
          </View>
          
          <Text style={styles.title}>Delivery Partner Login</Text>
          <Text style={styles.subtitle}>Sign in to manage your deliveries</Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              autoCapitalize="none"
              placeholderTextColor={colors.mutedText}
              maxLength={10}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.demoHint}>
              <Text style={styles.demoHintTitle}>Demo Accounts:</Text>
              {deliveryPartners.map(dp => (
                <TouchableOpacity key={dp.id} onPress={() => {
                  const numbersOnly = dp.phone.replace(/[^0-9]/g, '');
                  const phone10 = numbersOnly.length > 10 && numbersOnly.startsWith('91') ? numbersOnly.slice(2) : numbersOnly;
                  setPhone(phone10.slice(0, 10));
                }}>
                  <Text style={styles.demoHintText}>{dp.name}: {dp.phone}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.darkPurple,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: colors.white,
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  demoHint: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoHintTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  demoHintText: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
    paddingVertical: 4,
  },
});
