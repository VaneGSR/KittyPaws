import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useKittyStore } from '../../../store/kittyStore';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function PostAdoptionTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // petId

  const pet = useKittyStore(state => state.pets.find(p => p.id === id));
  const updates = useKittyStore(state => state.updates.filter(u => u.petId === id));
  const currentUser = useKittyStore(state => state.currentUser);
  const addPostAdoptionUpdate = useKittyStore(state => state.addPostAdoptionUpdate);

  // Form states (para crear nuevo reporte de seguimiento)
  const [newReportText, setNewReportText] = useState('');
  const [reportImage, setReportImage] = useState<string | null>(null);
  const [timeLabel, setTimeLabel] = useState('3 meses'); // default label
  const [isPublic, setIsPublic] = useState(true);

  if (!pet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No se encontró la mascota.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Verificar si el usuario actual es el adoptante de este animal para permitirle publicar reportes
  const isAdopter = pet.status === 'adoptado' && pet.adopterId === currentUser?.id;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });

    if (!result.canceled && result.assets[0].uri) {
      setReportImage(result.assets[0].uri);
    }
  };

  const handlePublishReport = () => {
    if (!newReportText.trim()) {
      Alert.alert('Error', 'Por favor describe cómo se encuentra la mascota.');
      return;
    }

    addPostAdoptionUpdate({
      petId: pet.id,
      petName: pet.name,
      updaterId: currentUser?.id || 'demo_user',
      updaterName: currentUser?.fullName || 'Adoptante Satisfecho',
      updaterAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      description: newReportText,
      images: reportImage ? [reportImage] : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'], // default dog fallback
      timeLabel: timeLabel,
      isPublic: isPublic
    });

    // Resetear form
    setNewReportText('');
    setReportImage(null);
    Alert.alert('¡Reporte guardado! 🎉', 'Tu actualización se ha añadido a la línea de tiempo y se publicó en el feed.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Línea de Tiempo: {pet.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner Mascota */}
        <View style={styles.bannerCard}>
          <Image source={{ uri: pet.images[0] }} style={styles.bannerImage} />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>💝 ¡Vida feliz de {pet.name}!</Text>
            <Text style={styles.bannerSubtitle}>Seguimiento del proceso de post-adopción</Text>
          </View>
        </View>

        {/* Creador de Reporte (Solo si es el adoptante oficial) */}
        {isAdopter && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📸 Reportar Estado de Mascota</Text>
            <Text style={styles.cardSubtitle}>Comparte fotos y dinos cómo se adapta a su nuevo hogar.</Text>

            <Text style={styles.label}>Hito de tiempo</Text>
            <View style={styles.labelsRow}>
              {['1 mes', '3 meses', '6 meses', '1 año', 'Hito libre'].map(lbl => (
                <TouchableOpacity 
                  key={lbl} 
                  style={[styles.timeChip, timeLabel === lbl && styles.activeTimeChip]}
                  onPress={() => setTimeLabel(lbl)}
                >
                  <Text style={[styles.timeChipText, timeLabel === lbl && { color: Colors.white }]}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>¿Qué tal le va?</Text>
            <TextInput 
              style={styles.textArea}
              placeholder="Ej: Milo está súper feliz. Ya aprendió a dar la pata y le encanta jugar en el jardín."
              multiline
              numberOfLines={4}
              value={newReportText}
              onChangeText={setNewReportText}
            />

            {/* Subir foto */}
            <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
              {reportImage ? (
                <Image source={{ uri: reportImage }} style={styles.selectedReportImage} />
              ) : (
                <View style={styles.imagePlaceholderContent}>
                  <Ionicons name="camera" size={32} color={Colors.textSecondary} />
                  <Text style={styles.imagePlaceholderText}>Añadir foto de actualización</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Publicar en social feed toggle */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>¿Compartir con la comunidad?</Text>
                <Text style={styles.toggleDesc}>Si se activa, el post aparecerá en el feed de inicio.</Text>
              </View>
              <TouchableOpacity 
                style={[styles.smallToggle, isPublic && styles.activeSmallToggle]}
                onPress={() => setIsPublic(!isPublic)}
              >
                <Text style={[styles.smallToggleText, isPublic && { color: Colors.white }]}>
                  {isPublic ? 'Sí' : 'No'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.publishBtn} onPress={handlePublishReport}>
              <Text style={styles.publishBtnText}>Publicar Reporte</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LÍNEA DE TIEMPO */}
        <Text style={styles.timelineSectionTitle}>Hitos del Seguimiento ({updates.length})</Text>

        {updates.length === 0 ? (
          <View style={styles.emptyTimeline}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textSecondary} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyTimelineText}>No hay actualizaciones registradas en la línea de tiempo aún.</Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {updates.map((up, idx) => (
              <View key={up.id} style={styles.timelineItem}>
                {/* Indicador de la línea */}
                <View style={styles.timelineLeftColumn}>
                  <View style={styles.timelineDot}>
                    <Ionicons name="heart" size={12} color={Colors.white} />
                  </View>
                  {idx < updates.length - 1 && <View style={styles.timelineLine} />}
                </View>

                {/* Tarjeta del hito */}
                <View style={styles.timelineCard}>
                  <View style={styles.timelineCardHeader}>
                    <Text style={styles.timelineTimeLabel}>Hito: {up.timeLabel}</Text>
                    <Text style={styles.timelineDate}>
                      {new Date(up.createdAt).toLocaleDateString('es-MX')}
                    </Text>
                  </View>

                  <Text style={styles.timelineDesc}>{up.description}</Text>

                  {up.images && up.images.length > 0 && (
                    <Image source={{ uri: up.images[0] }} style={styles.timelineImage} />
                  )}

                  <View style={styles.timelineFooter}>
                    <Text style={styles.updaterLabel}>Subido por: {up.updaterName}</Text>
                    <View style={styles.socialStats}>
                      <Ionicons name="heart" size={14} color={Colors.accent} />
                      <Text style={styles.socialStatsText}>{up.likes} likes</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
  topBar: {
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
  topBarTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  bannerCard: {
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(61, 28, 46, 0.4)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  bannerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: Colors.white,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
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
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 15,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 10,
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  timeChip: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  activeTimeChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  timeChipText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
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
    marginBottom: 15,
  },
  imageSelector: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  selectedReportImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholderContent: {
    alignItems: 'center',
    gap: 6,
  },
  imagePlaceholderText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    paddingTop: 15,
  },
  toggleLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: Colors.text,
  },
  toggleDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  smallToggle: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeSmallToggle: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  smallToggleText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  publishBtn: {
    backgroundColor: Colors.accent,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.white,
  },
  timelineSectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.text,
    marginTop: 15,
    marginBottom: 15,
  },
  emptyTimeline: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  emptyTimelineText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  timelineContainer: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeftColumn: {
    width: 30,
    alignItems: 'center',
    position: 'relative',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: Colors.primary,
    top: 20,
    bottom: -20,
    left: 9,
    zIndex: 1,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineTimeLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: Colors.accent,
  },
  timelineDate: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  timelineDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
    marginBottom: 10,
  },
  timelineImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  timelineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    paddingTop: 8,
  },
  updaterLabel: {
    fontFamily: 'Lato_400Regular',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  socialStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialStatsText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
