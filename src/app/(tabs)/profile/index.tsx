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
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useKittyStore } from '../../../store/kittyStore';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import VerificationBadge from '../../../components/VerificationBadge';

export default function MyProfileScreen() {
  const router = useRouter();
  const currentUser = useKittyStore(state => state.currentUser);
  const pets = useKittyStore(state => state.pets);
  const updates = useKittyStore(state => state.updates);
  const logout = useKittyStore(state => state.logout);
  const updateUserBio = useKittyStore(state => state.updateUserBio);
  const updateVerificationStatus = useKittyStore(state => state.updateVerificationStatus);

  const [activeTab, setActiveTab] = useState<'animals' | 'updates' | 'reviews' | 'settings'>('animals');
  const [bioEditMode, setBioEditMode] = useState(false);
  const [bioText, setBioText] = useState(currentUser?.bio || '');

  if (!currentUser) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No has iniciado sesión 🐾</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace('/login')}>
          <Text style={styles.loginBtnText}>Ir al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const myPets = pets.filter(p => p.ownerId === currentUser.id);
  const myUpdates = updates.filter(u => u.updaterId === currentUser.id);

  const handleSaveBio = () => {
    updateUserBio(currentUser.id, bioText);
    setBioEditMode(false);
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  // Simulación de cambiar estado de verificación
  const toggleVerificationStatus = () => {
    const nextStatus = currentUser.verified === 'verified' ? 'rejected' : currentUser.verified === 'rejected' ? 'pending' : 'verified';
    updateVerificationStatus(currentUser.id, nextStatus);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        {/* HEADER PERFIL */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={Colors.error} />
          </TouchableOpacity>

          <Image source={{ uri: currentUser.avatar }} style={styles.profileAvatar} />
          
          <Text style={styles.fullName}>{currentUser.fullName}</Text>
          <Text style={styles.username}>@{currentUser.username}</Text>
          <Text style={styles.cityText}>📍 {currentUser.city}</Text>

          <View style={styles.badgeRow}>
            {currentUser.verified === 'verified' ? (
              <VerificationBadge type="identity" />
            ) : currentUser.verified === 'pending' ? (
              <VerificationBadge type="pending" />
            ) : (
              <View style={[styles.badge, styles.rejectedBadge]}>
                <Ionicons name="close-circle" size={14} color="#C62828" style={{ marginRight: 4 }} />
                <Text style={styles.rejectedText}>Verificación Rechazada ❌</Text>
              </View>
            )}

            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#FBC02D" style={{ marginRight: 4 }} />
              <Text style={styles.ratingText}>{currentUser.rating} ({currentUser.reviewsCount} reseñas)</Text>
            </View>
          </View>

          {/* BIO */}
          <View style={styles.bioContainer}>
            {bioEditMode ? (
              <View style={styles.bioEditRow}>
                <TextInput 
                  style={styles.bioInput}
                  value={bioText}
                  onChangeText={setBioText}
                  multiline
                  maxLength={150}
                />
                <TouchableOpacity style={styles.bioSaveBtn} onPress={handleSaveBio}>
                  <Text style={styles.bioSaveText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.bioDisplayRow}>
                <Text style={styles.bioText}>{currentUser.bio || 'Sin descripción aún.'}</Text>
                <TouchableOpacity onPress={() => setBioEditMode(true)}>
                  <Ionicons name="create-outline" size={16} color={Colors.accent} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* TABS SELECTOR */}
        <View style={styles.tabsRow}>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'animals' && styles.activeTabItem]}
            onPress={() => setActiveTab('animals')}
          >
            <Ionicons name="paw" size={18} color={activeTab === 'animals' ? Colors.accent : Colors.textSecondary} />
            <Text style={[styles.tabLabel, activeTab === 'animals' && { color: Colors.accent }]}>
              {currentUser.role === 'dador' ? 'Mis Posts' : 'Adoptados'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'updates' && styles.activeTabItem]}
            onPress={() => setActiveTab('updates')}
          >
            <Ionicons name="images" size={18} color={activeTab === 'updates' ? Colors.accent : Colors.textSecondary} />
            <Text style={[styles.tabLabel, activeTab === 'updates' && { color: Colors.accent }]}>Seguimientos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'reviews' && styles.activeTabItem]}
            onPress={() => setActiveTab('reviews')}
          >
            <Ionicons name="star" size={18} color={activeTab === 'reviews' ? Colors.accent : Colors.textSecondary} />
            <Text style={[styles.tabLabel, activeTab === 'reviews' && { color: Colors.accent }]}>Reseñas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'settings' && styles.activeTabItem]}
            onPress={() => setActiveTab('settings')}
          >
            <Ionicons name="options" size={18} color={activeTab === 'settings' ? Colors.accent : Colors.textSecondary} />
            <Text style={[styles.tabLabel, activeTab === 'settings' && { color: Colors.accent }]}>Demo Tools</Text>
          </TouchableOpacity>
        </View>

        {/* TAB CONTENTS */}
        <View style={styles.tabContentContainer}>
          
          {/* TAB 1: ANIMALS */}
          {activeTab === 'animals' && (
            <View>
              {myPets.length === 0 ? (
                <Text style={styles.emptyTabText}>No tienes publicaciones activas.</Text>
              ) : (
                myPets.map(pet => (
                  <TouchableOpacity 
                    key={pet.id} 
                    style={styles.petItemRow}
                    onPress={() => router.push(`/animal/${pet.id}`)}
                  >
                    <Image source={{ uri: pet.images[0] }} style={styles.petThumbnail} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.petName}>{pet.name} • {pet.species}</Text>
                      <Text style={styles.petBreed}>{pet.breed} ({pet.age})</Text>
                      <View style={[
                        styles.statusTag, 
                        pet.status === 'adoptado' ? styles.statusAdopted : pet.status === 'proceso' ? styles.statusInProcess : styles.statusAvail
                      ]}>
                        <Text style={styles.statusText}>{pet.status.toUpperCase()}</Text>
                      </View>
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
              {myUpdates.length === 0 ? (
                <Text style={styles.emptyTabText}>Aún no has subido actualizaciones post-adopción.</Text>
              ) : (
                myUpdates.map(up => (
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
              {currentUser.reviews.length === 0 ? (
                <Text style={styles.emptyTabText}>No tienes reseñas todavía.</Text>
              ) : (
                currentUser.reviews.map(rev => (
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

          {/* TAB 4: SETTINGS & DEMO WIDGETS */}
          {activeTab === 'settings' && (
            <View style={styles.settingsBox}>
              <Text style={styles.settingsTitle}>🛠️ Panel de Simulación Académica</Text>
              <Text style={styles.settingsDesc}>
                Cambia el estado de verificación de tu cuenta para probar cómo reacciona la app ante cada estado.
              </Text>
              
              <View style={styles.statusDisplay}>
                <Text style={styles.statusLabel}>Estado actual:</Text>
                <Text style={styles.statusValue}>{currentUser.verified.toUpperCase()}</Text>
              </View>

              <TouchableOpacity style={styles.toggleVerificationBtn} onPress={toggleVerificationStatus}>
                <Ionicons name="refresh-circle-outline" size={20} color={Colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.toggleVerificationText}>Cambiar estado de verificación</Text>
              </TouchableOpacity>

              <Text style={styles.docChecklistTitle}>Documentos cargados:</Text>
              <View style={styles.docChecklistItem}>
                <Ionicons name={currentUser.documents.ineFront ? "checkmark-circle" : "close-circle"} size={16} color={currentUser.documents.ineFront ? Colors.success : Colors.error} />
                <Text style={styles.docChecklistText}>INE Frente</Text>
              </View>
              <View style={styles.docChecklistItem}>
                <Ionicons name={currentUser.documents.ineBack ? "checkmark-circle" : "close-circle"} size={16} color={currentUser.documents.ineBack ? Colors.success : Colors.error} />
                <Text style={styles.docChecklistText}>INE Reverso</Text>
              </View>
              <View style={styles.docChecklistItem}>
                <Ionicons name={currentUser.documents.proofOfAddress ? "checkmark-circle" : "close-circle"} size={16} color={currentUser.documents.proofOfAddress ? Colors.success : Colors.error} />
                <Text style={styles.docChecklistText}>Comprobante de Domicilio</Text>
              </View>
              <View style={styles.docChecklistItem}>
                <Ionicons name={currentUser.documents.selfieWithIne ? "checkmark-circle" : "close-circle"} size={16} color={currentUser.documents.selfieWithIne ? Colors.success : Colors.error} />
                <Text style={styles.docChecklistText}>Selfie con INE</Text>
              </View>
            </View>
          )}

        </View>
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
  loginBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  loginBtnText: {
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
    position: 'relative',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  logoutBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8,
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
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  rejectedBadge: {
    backgroundColor: '#FFEBEE',
  },
  rejectedText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: '#C62828',
  },
  bioContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    paddingTop: 15,
  },
  bioDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
  },
  bioText: {
    flex: 1,
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bioEditRow: {
    width: '100%',
    gap: 8,
  },
  bioInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.text,
    height: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioSaveBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  bioSaveText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: Colors.white,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    marginTop: 15,
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 4,
  },
  activeTabItem: {
    borderBottomColor: Colors.accent,
  },
  tabLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
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
    marginBottom: 4,
  },
  statusTag: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusAdopted: {
    backgroundColor: '#E8F5E9',
  },
  statusInProcess: {
    backgroundColor: '#FFF3E0',
  },
  statusAvail: {
    backgroundColor: '#E3F2FD',
  },
  statusText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 9,
    color: Colors.text,
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
  settingsBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  settingsTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.accent,
    marginBottom: 4,
  },
  settingsDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 15,
    lineHeight: 16,
  },
  statusDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  statusLabel: {
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: Colors.accent,
  },
  toggleVerificationBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  toggleVerificationText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: Colors.white,
  },
  docChecklistTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: Colors.text,
    marginBottom: 8,
  },
  docChecklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  docChecklistText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
