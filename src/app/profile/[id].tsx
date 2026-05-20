import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKittyStore } from '../../store/kittyStore';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import VerificationBadge from '../../components/VerificationBadge';

export default function PublicProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const user = useKittyStore(state => state.users.find(u => u.id === id));
  const currentUser = useKittyStore(state => state.currentUser);
  const pets = useKittyStore(state => state.pets);
  const updates = useKittyStore(state => state.updates);
  const submitReview = useKittyStore(state => state.submitReview);

  const [activeTab, setActiveTab] = useState<'animals' | 'updates' | 'reviews'>('animals');
  const [following, setFollowing] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  // Form de Reseña
  const [ratingVal, setRatingVal] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontró el perfil 😿</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userPets = pets.filter(p => p.ownerId === user.id);
  const userUpdates = updates.filter(u => u.updaterId === user.id);

  const handleToggleFollow = () => {
    setFollowing(!following);
  };

  const handleMessagePress = () => {
    // Ir al tab de chat/adopciones
    Alert.alert(
      'Enviar Mensaje 💬',
      `Para chatear con ${user.fullName}, inicia un proceso de adopción presionando "Me interesa" en uno de sus animales listados.`
    );
  };

  const toggleReviewTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Por favor ingresa un comentario.');
      return;
    }

    submitReview(user.id, ratingVal, commentText, selectedTags);
    setReviewModalVisible(false);
    
    // Resetear form
    setCommentText('');
    setRatingVal(5);
    setSelectedTags([]);

    Alert.alert('¡Muchas gracias!', 'Tu reseña ha sido publicada con éxito.');
  };

  const reviewTagsOptions = [
    'Muy responsable',
    'Responde rápido',
    'Animal en excelentes condiciones',
    'Instalaciones limpias',
    'Amable y empático',
    'Tardó en enviar documentos'
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra superior con botón regresar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Perfil de Usuario</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        {/* INFO PERFIL */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
          
          <Text style={styles.fullName}>{user.fullName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.cityText}>📍 {user.city}</Text>

          <View style={styles.badgeRow}>
            {user.verified === 'verified' && <VerificationBadge type="identity" />}
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#FBC02D" style={{ marginRight: 4 }} />
              <Text style={styles.ratingText}>{user.rating} ({user.reviewsCount} reseñas)</Text>
            </View>
          </View>

          <Text style={styles.bioText}>{user.bio || 'Sin descripción aún.'}</Text>

          {/* Botones de acción */}
          {currentUser && currentUser.id !== user.id && (
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, following ? styles.followingBtn : styles.followBtn]}
                onPress={handleToggleFollow}
              >
                <Ionicons name={following ? "checkmark" : "person-add"} size={16} color={following ? Colors.text : Colors.white} />
                <Text style={[styles.actionBtnText, following && { color: Colors.text }]}>
                  {following ? 'Siguiendo' : 'Seguir'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.messageBtn]}
                onPress={handleMessagePress}
              >
                <Ionicons name="chatbubble" size={16} color={Colors.white} />
                <Text style={styles.actionBtnText}>Mensaje</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* TABS SELECTOR */}
        <View style={styles.tabsRow}>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'animals' && styles.activeTabItem]}
            onPress={() => setActiveTab('animals')}
          >
            <Text style={[styles.tabLabel, activeTab === 'animals' && { color: Colors.accent }]}>
              {user.role === 'dador' ? 'Mascotas' : 'Adoptadas'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'updates' && styles.activeTabItem]}
            onPress={() => setActiveTab('updates')}
          >
            <Text style={[styles.tabLabel, activeTab === 'updates' && { color: Colors.accent }]}>Seguimientos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'reviews' && styles.activeTabItem]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabLabel, activeTab === 'reviews' && { color: Colors.accent }]}>Reseñas</Text>
          </TouchableOpacity>
        </View>

        {/* TAB CONTENTS */}
        <View style={styles.tabContentContainer}>
          
          {/* TAB 1: ANIMALS */}
          {activeTab === 'animals' && (
            <View>
              {userPets.length === 0 ? (
                <Text style={styles.emptyTabText}>No tiene publicaciones activas.</Text>
              ) : (
                userPets.map(pet => (
                  <TouchableOpacity 
                    key={pet.id} 
                    style={styles.petItemRow}
                    onPress={() => router.push(`/animal/${pet.id}`)}
                  >
                    <Image source={{ uri: pet.images[0] }} style={styles.petThumbnail} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.petName}>{pet.name} • {pet.species}</Text>
                      <Text style={styles.petBreed}>{pet.breed} ({pet.age})</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* TAB 2: UPDATES */}
          {activeTab === 'updates' && (
            <View style={styles.updatesGrid}>
              {userUpdates.length === 0 ? (
                <Text style={styles.emptyTabText}>No cuenta con fotos de seguimiento post-adopción.</Text>
              ) : (
                userUpdates.map(up => (
                  <TouchableOpacity 
                    key={up.id} 
                    style={styles.updateGridItem}
                    onPress={() => router.push(`/adoption/${up.petId}/tracking`)}
                  >
                    <Image source={{ uri: up.images[0] }} style={styles.updateGridImage} />
                    <Text style={styles.updateGridTitle}>{up.petName} • {up.timeLabel}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <View>
              {currentUser && currentUser.id !== user.id && (
                <TouchableOpacity 
                  style={styles.addReviewCTA}
                  onPress={() => setReviewModalVisible(true)}
                >
                  <Ionicons name="star" size={16} color={Colors.white} />
                  <Text style={styles.addReviewCTAText}>Dejar una reseña tipo Uber ⭐</Text>
                </TouchableOpacity>
              )}

              {user.reviews.length === 0 ? (
                <Text style={styles.emptyTabText}>Aún no cuenta con reseñas de la comunidad.</Text>
              ) : (
                user.reviews.map(rev => (
                  <View key={rev.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Image source={{ uri: rev.fromAvatar }} style={styles.reviewAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewFromName}>{rev.fromName}</Text>
                        <Text style={styles.reviewDate}>{rev.date}</Text>
                      </View>
                      <View style={styles.reviewStars}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons 
                            key={i} 
                            name={i < rev.rating ? "star" : "star-outline"} 
                            size={12} 
                            color="#FBC02D" 
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{rev.comment}</Text>
                    <View style={styles.reviewTagsRow}>
                      {rev.tags.map((t, idx) => (
                        <View key={idx} style={styles.reviewTag}>
                          <Text style={styles.reviewTagText}>✅ {t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {/* MODAL PARA DEJAR RESEÑA */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Calificar a {user.fullName}</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>¿Cómo calificarías tu experiencia de adopción?</Text>
              
              {/* Estrellas interactiva */}
              <View style={styles.starsSelectorRow}>
                {[1, 2, 3, 4, 5].map(val => (
                  <TouchableOpacity key={val} onPress={() => setRatingVal(val)}>
                    <Ionicons 
                      name={val <= ratingVal ? "star" : "star-outline"} 
                      size={36} 
                      color="#FBC02D" 
                      style={{ marginHorizontal: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tags de elogios */}
              <Text style={styles.sectionLabel}>Elige los puntos más fuertes:</Text>
              <View style={styles.reviewTagsGrid}>
                {reviewTagsOptions.map(tag => {
                  const active = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity 
                      key={tag}
                      style={[styles.tagButton, active && styles.activeTagButton]}
                      onPress={() => toggleReviewTag(tag)}
                    >
                      <Text style={[styles.tagButtonText, active && { color: Colors.white }]}>{tag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Comentarios */}
              <Text style={styles.sectionLabel}>Comentarios o detalles:</Text>
              <TextInput 
                style={styles.reviewTextInput}
                placeholder="Escribe aquí tu experiencia..."
                multiline
                numberOfLines={4}
                value={commentText}
                onChangeText={setCommentText}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setReviewModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReview}>
                <Text style={styles.submitBtnText}>Publicar Reseña</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  profileHeader: {
    backgroundColor: Colors.white,
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 12,
  },
  fullName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 2,
  },
  username: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cityText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDE7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  ratingText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: '#F57F17',
  },
  bioText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
    width: '100%',
    paddingHorizontal: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  followBtn: {
    backgroundColor: Colors.accent,
  },
  followingBtn: {
    backgroundColor: Colors.border,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  messageBtn: {
    backgroundColor: Colors.text,
  },
  actionBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: Colors.white,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    marginTop: 15,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: Colors.accent,
  },
  tabLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tabContentContainer: {
    padding: 20,
  },
  emptyTabText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 40,
    fontStyle: 'italic',
  },
  petItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  petThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  petName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.text,
  },
  petBreed: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  updatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  updateGridItem: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  updateGridImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  updateGridTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: Colors.text,
    padding: 8,
  },
  addReviewCTA: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    marginBottom: 16,
  },
  addReviewCTAText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.white,
  },
  reviewItem: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  reviewFromName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: Colors.text,
  },
  reviewDate: {
    fontFamily: 'Lato_400Regular',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 8,
  },
  reviewTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reviewTag: {
    backgroundColor: Colors.background,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  reviewTagText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 9,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.text,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  starsSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.text,
    marginTop: 15,
    marginBottom: 10,
  },
  reviewTagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  tagButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  activeTagButton: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  tagButtonText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  reviewTextInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.text,
    height: 90,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    paddingTop: 15,
  },
  cancelBtn: {
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  submitBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.white,
  },
});
