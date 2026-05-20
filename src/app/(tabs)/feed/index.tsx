import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Share,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useKittyStore } from '../../../store/kittyStore';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import VerificationBadge from '../../../components/VerificationBadge';

export default function FeedScreen() {
  const router = useRouter();
  const currentUser = useKittyStore(state => state.currentUser);
  const pets = useKittyStore(state => state.pets);
  const updates = useKittyStore(state => state.updates);
  const toggleLikePet = useKittyStore(state => state.toggleLikePet);
  const toggleLikeUpdate = useKittyStore(state => state.toggleLikeUpdate);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleShare = async (title: string, message: string) => {
    try {
      await Share.share({
        title,
        message: `${title}: ${message} - ¡Encuentra tu mascota ideal en KittyPaws! 🐾`
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Combinar mascotas disponibles y actualizaciones post-adopción en un solo feed ordenado
  // Para identificarlos, les agregamos una propiedad 'feedType'
  const availablePetsFeed = pets
    .filter(p => p.status === 'disponible' || p.status === 'proceso')
    .map(p => ({ ...p, feedType: 'pet' as const, dateValue: new Date(p.createdAt).getTime() }));

  const publicUpdatesFeed = updates
    .filter(u => u.isPublic)
    .map(u => ({ ...u, feedType: 'update' as const, dateValue: new Date(u.createdAt).getTime() }));

  const mixedFeed = [...availablePetsFeed, ...publicUpdatesFeed].sort((a, b) => b.dateValue - a.dateValue);

  // Crear la lista de historias basada en las actualizaciones más recientes
  const stories = updates.map(up => ({
    id: up.id,
    petId: up.petId,
    name: up.petName,
    avatar: up.updaterAvatar,
    timeLabel: up.timeLabel
  }));

  const renderHeader = () => (
    <View style={styles.feedHeader}>
      {/* Saludo y Botón Crear Post */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.appName}>KittyPaws 🐾</Text>
          <Text style={styles.welcomeText}>¡Hola, {currentUser?.fullName.split(' ')[0]}!</Text>
        </View>
        
        {currentUser?.role === 'dador' && (
          <TouchableOpacity 
            style={styles.postNewButton} 
            activeOpacity={0.8}
            onPress={() => router.push('/post/new')}
          >
            <Ionicons name="add-circle" size={20} color={Colors.white} />
            <Text style={styles.postNewButtonText}>Publicar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stories Section */}
      <View style={styles.storiesContainer}>
        <Text style={styles.sectionTitle}>Historias de Éxito 🏆</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={stories}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.storyCard}
              onPress={() => router.push(`/adoption/${item.petId}/tracking`)}
            >
              <View style={styles.storyRing}>
                <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
              </View>
              <Text style={styles.storyName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.storyTime}>{item.timeLabel}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        />
      </View>

      <Text style={[styles.sectionTitle, { marginHorizontal: 20, marginTop: 15, marginBottom: 5 }]}>
        Novedades y Adopciones
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <FlatList
        data={mixedFeed}
        keyExtractor={(item, index) => item.id + '_' + index}
        ListHeaderComponent={renderHeader}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.feedType === 'pet') {
            // RENDER CARD DE ANIMAL EN ADOPCIÓN
            const hasLiked = item.tags.includes('liked');
            return (
              <View style={styles.petCard}>
                <TouchableOpacity 
                  activeOpacity={0.9} 
                  onPress={() => router.push(`/animal/${item.id}`)}
                >
                  <Image source={{ uri: item.images[0] }} style={styles.petImage} />
                </TouchableOpacity>

                <View style={styles.petInfoContainer}>
                  <View style={styles.petNameRow}>
                    <Text style={styles.petName}>🐾 {item.name} • {item.species}</Text>
                    <Text style={styles.petAge}>{item.age}</Text>
                  </View>
                  
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.petLocation}>{item.city}</Text>
                  </View>

                  <View style={styles.tagsRow}>
                    {item.tags.filter(t => t !== 'liked').map((tag, idx) => (
                      <View key={idx} style={styles.tagBadge}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                    {item.health.castrated && (
                      <View style={[styles.tagBadge, { backgroundColor: '#E1F5FE' }]}>
                        <Text style={[styles.tagText, { color: '#0288D1' }]}>Castrado</Text>
                      </View>
                    )}
                    {item.health.vaccinated && <VerificationBadge type="vaccines" />}
                  </View>

                  <Text style={styles.petDesc} numberOfLines={2}>{item.description}</Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => toggleLikePet(item.id)}
                    >
                      <Ionicons 
                        name={hasLiked ? "heart" : "heart-outline"} 
                        size={22} 
                        color={hasLiked ? Colors.accent : Colors.textSecondary} 
                      />
                      <Text style={[styles.actionText, hasLiked && { color: Colors.accent }]}>
                        {hasLiked ? 'Guardado' : 'Guardar'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => router.push(`/animal/${item.id}`)}
                    >
                      <Ionicons name="eye-outline" size={22} color={Colors.textSecondary} />
                      <Text style={styles.actionText}>Ver más</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.adoptCTA, item.status === 'proceso' && styles.adoptCTAProceso]}
                      onPress={() => {
                        if (item.status === 'proceso') {
                          Alert.alert('En proceso', 'Esta mascota ya tiene una solicitud en curso.');
                        } else {
                          router.push(`/adopt/${item.id}`);
                        }
                      }}
                    >
                      <Text style={styles.adoptCTAText}>
                        {item.status === 'proceso' ? 'En proceso' : 'Me interesa'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          } else {
            // RENDER CARD DE ACTUALIZACIÓN POST-ADOPCIÓN
            const hasLikedUpdate = item.likedBy.includes(currentUser?.id || '');
            return (
              <View style={styles.updateCard}>
                {/* Header del post */}
                <TouchableOpacity 
                  style={styles.updateHeader}
                  onPress={() => router.push(`/profile/${item.updaterId}`)}
                >
                  <Image source={{ uri: item.updaterAvatar }} style={styles.updaterAvatar} />
                  <View>
                    <Text style={styles.updaterName}>{item.updaterName}</Text>
                    <Text style={styles.updateMeta}>Actualización de {item.petName} • {item.timeLabel}</Text>
                  </View>
                </TouchableOpacity>

                {/* Contenido */}
                <Text style={styles.updateDesc}>{item.description}</Text>
                
                {item.images && item.images.length > 0 && (
                  <Image source={{ uri: item.images[0] }} style={styles.updateImage} />
                )}

                {/* Footer del post */}
                <View style={styles.updateFooter}>
                  <TouchableOpacity 
                    style={styles.postActionButton} 
                    onPress={() => toggleLikeUpdate(item.id)}
                  >
                    <Ionicons 
                      name={hasLikedUpdate ? "heart" : "heart-outline"} 
                      size={20} 
                      color={hasLikedUpdate ? Colors.accent : Colors.textSecondary} 
                    />
                    <Text style={[styles.postActionText, hasLikedUpdate && { color: Colors.accent }]}>
                      {item.likes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.postActionButton}
                    onPress={() => router.push(`/adoption/${item.petId}/tracking`)}
                  >
                    <Ionicons name="chatbubble-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.postActionText}>{item.comments.length}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.postActionButton}
                    onPress={() => handleShare(`Actualización de ${item.petName}`, item.description)}
                  >
                    <Ionicons name="share-social-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.postActionText}>Compartir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
        }}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  feedHeader: {
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    marginBottom: 20,
  },
  appName: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 26,
    color: Colors.text,
  },
  welcomeText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  postNewButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  postNewButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: Colors.white,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
  },
  storiesContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  storyCard: {
    alignItems: 'center',
    marginRight: 18,
    width: 68,
  },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 2,
    marginBottom: 6,
  },
  storyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  storyName: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
  },
  storyTime: {
    fontFamily: 'Lato_400Regular',
    fontSize: 9,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  petCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  petImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  petInfoContainer: {
    padding: 16,
  },
  petNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  petName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.text,
  },
  petAge: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.accent,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  petLocation: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagBadge: {
    backgroundColor: Colors.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  tagText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  petDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  adoptCTA: {
    backgroundColor: Colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
  },
  adoptCTAProceso: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.7,
  },
  adoptCTAText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: Colors.white,
  },
  updateCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  updaterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  updaterName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.text,
  },
  updateMeta: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  updateDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.text,
    lineHeight: 19,
    marginBottom: 12,
  },
  updateImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 12,
  },
  updateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    paddingTop: 12,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
