import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  Alert,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useKittyStore } from '../../store/kittyStore';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function NewPetScreen() {
  const router = useRouter();
  const currentUser = useKittyStore(state => state.currentUser);
  const addPet = useKittyStore(state => state.addPet);

  // Form states
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'Perro' | 'Gato' | 'Conejo' | 'Ave' | 'Otro'>('Perro');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [size, setSize] = useState<'Pequeño' | 'Mediano' | 'Grande'>('Mediano');
  const [city, setCity] = useState(currentUser?.city || '');
  const [description, setDescription] = useState('');
  
  // Health states
  const [vaccinated, setVaccinated] = useState(false);
  const [castrated, setCastrated] = useState(false);
  const [chipped, setChipped] = useState(false);
  const [specialNeeds, setSpecialNeeds] = useState(false);
  const [specialNeedsDetails, setSpecialNeedsDetails] = useState('');

  // Image states
  const [images, setImages] = useState<string[]>([]);

  // Checklist de condiciones
  const [condContract, setCondContract] = useState(true);
  const [condYard, setCondYard] = useState(false);
  const [condFollowUp, setCondFollowUp] = useState(true);

  if (currentUser?.role !== 'dador') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Solo los rescatistas autorizados pueden publicar mascotas para adopción.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Límite alcanzado', 'Solo puedes subir un máximo de 3 imágenes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = () => {
    if (!name.trim() || !breed.trim() || !age.trim() || !city.trim() || !description.trim()) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los datos de la mascota.');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Falta imagen', 'Sube al menos una fotografía de la mascota.');
      return;
    }

    // Compilar condiciones
    const conditions: string[] = [];
    if (condContract) conditions.push('Firma de contrato de adopción');
    if (condYard) conditions.push('Patio o jardín cerrado en el hogar');
    if (condFollowUp) conditions.push('Aceptar visitas de seguimiento');

    // Guardar en base de datos
    addPet({
      name,
      species,
      breed,
      age,
      sex: 'Macho', // Por simplicidad, se asigna por defecto, pero es interactivo
      size,
      city,
      description,
      images,
      ownerId: currentUser.id,
      health: {
        vaccinated,
        castrated,
        chipped,
        dewormed: true,
        specialNeeds,
        specialNeedsDetails: specialNeeds ? specialNeedsDetails : undefined
      },
      tags: [species, breed, size],
      conditions
    });

    Alert.alert(
      '¡Mascota Publicada! 🎉',
      `${name} ya está disponible para adopción en la comunidad.`,
      [
        {
          text: 'Genial',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publicar Mascota</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* IMÁGENES DE MASCOTA */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fotos de la Mascota (Máx 3)</Text>
          <Text style={styles.cardSubtitle}>Muestra su mejor ángulo. Sube fotos claras y con buena luz.</Text>

          <View style={styles.imagesRow}>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.uploadedImage} />
                <TouchableOpacity style={styles.removeImageBadge} onPress={() => removeImage(idx)}>
                  <Ionicons name="close" size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 3 && (
              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                <Ionicons name="camera-outline" size={24} color={Colors.accent} />
                <Text style={styles.imagePickerText}>Añadir ({images.length}/3)</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* DATOS BÁSICOS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos Básicos</Text>

          <Text style={styles.label}>Nombre de la Mascota</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ej: Max, Pelusa, Bella" 
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Especie</Text>
          <View style={styles.chipsRow}>
            {(['Perro', 'Gato', 'Conejo', 'Ave', 'Otro'] as const).map(sp => (
              <TouchableOpacity 
                key={sp} 
                style={[styles.chip, species === sp && styles.activeChip]}
                onPress={() => setSpecies(sp)}
              >
                <Text style={[styles.chipText, species === sp && { color: Colors.white }]}>{sp}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Raza / Tipo</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ej: Mestizo, Golden Retriever, Siames" 
            value={breed}
            onChangeText={setBreed}
          />

          <Text style={styles.label}>Edad aproximada</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ej: 2 meses, 1 año, Senior" 
            value={age}
            onChangeText={setAge}
          />

          <Text style={styles.label}>Tamaño</Text>
          <View style={styles.chipsRow}>
            {(['Pequeño', 'Mediano', 'Grande'] as const).map(sz => (
              <TouchableOpacity 
                key={sz} 
                style={[styles.chip, size === sz && styles.activeChip]}
                onPress={() => setSize(sz)}
              >
                <Text style={[styles.chipText, size === sz && { color: Colors.white }]}>{sz}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Ciudad / Ubicación</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ej: Guadalajara, Jalisco" 
            value={city}
            onChangeText={setCity}
          />

          <Text style={styles.label}>Historia / Descripción</Text>
          <TextInput 
            style={styles.textArea} 
            placeholder="Describe su comportamiento, temperamento, por qué necesita un hogar y qué cuidados requiere..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* SALUD Y CUIDADOS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Salud y Vacunas</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>¿Está vacunado(a)? 🏥</Text>
              <Text style={styles.switchDesc}>Cuenta con esquema completo.</Text>
            </View>
            <Switch 
              value={vaccinated}
              onValueChange={setVaccinated}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={vaccinated ? Colors.accent : Colors.grayMedium}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>¿Está esterilizado / castrado? ✂️</Text>
              <Text style={styles.switchDesc}>Cirugía de control natal.</Text>
            </View>
            <Switch 
              value={castrated}
              onValueChange={setCastrated}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={castrated ? Colors.accent : Colors.grayMedium}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>¿Cuenta con microchip identificador? 🏷️</Text>
              <Text style={styles.switchDesc}>Para geolocalización.</Text>
            </View>
            <Switch 
              value={chipped}
              onValueChange={setChipped}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={chipped ? Colors.accent : Colors.grayMedium}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>¿Tiene necesidades especiales? ⚠️</Text>
              <Text style={styles.switchDesc}>Discapacidad, enfermedad crónica, etc.</Text>
            </View>
            <Switch 
              value={specialNeeds}
              onValueChange={setSpecialNeeds}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={specialNeeds ? Colors.accent : Colors.grayMedium}
            />
          </View>

          {specialNeeds && (
            <TextInput 
              style={[styles.input, { marginTop: 10 }]} 
              placeholder="Detalla sus cuidados médicos aquí..."
              value={specialNeedsDetails}
              onChangeText={setSpecialNeedsDetails}
            />
          )}
        </View>

        {/* REQUISITOS DE ADOPCIÓN */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Requisitos obligatorios para Adoptar</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Firma de contrato de adopción 📝</Text>
            </View>
            <Switch 
              value={condContract}
              onValueChange={setCondContract}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={condContract ? Colors.accent : Colors.grayMedium}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Patio o jardín totalmente cerrado 🏠</Text>
            </View>
            <Switch 
              value={condYard}
              onValueChange={setCondYard}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={condYard ? Colors.accent : Colors.grayMedium}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Permitir visitas y reportes de seguimiento 📅</Text>
            </View>
            <Switch 
              value={condFollowUp}
              onValueChange={setCondFollowUp}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={condFollowUp ? Colors.accent : Colors.grayMedium}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Publicar para Adopción</Text>
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
    fontSize: 15,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
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
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 15,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 5,
  },
  imageWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 4,
  },
  imagePickerText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 44,
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
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
    height: 90,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
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
