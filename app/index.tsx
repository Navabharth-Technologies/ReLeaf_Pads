import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../src/theme/colors';
import { useStore } from '../src/store/useStore';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { resetDemo } = useStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Image 
              source={require('../assets/logo.png')} 
              style={{ width: 180, height: 180 }} 
              resizeMode="contain"
            />
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.buttonPrimary} 
            onPress={() => {
              resetDemo();
              router.push('/customer');
            }}
          >
            <Text style={styles.buttonTextPrimary}>Continue as Customer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.buttonPrimary} 
            onPress={() => {
              router.push('/owner');
            }}
          >
            <Text style={styles.buttonTextPrimary}>Continue as Owner</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buttonPrimary} 
            onPress={() => {
              router.push('/delivery/login');
            }}
          >
            <Text style={styles.buttonTextPrimary}>Continue as Delivery Partner</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.darkPurple,
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonTextPrimary: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  }
});
