import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKittyStore } from '../../store/kittyStore';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import VerificationBadge from '../../components/VerificationBadge';

const { width } = Dimensions.get('window');

export default function AnimalProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const pet = useKittyStore(state => state.pets.find(p => p.id === id));
  const users = useKittyStore(state => state.users);
  const addCommentToPet = useKittyStore(state => state.addCommentToPet);
  const currentUser = useKittyStore(state => state.currentUser);

  const [commentText, setCommentText] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!pet) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontró la mascota 😿</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const owner = users.find(u => u.id === pet.ownerId);

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveImageIndex(slide);
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    addCommentToPet(pet.id, commentText);
    setCommentText('');
  };

  const handleAdoptPress = () => {
    if (pet.ownerId === currentUser?.id) {
      Alert.alert('¡Es tu publicación!', 'No puedes adoptar una mascota que tú mismo subiste.');
      return;
    }
    router.push(`/adopt/${pet.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Botón Flotante Regresar */}
      <TouchableOpacity style={styles.floatingBackBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* CAROUSEL DE IMÁGENES */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.carouselScroll}
          >
            {pet.images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.carouselImage} />
            ))}
          </ScrollView>
          
          {/* Indicadores de página */}
          {pet.images.length > 1 && (
            <View style={styles.dotsContainer}>
              {pet.images.map((_, idx) => (
                <View 
                  key={idx} 
                  style={[
                    styles.dot, 
                    activeImageIndex === idx && styles.activeDot
                  ]} 
                />
              ))}
            </View>
          )}
        </View>

        {/* CONTENIDO PRINCIPAL */}
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.petName}>🐾 {pet.name}</Text>
              <Text style={styles.petBreed}>{pet.breed} • {pet.age}</Text>
            </View>
            <View style={[styles.genderBadge, pet.sex === 'Hembra' ? styles.femaleBg : styles.maleBg]}>
              <Ionicons 
                name={pet.sex === 'Hembra' ? 'female' : 'male'} 
                size={16} 
                color={Colors.white} 
                style={{ marginRight: 4 }} 
              />
              <Text style={styles.genderText}>{pet.sex}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.locationText}>{pet.city}</Text>
          </View>

          {/* Grid de Características de Salud */}
          <View style={styles.healthGrid}>
            <View style={styles.healthItem}>
              <Text style={styles.healthEmoji}>📏</Text>
              <Text style={styles.healthTitle}>Tamaño</Text>
              <Text style={styles.healthVal}>{pet.size}</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthEmoji}>🏥</Text>
              <Text style={styles.healthTitle}>Vacunas</Text>
              <Text style={styles.healthVal}>{pet.health.vaccinated ? 'Completo' : 'No'}</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthEmoji}>✂️</Text>
              <Text style={styles.healthTitle}>Castrado</Text>
              <Text style={styles.healthVal}>{pet.health.castrated ? 'Sí' : 'No'}</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthEmoji}>🏷️</Text>
              <Text style={styles.healthTitle}>Microchip</Text>
              <Text style={styles.healthVal}>{pet.health.chipped ? 'Sí' : 'No'}</Text>
            </View>
          </View>

          {/* Special needs block if any */}
          {pet.health.specialNeeds && (
            <View style={styles.specialNeedsBox}>
              <Ionicons name="alert-circle" size={20} color={Colors.error} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.specialNeedsTitle}>Necesidades especiales</Text>
                <Text style={styles.specialNeedsDesc}>{pet.health.specialNeedsDetails || 'Requiere atención médica específica.'}</Text>
              </View>
            </View>
          )}

          {/* Personalidad */}
          <Text style={styles.sectionTitle}>Personalidad</Text>
          <View style={styles.chipsRow}>
            {pet.tags.filter(t => t !== 'liked').map((tag, idx) => (
              <View key={idx} style={styles.personalityChip}>
                <Text style={styles.personalityText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Historia */}
          <Text style={styles.sectionTitle}>Historia de {pet.name}</Text>
          <Text style={styles.descriptionText}>{pet.description}</Text>

          {/* Requisitos */}
          {pet.conditions && pet.conditions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Condiciones de Adopción</Text>
              {pet.conditions.map((cond, idx) => (
                <View key={idx} style={styles.conditionRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={Colors.accent} style={{ marginRight: 8 }} />
                  <Text style={styles.conditionText}>{cond}</Text>
                </View>
              ))}
            </>
          )}

          {/* Publicador */}
          {owner && (
            <TouchableOpacity 
              style={styles.ownerCard}
              activeOpacity={0.9}
              onPress={() => router.push(`/profile/${owner.id}`)}
            >
              <Image source={{ uri: owner.avatar }} style={styles.ownerAvatar} />
              <View style={{ flex: 1 }}>
                <View style={styles.ownerHeaderRow}>
                  <Text style={styles.ownerName}>{owner.fullName}</Text>
                  {owner.verified === 'verified' && <VerificationBadge type="identity" />}
                </View>
                <Text style={styles.ownerUsername}>@{owner.username}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#FBC02D" style={{ marginRight: 4 }} />
                  <Text style={styles.ratingVal}>{owner.rating} / 5.0</Text>
                  <Text style={styles.reviewsCount}>({owner.reviewsCount} reseñas)</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Comentarios y Preguntas */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comentarios y Preguntas</Text>
            
            {/* Input para agregar comentario */}
            <View style={styles.commentInputRow}>
              <TextInput 
                style={styles.commentInput}
                placeholder="Escribe una pregunta al dador..."
                placeholderTextColor={Colors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity style={styles.sendCommentBtn} onPress={handlePostComment}>
                <Ionicons name="send" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Listado de comentarios */}
            {pet.comments.length === 0 ? (
              <Text style={styles.noCommentsText}>No hay preguntas aún. ¡Sé el primero!</Text>
            ) : (
              pet.comments.map(c => (
                <View key={c.id} style={styles.commentItem}>
                  <Image source={{ uri: c.userAvatar }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUser}>@{c.username}</Text>
                    <Text style={styles.commentText}>{c.text}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(c.createdAt).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* CTA de Adopción Fijo Abajo */}
      {pet.status === 'disponible' && (
        <View style={styles.bottomCTAContainer}>
          <TouchableOpacity 
            style={styles.adoptButton} 
            activeOpacity={0.8}
            onPress={handleAdoptPress}
          >
            <Text style={styles.adoptButtonText}>🐾 Quiero adoptarlo</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
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
  floatingBackBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  carouselContainer: {
    width: width,
    height: 320,
    position: 'relative',
  },
  carouselScroll: {
    width: width,
    height: '100%',
  },
  carouselImage: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: Colors.accent,
    width: 18,
  },
  contentContainer: {
    padding: 24,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -25,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  petName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 24,
    color: Colors.text,
  },
  petBreed: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  femaleBg: {
    backgroundColor: Colors.accent,
  },
  maleBg: {
    backgroundColor: '#0288D1',
  },
  genderText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: Colors.white,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  healthItem: {
    alignItems: 'center',
    width: '23%',
  },
  healthEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  healthTitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  healthVal: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: Colors.text,
    marginTop: 2,
  },
  specialNeedsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderColor: '#FFE0B2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  specialNeedsTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#E65100',
    marginBottom: 2,
  },
  specialNeedsDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  personalityChip: {
    backgroundColor: '#FFE6EF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  personalityText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: Colors.accent,
  },
  descriptionText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 20,
    marginBottom: 20,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  ownerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.text,
  },
  ownerUsername: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingVal: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#FBC02D',
  },
  reviewsCount: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  commentsSection: {
    marginTop: 20,
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  commentInput: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.text,
  },
  sendCommentBtn: {
    backgroundColor: Colors.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCommentsText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 15,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
    paddingBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: Colors.text,
    marginBottom: 2,
  },
  commentText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  commentDate: {
    fontFamily: 'Lato_400Regular',
    fontSize: 9,
    color: Colors.textSecondary,
    opacity: 0.6,
    marginTop: 4,
  },
  bottomCTAContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  adoptButton: {
    backgroundColor: Colors.accent,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  adoptButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.white,
  },
});
