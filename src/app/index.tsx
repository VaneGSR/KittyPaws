import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useKittyStore } from '../store/kittyStore';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const currentUser = useKittyStore(state => state.currentUser);
  
  // Animation ref
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Redirigir al Feed si ya hay una sesión activa
    if (currentUser) {
      router.replace('/(tabs)/feed');
    }
  }, [currentUser]);

  useEffect(() => {
    // Animación cíclica de la patita (latido)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  if (currentUser) {
    return null; // Esperando la redirección
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroContainer}>
        {/* Patita animada */}
        <Animated.View style={[styles.pawContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.pawEmoji}>🐾</Text>
        </Animated.View>

        {/* Logo */}
        <Text style={styles.logoText}>KittyPaws</Text>
        
        {/* Tagline */}
        <Text style={styles.taglineText}>"Cada patita merece un hogar"</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.loginButton} 
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton} 
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.registerButtonText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footerText}>Desarrollado para fines académicos por Vanessa & Perla</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pawContainer: {
    backgroundColor: Colors.white,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 30,
  },
  pawEmoji: {
    fontSize: 55,
  },
  logoText: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 48,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  taglineText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.white,
  },
  registerButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  registerButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.text,
  },
  footerText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    opacity: 0.6,
  },
});
