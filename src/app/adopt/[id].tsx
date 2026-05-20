import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKittyStore } from '../../store/kittyStore';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function AdoptRequestScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // petId

  const pets = useKittyStore(state => state.pets);
  const pet = pets.find(p => p.id === id);
  const currentUser = useKittyStore(state => state.currentUser);
  const submitAdoptionRequest = useKittyStore(state => state.submitAdoptionRequest);
  const updateVerificationStatus = useKittyStore(state => state.updateVerificationStatus);

  // Form states
  const [presentation, setPresentation] = useState('');
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [hasGarden, setHasGarden] = useState(false);
  const [hoursAlone, setHoursAlone] = useState('2');

  if (!pet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Mascota no encontrada.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Inicia sesión para solicitar una adopción.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/login')}>
          <Text style={styles.backBtnText}>Ir al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSimulateVerification = () => {
    updateVerificationStatus(currentUser.id, 'verified');
    Alert.alert('Verificado ✅', 'Tus documentos han sido aprobados para la simulación.');
  };

  const handleSubmit = () => {
    if (currentUser.verified !== 'verified') {
      Alert.alert(
        'Identidad no verificada 📋',
        'Por seguridad de los animales, debes contar con identidad verificada antes de continuar.',
        [
          { text: 'Verificar en Perfil', onPress: () => {
            router.dismissAll();
            router.push('/(tabs)/profile');
          }},
          { text: 'Simular Aprobación de Docs (Demo)', onPress: handleSimulateVerification },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
      return;
    }

    if (!presentation.trim()) {
      Alert.alert('Error', 'Por favor redacta un mensaje de presentación.');
      return;
    }

    const hours = parseInt(hoursAlone, 10);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      Alert.alert('Error', 'Ingresa un número de horas válido (0-24).');
      return;
    }

    // Guardar solicitud
    submitAdoptionRequest({
      petId: pet.id,
      petName: pet.name,
      petImage: pet.images[0],
      requesterId: currentUser.id,
      requesterName: currentUser.fullName,
      requesterAvatar: currentUser.avatar,
      ownerId: pet.ownerId,
      ownerName: pet.ownerId === 'u1' ? 'Rescate Patitas Gdl' : 'Rescatista',
      ownerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      presentationMessage: presentation,
      hasOtherPets,
      hasChildren,
      hasGarden,
      hoursAlone: hours
    });

    Alert.alert(
      'Solicitud Enviada 🐾',
      'Tu solicitud de adopción ha sido registrada. Se ha creado un canal de chat con el dador para coordinar.',
      [
        {
          text: 'Ir al Chat',
          onPress: () => {
            router.dismissAll();
            router.push('/(tabs)/adopt');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitud de Adopción</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Mascota en adopción */}
        <View style={styles.petSummaryCard}>
          <Image source={{ uri: pet.images[0] }} style={styles.petImage} />
          <View style={styles.petInfo}>
            <Text style={styles.petName}>Adoptar a {pet.name}</Text>
            <Text style={styles.petDetails}>{pet.breed} • {pet.age} • {pet.city}</Text>
          </View>
        </View>

        {/* Verificación de documentos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Estado de Verificación</Text>
          {currentUser.verified === 'verified' ? (
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
              <Text style={styles.verifiedText}>Identidad verificada correctamente. ¡Listo para adoptar!</Text>
            </View>
          ) : (
            <View style={styles.unverifiedRow}>
              <Ionicons name="warning" size={22} color={Colors.error} />
              <View style={{ flex: 1 }}>
                <Text style={styles.unverifiedTitle}>Identidad pendiente de verificar</Text>
                <Text style={styles.unverifiedDesc}>
                  Sube tus documentos en tu perfil, o presiona abajo para auto-aprobarte para esta demostración.
                </Text>
                <TouchableOpacity style={styles.quickVerifyBtn} onPress={handleSimulateVerification}>
                  <Text style={styles.quickVerifyText}>Auto-Verificar Ahora (Simulación)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Formulario */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Cuestionario de Adopción</Text>
          
          <Text style={styles.label}>Mensaje de presentación</Text>
          <TextInput 
            style={styles.textArea}
            placeholder="Cuéntale al rescatista sobre ti: ¿por qué quieres adoptar a esta mascota? ¿dónde vivirá? ¿cómo es tu rutina?"
            multiline
            numberOfLines={4}
            value={presentation}
            onChangeText={setPresentation}
          />

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>¿Tienes otras mascotas en casa?</Text>
              <Text style={styles.switchDesc}>Perros, gatos, etc.</Text>
            </View>
            <Switch 
              value={hasOtherPets}
              onValueChange={setHasOtherPets}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={hasOtherPets ? Colors.accent : Colors.grayMedium}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>¿Viven niños pequeños en tu hogar?</Text>
              <Text style={styles.switchDesc}>Menores de 12 años.</Text>
            </View>
            <Switch 
              value={hasChildren}
              onValueChange={setHasChildren}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={hasChildren ? Colors.accent : Colors.grayMedium}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>¿Cuentas con patio o jardín cerrado?</Text>
              <Text style={styles.switchDesc}>Para esparcimiento seguro.</Text>
            </View>
            <Switch 
              value={hasGarden}
              onValueChange={setHasGarden}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={hasGarden ? Colors.accent : Colors.grayMedium}
            />
          </View>

          <Text style={styles.label}>¿Cuántas horas al día pasará sola la mascota?</Text>
          <View style={styles.hoursInputRow}>
            <TextInput 
              style={styles.hoursInput}
              keyboardType="number-pad"
              value={hoursAlone}
              onChangeText={setHoursAlone}
              maxLength={2}
            />
            <Text style={styles.hoursSuffix}>horas al día</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Enviar Solicitud de Adopción</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  backBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backIconButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  petSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  petDetails: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.text,
    marginBottom: 15,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
  },
  verifiedText: {
    flex: 1,
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: '#2E7D32',
  },
  unverifiedRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 12,
  },
  unverifiedTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#C62828',
    marginBottom: 2,
  },
  unverifiedDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: '#C62828',
    lineHeight: 15,
    marginBottom: 10,
  },
  quickVerifyBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  quickVerifyText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: Colors.white,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 10,
  },
  textArea: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.text,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  switchText: {
    flex: 1,
    paddingRight: 10,
  },
  switchLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: Colors.text,
  },
  switchDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hoursInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 5,
  },
  hoursInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 60,
    height: 40,
    textAlign: 'center',
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.text,
  },
  hoursSuffix: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 40,
  },
  submitBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.white,
  },
});
