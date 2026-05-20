import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useKittyStore } from '../../../store/kittyStore';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  const router = useRouter();
  const pets = useKittyStore(state => state.pets).filter(p => p.status === 'disponible');

  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filter states
  const [species, setSpecies] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [city, setCity] = useState<string>('');
  const [specialNeeds, setSpecialNeeds] = useState<boolean | null>(null);
  const [castrated, setCastrated] = useState<boolean | null>(null);

  const resetFilters = () => {
    setSpecies(null);
    setAge(null);
    setSize(null);
    setCity('');
    setSpecialNeeds(null);
    setCastrated(null);
  };

  const filteredPets = pets.filter(pet => {
    // Search text filter (name, breed, description)
    const matchText = searchText === '' || 
      pet.name.toLowerCase().includes(searchText.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchText.toLowerCase()) ||
      pet.description.toLowerCase().includes(searchText.toLowerCase());

    // Category filters
    const matchSpecies = !species || pet.species === species;
    const matchAge = !age || pet.age.toLowerCase().includes(age.toLowerCase());
    const matchSize = !size || pet.size === size;
    const matchCity = city === '' || pet.city.toLowerCase().includes(city.toLowerCase());
    const matchSpecial = specialNeeds === null || pet.health.specialNeeds === specialNeeds;
    const matchCastrated = castrated === null || pet.health.castrated === castrated;

    return matchText && matchSpecies && matchAge && matchSize && matchCity && matchSpecial && matchCastrated;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra superior de búsqueda */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar perro, gato, raza..."
            placeholderTextColor={Colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="funnel-outline" size={22} color={Colors.accent} />
          {/* Badge indicando si hay filtros activos */}
          {(species || age || size || city || specialNeeds !== null || castrated !== null) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Selectores de Modo de Vista (Grid / Mapa) */}
      <View style={styles.viewToggleRow}>
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'grid' && styles.activeToggleBtn]}
          onPress={() => setViewMode('grid')}
        >
          <Ionicons name="grid-outline" size={18} color={viewMode === 'grid' ? Colors.white : Colors.text} />
          <Text style={[styles.toggleBtnText, viewMode === 'grid' && { color: Colors.white }]}>Grid</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'map' && styles.activeToggleBtn]}
          onPress={() => setViewMode('map')}
        >
          <Ionicons name="map-outline" size={18} color={viewMode === 'map' ? Colors.white : Colors.text} />
          <Text style={[styles.toggleBtnText, viewMode === 'map' && { color: Colors.white }]}>Mapa 🗺️</Text>
        </TouchableOpacity>
      </View>

      {/* RESULTADOS */}
      {viewMode === 'grid' ? (
        <FlatList
          data={filteredPets}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>😢</Text>
              <Text style={styles.emptyText}>No encontramos patitas con esos filtros.</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                <Text style={styles.resetBtnText}>Limpiar filtros</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.gridCard}
              activeOpacity={0.9}
              onPress={() => router.push(`/animal/${item.id}`)}
            >
              <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
              <View style={styles.gridInfo}>
                <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.gridBreed} numberOfLines={1}>{item.breed}</Text>
                <View style={styles.gridLocationRow}>
                  <Ionicons name="location-outline" size={11} color={Colors.textSecondary} />
                  <Text style={styles.gridLocation} numberOfLines={1}>{item.city.split(',')[0]}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        /* MAPA INTERACTIVO SIMULADO */
        <ScrollView contentContainerStyle={styles.mapContainer}>
          <View style={styles.mapGraphicWrapper}>
            {/* Fondo simulado de mapa tipo Google Maps caricatura */}
            <View style={styles.mapBackdrop}>
              <View style={[styles.road, { transform: [{ rotate: '45deg' }], top: 100 }]} />
              <View style={[styles.road, { transform: [{ rotate: '-30deg' }], top: 220 }]} />
              <View style={[styles.park, { top: 60, left: 40 }]} />
              <View style={[styles.park, { top: 280, left: 160 }]} />
              <View style={[styles.river, { bottom: 30 }]} />
              
              {/* Pins de Mascotas en el Mapa */}
              {filteredPets.slice(0, 5).map((pet, idx) => {
                // Coordenadas fijas simuladas para los primeros 5
                const positions = [
                  { top: 80, left: 110 },
                  { top: 150, left: 240 },
                  { top: 230, left: 80 },
                  { top: 110, left: 50 },
                  { top: 320, left: 200 }
                ];
                const pos = positions[idx] || { top: 180, left: 150 };

                return (
                  <TouchableOpacity 
                    key={pet.id} 
                    style={[styles.mapPinContainer, { top: pos.top, left: pos.left }]}
                    onPress={() => router.push(`/animal/${pet.id}`)}
                  >
                    <View style={styles.pinBubble}>
                      <Image source={{ uri: pet.images[0] }} style={styles.pinImage} />
                      <Text style={styles.pinText}>{pet.name}</Text>
                    </View>
                    <View style={styles.pinArrow} />
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.mapOverlayLabel}>
              <Ionicons name="navigate" size={16} color={Colors.white} />
              <Text style={styles.mapOverlayLabelText}>Mostrando mascotas disponibles cerca de ti</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* MODAL DE FILTROS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros de Búsqueda</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* SPECIES */}
              <Text style={styles.filterSectionTitle}>Especie</Text>
              <View style={styles.chipRow}>
                {['Perro', 'Gato', 'Conejo', 'Ave', 'Otro'].map(item => (
                  <TouchableOpacity 
                    key={item} 
                    style={[styles.chip, species === item && styles.activeChip]}
                    onPress={() => setSpecies(species === item ? null : item)}
                  >
                    <Text style={[styles.chipText, species === item && styles.activeChipText]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* SIZE */}
              <Text style={styles.filterSectionTitle}>Tamaño</Text>
              <View style={styles.chipRow}>
                {['Pequeño', 'Mediano', 'Grande'].map(item => (
                  <TouchableOpacity 
                    key={item} 
                    style={[styles.chip, size === item && styles.activeChip]}
                    onPress={() => setSize(size === item ? null : item)}
                  >
                    <Text style={[styles.chipText, size === item && styles.activeChipText]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* AGE */}
              <Text style={styles.filterSectionTitle}>Edad aproximada</Text>
              <View style={styles.chipRow}>
                {['Mes', 'Año', 'Cachorro', 'Adulto', 'Senior'].map(item => (
                  <TouchableOpacity 
                    key={item} 
                    style={[styles.chip, age === item && styles.activeChip]}
                    onPress={() => setAge(age === item ? null : item)}
                  >
                    <Text style={[styles.chipText, age === item && styles.activeChipText]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* CITY */}
              <Text style={styles.filterSectionTitle}>Ciudad / Estado</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="Ej. Guadalajara o CDMX"
                value={city}
                onChangeText={setCity}
              />

              {/* HEALTH TOGGLES */}
              <Text style={styles.filterSectionTitle}>Salud y Cuidados</Text>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>¿Esterilizado / Castrado?</Text>
                <View style={styles.toggleOptionRow}>
                  <TouchableOpacity 
                    style={[styles.smallToggle, castrated === true && styles.activeSmallToggle]}
                    onPress={() => setCastrated(castrated === true ? null : true)}
                  >
                    <Text style={[styles.smallToggleText, castrated === true && { color: Colors.white }]}>Sí</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.smallToggle, castrated === false && styles.activeSmallToggle]}
                    onPress={() => setCastrated(castrated === false ? null : false)}
                  >
                    <Text style={[styles.smallToggleText, castrated === false && { color: Colors.white }]}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>¿Necesidades Especiales?</Text>
                <View style={styles.toggleOptionRow}>
                  <TouchableOpacity 
                    style={[styles.smallToggle, specialNeeds === true && styles.activeSmallToggle]}
                    onPress={() => setSpecialNeeds(specialNeeds === true ? null : true)}
                  >
                    <Text style={[styles.smallToggleText, specialNeeds === true && { color: Colors.white }]}>Sí</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.smallToggle, specialNeeds === false && styles.activeSmallToggle]}
                    onPress={() => setSpecialNeeds(specialNeeds === false ? null : false)}
                  >
                    <Text style={[styles.smallToggleText, specialNeeds === false && { color: Colors.white }]}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalResetBtn} onPress={resetFilters}>
                <Text style={styles.modalResetText}>Limpiar Todo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalApplyBtn} 
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.modalApplyText}>Aplicar Filtros</Text>
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Lato_400Regular',
    fontSize: 15,
    color: Colors.text,
  },
  filterButton: {
    backgroundColor: Colors.white,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  filterBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.accent,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  viewToggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
    gap: 12,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeToggleBtn: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  toggleBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: Colors.text,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  gridCard: {
    backgroundColor: Colors.white,
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  gridInfo: {
    padding: 10,
  },
  gridName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.text,
  },
  gridBreed: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  gridLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gridLocation: {
    fontFamily: 'Lato_400Regular',
    fontSize: 10,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  resetBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  resetBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.text,
  },
  mapContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mapGraphicWrapper: {
    width: '100%',
    height: 480,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 30,
  },
  mapBackdrop: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  road: {
    position: 'absolute',
    width: '120%',
    height: 24,
    backgroundColor: '#ECEFF1',
    left: '-10%',
  },
  park: {
    position: 'absolute',
    width: 100,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#C8E6C9',
  },
  river: {
    position: 'absolute',
    width: '100%',
    height: 40,
    backgroundColor: '#B3E5FC',
  },
  mapPinContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    gap: 6,
  },
  pinImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  pinText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: Colors.text,
  },
  pinArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.white,
  },
  mapOverlayLabel: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    backgroundColor: Colors.overlay,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    gap: 6,
  },
  mapOverlayLabelText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.text,
  },
  modalBody: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.text,
    marginTop: 15,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  activeChipText: {
    color: Colors.white,
    fontFamily: 'Lato_700Bold',
  },
  modalInput: {
    backgroundColor: Colors.background,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  toggleLabel: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.text,
  },
  toggleOptionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallToggle: {
    paddingVertical: 4,
    paddingHorizontal: 12,
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
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    paddingTop: 16,
  },
  modalResetBtn: {
    paddingVertical: 12,
  },
  modalResetText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalApplyBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  modalApplyText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.white,
  },
});
