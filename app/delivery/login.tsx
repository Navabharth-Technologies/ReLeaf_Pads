import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { Truck, ArrowLeft } from 'lucide-react-native';

export default function DeliveryLoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const { loginDeliveryPartner } = useStore();

  const handlePhoneChange = (text: string) => {
    // Keep numbers only, allow up to 12 digits (handles +91 or standard phone numbers)
    const numbersOnly = text.replace(/[^0-9]/g, '');
    if (numbersOnly.length > 12) return;
    setPhone(numbersOnly);
  };

  const handleLogin = () => {
    const raw = phone.trim();
    if (!raw) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    const success = loginDeliveryPartner(raw);
    if (success) {
      router.replace('/delivery');
    } else {
      Alert.alert('Login Failed', 'Delivery partner not found. Use Demo button or enter 9876543210.');
    }
  };

  const handleDemoLogin = () => {
    setPhone('9876543210');
    loginDeliveryPartner('9876543210');
    router.replace('/delivery');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
              placeholder="Enter phone number (e.g. 9876543210)"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              autoCapitalize="none"
              placeholderTextColor={colors.mutedText}
              maxLength={12}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>DEMO / APP REVIEW</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
              <Text style={styles.demoButtonText}>One-Click Demo Login</Text>
            </TouchableOpacity>
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
    paddingBottom: 40,
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
    marginBottom: 20,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 11,
    color: colors.mutedText,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  demoButton: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
