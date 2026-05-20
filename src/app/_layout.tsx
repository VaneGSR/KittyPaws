import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useFonts, Nunito_400Regular, Nunito_700Bold, Nunito_600SemiBold } from '@expo-google-fonts/nunito';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { useKittyStore } from '../store/kittyStore';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Lato_400Regular,
    Lato_700Bold,
    Pacifico_400Regular,
  });

  const initializeStore = useKittyStore(state => state.initializeStore);

  useEffect(() => {
    // Inicializar el estado de la base de datos simulada
    initializeStore();
  }, [initializeStore]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="animal/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="profile/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="adopt/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="adoption/[id]/tracking" options={{ presentation: 'card' }} />
      <Stack.Screen name="post/new" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
