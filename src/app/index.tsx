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
      
      <View style={styles.creditsContainer}>
        <Text style={styles.creditsTitle}>Desarrollado para fines académicos</Text>
        
        <View style={styles.studentContainer}>
          <Text style={styles.studentName}>Saavedra Ramírez Vanessa Guadalupe</Text>
          <Text style={styles.studentName}>Cerpa Rodríguez Perla Esmeralda</Text>
        </View>

        <View style={styles.courseContainer}>
          <Text style={styles.courseDetail}>
            <Text style={styles.boldLabel}>Profesor: </Text>Gutiérrez Cobián Zeus Emanuel
          </Text>
          <Text style={styles.courseDetail}>
            <Text style={styles.boldLabel}>Materia: </Text>Desarrollo de aplicaciones web en la nube
          </Text>
        </View>
      </View>
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
  creditsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.12)', // Sutil borde púrpura
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  creditsTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    textAlign: 'center',
  },
  studentContainer: {
    alignItems: 'center',
    marginBottom: 10,
    gap: 2,
  },
  studentName: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: Colors.text,
    textAlign: 'center',
  },
  courseContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(138, 43, 226, 0.08)',
    paddingTop: 10,
    width: '100%',
    alignItems: 'center',
    gap: 3,
  },
  courseDetail: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  boldLabel: {
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
});
