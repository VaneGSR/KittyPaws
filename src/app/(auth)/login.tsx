import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useKittyStore } from '../../store/kittyStore';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const login = useKittyStore(state => state.login);
  const loginAsUser = useKittyStore(state => state.loginAsUser);
  const users = useKittyStore(state => state.users);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor llena todos los campos.');
      return;
    }

    const success = login(email);
    if (success) {
      router.replace('/(tabs)/feed');
    } else {
      Alert.alert(
        'Usuario no encontrado',
        'Este correo no coincide con ninguno registrado. Usa un correo semilla (ej. contacto@patitasgdl.org) o regístrate.'
      );
    }
  };

  const handleGoogleLogin = () => {
    // Simular Google Login escogiendo el primer usuario adoptante
    const carlosUser = users.find(u => u.username === 'carlos_garcia_mty');
    if (carlosUser) {
      loginAsUser(carlosUser.id);
      Alert.alert('Acceso con Google', `Iniciaste sesión como ${carlosUser.fullName}`);
      router.replace('/(tabs)/feed');
    }
  };

  const handleQuickLogin = (userId: string, name: string) => {
    loginAsUser(userId);
    router.replace('/(tabs)/feed');
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Restablecer contraseña', 'Por favor ingresa tu correo electrónico primero.');
      return;
    }
    Alert.alert(
      'Restablecimiento enviado',
      `Hemos enviado un enlace para restablecer tu contraseña al correo: ${email}`
    );
  };

  // Dividir los usuarios semillas en dadores y adoptantes
  const seedDadores = users.filter(u => u.role === 'dador').slice(0, 4);
  const seedAdoptantes = users.filter(u => u.role === 'adoptante').slice(0, 4);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
        <Ionicons name="arrow-back-outline" size={24} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>¡Hola de nuevo! 🐾</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar ayudando patitas</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput 
            style={styles.input}
            placeholder="ejemplo@correo.com"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput 
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={Colors.textSecondary}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color={Colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Ingresar</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o ingresa con</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Ionicons name="logo-google" size={20} color={Colors.text} style={{ marginRight: 10 }} />
          <Text style={styles.googleButtonText}>Acceder con Google</Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN DE ACCESO RÁPIDO PARA PRUEBAS ACADÉMICAS */}
      <View style={styles.quickAccessContainer}>
        <Text style={styles.quickAccessTitle}>🔑 Acceso Rápido de Prueba (Demo)</Text>
        <Text style={styles.quickAccessSubtitle}>Toca un perfil para simular su inicio de sesión:</Text>
        
        <Text style={styles.roleHeader}>🐾 Rescatistas / Dadores</Text>
        <View style={styles.avatarsRow}>
          {seedDadores.map(user => (
            <TouchableOpacity 
              key={user.id} 
              style={styles.avatarButton} 
              onPress={() => handleQuickLogin(user.id, user.fullName)}
            >
              <Image source={{ uri: user.avatar }} style={styles.quickAvatar} />
              <Text style={styles.quickUsername} numberOfLines={1}>@{user.username.split('_')[0]}</Text>
              <Text style={styles.quickRole}>Dador</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.roleHeader}>🏠 Adoptantes</Text>
        <View style={styles.avatarsRow}>
          {seedAdoptantes.map(user => (
            <TouchableOpacity 
              key={user.id} 
              style={styles.avatarButton} 
              onPress={() => handleQuickLogin(user.id, user.fullName)}
            >
              <Image source={{ uri: user.avatar }} style={styles.quickAvatar} />
              <Text style={styles.quickUsername} numberOfLines={1}>@{user.username.split('_')[0]}</Text>
              <Text style={styles.quickRole}>Adoptante</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.footerLink}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 20,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 30,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontFamily: 'Lato_400Regular',
    fontSize: 16,
    color: Colors.text,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    color: Colors.accent,
  },
  loginButton: {
    backgroundColor: Colors.accent,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.white,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    paddingHorizontal: 10,
  },
  googleButton: {
    backgroundColor: Colors.white,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.text,
  },
  quickAccessContainer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 30,
  },
  quickAccessTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.accent,
    marginBottom: 4,
  },
  quickAccessSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 15,
  },
  roleHeader: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: Colors.text,
    marginTop: 5,
    marginBottom: 10,
  },
  avatarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  avatarButton: {
    alignItems: 'center',
    width: '23%',
  },
  quickAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 6,
  },
  quickUsername: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
  },
  quickRole: {
    fontFamily: 'Lato_400Regular',
    fontSize: 9,
    color: Colors.textSecondary,
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    color: Colors.accent,
  },
});
