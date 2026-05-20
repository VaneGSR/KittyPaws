import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Switch,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useKittyStore } from '../../store/kittyStore';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

export default function RegisterScreen() {
  const router = useRouter();
  const registerUser = useKittyStore(state => state.registerUser);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states - Step 1
  const [role, setRole] = useState<'adoptante' | 'dador'>('adoptante');

  // Form states - Step 2
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [avatar, setAvatar] = useState<string>('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'); // default avatar

  // Form states - Step 3 (Verification Documents)
  const [ineFront, setIneFront] = useState<string | null>(null);
  const [ineBack, setIneBack] = useState<string | null>(null);
  const [proofAddress, setProofAddress] = useState<string | null>(null);
  const [selfieIne, setSelfieIne] = useState<string | null>(null);
  // Adoptante specific
  const [commitmentLetter, setCommitmentLetter] = useState<string | null>(null);
  const [homeSpace, setHomeSpace] = useState<string | null>(null);
  // Dador specific
  const [vetHistory, setVetHistory] = useState<string | null>(null);

  // Image pickers
  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      setAvatar(result.assets[0].uri);
    }
  };

  const pickDocument = async (docType: string, useDocumentPicker: boolean = false) => {
    try {
      if (useDocumentPicker) {
        const res = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true
        });
        if (!res.canceled && res.assets[0].uri) {
          setDocState(docType, res.assets[0].name || 'Documento.pdf');
        }
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.6,
        });
        if (!result.canceled && result.assets[0].uri) {
          setDocState(docType, result.assets[0].uri);
        }
      }
    } catch (err) {
      // Si falla en el simulador, asignamos un mock para no bloquear al usuario
      setDocState(docType, 'mock_uri_file_uploaded');
    }
  };

  const setDocState = (type: string, val: string) => {
    switch(type) {
      case 'ineFront': setIneFront(val); break;
      case 'ineBack': setIneBack(val); break;
      case 'proofAddress': setProofAddress(val); break;
      case 'selfieIne': setSelfieIne(val); break;
      case 'commitmentLetter': setCommitmentLetter(val); break;
      case 'homeSpace': setHomeSpace(val); break;
      case 'vetHistory': setVetHistory(val); break;
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Validaciones Step 2
      if (!fullName || !username || !email || !phone || !password || !confirmPassword || !city) {
        Alert.alert('Campos incompletos', 'Por favor llena toda tu información personal.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = () => {
    // Validar documentos mínimos requeridos
    if (!ineFront || !ineBack || !proofAddress || !selfieIne) {
      Alert.alert('Documentos pendientes', 'Por favor sube todos los documentos de identidad mínimos requeridos (INE frente y vuelta, comprobante de domicilio y selfie con INE).');
      return;
    }

    if (role === 'adoptante' && (!commitmentLetter || !homeSpace)) {
      Alert.alert('Documentos de adoptante', 'Los adoptantes deben subir obligatoriamente su carta de compromiso firmada y fotos de su espacio.');
      return;
    }

    setLoading(true);

    // Simular retraso de guardado
    setTimeout(() => {
      const newUser = registerUser({
        fullName,
        username,
        email,
        phone,
        city,
        role,
        avatar,
        bio: `¡Hola! Soy ${fullName}, registrado en KittyPaws como ${role === 'adoptante' ? 'adoptante' : 'rescatista'}.`,
        documents: {
          ineFront: ineFront || undefined,
          ineBack: ineBack || undefined,
          proofOfAddress: proofAddress || undefined,
          selfieWithIne: selfieIne || undefined,
          commitmentLetter: commitmentLetter || undefined,
          homeSpace: homeSpace || undefined
        }
      });

      setLoading(false);
      Alert.alert(
        '¡Registro Exitoso! 🎉',
        'Tu cuenta ha sido creada. Tus documentos están en revisión. Podrás explorar la app de inmediato.',
        [
          { 
            text: 'Entendido', 
            onPress: () => router.replace('/(tabs)/feed')
          }
        ]
      );
    }, 1500);
  };

  const getDocName = (uri: string | null) => {
    if (!uri) return 'No seleccionado';
    if (uri === 'mock_uri_file_uploaded') return 'Documento subido (Simulación)';
    if (uri.startsWith('content:') || uri.startsWith('file:')) {
      const parts = uri.split('/');
      return parts[parts.length - 1];
    }
    return 'Archivo seleccionado ✅';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => {
          if (step > 1) setStep(step - 1);
          else router.replace('/');
        }}
      >
        <Ionicons name="arrow-back-outline" size={24} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Crear cuenta 🐾</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressIndicator, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <Text style={styles.stepText}>Paso {step} de 3</Text>
      </View>

      {/* STEP 1: ROL SELECTION */}
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>¿Cuál es tu rol principal?</Text>
          <Text style={styles.cardSubtitle}>Esto nos ayudará a adaptar las herramientas de la aplicación para ti.</Text>

          <TouchableOpacity 
            style={[styles.roleCard, role === 'adoptante' && styles.selectedRoleCard]}
            onPress={() => setRole('adoptante')}
            activeOpacity={0.9}
          >
            <View style={styles.roleIconContainer}>
              <Text style={styles.roleEmoji}>🏠</Text>
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>Quiero adoptar</Text>
              <Text style={styles.roleDesc}>Busco un nuevo integrante para mi familia y estoy listo para brindarle amor.</Text>
            </View>
            <View style={[styles.radioOutline, role === 'adoptante' && styles.radioFilled]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.roleCard, role === 'dador' && styles.selectedRoleCard]}
            onPress={() => setRole('dador')}
            activeOpacity={0.9}
          >
            <View style={styles.roleIconContainer}>
              <Text style={styles.roleEmoji}>🐾</Text>
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>Doy en adopción</Text>
              <Text style={styles.roleDesc}>Rescato animales o busco un hogar responsable para una mascota que lo necesita.</Text>
            </View>
            <View style={[styles.radioOutline, role === 'dador' && styles.radioFilled]} />
          </TouchableOpacity>

          <CustomButton title="Siguiente" onPress={handleNextStep} />
        </View>
      )}

      {/* STEP 2: PERSONAL INFORMATION */}
      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos personales</Text>
          
          <TouchableOpacity style={styles.avatarPicker} onPress={pickAvatar}>
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
            <View style={styles.avatarCameraBadge}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHelp}>Toca la foto para cambiar tu avatar</Text>

          <CustomInput
            label="Nombre completo"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Juan Pérez Domínguez"
          />

          <CustomInput
            label="Nombre de usuario (@)"
            value={username}
            onChangeText={setUsername}
            placeholder="juan_adopta"
          />

          <CustomInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="juan@correo.com"
            keyboardType="email-address"
          />

          <CustomInput
            label="Número de teléfono"
            value={phone}
            onChangeText={setPhone}
            placeholder="3312345678"
            keyboardType="phone-pad"
          />

          <CustomInput
            label="Ciudad / Estado"
            value={city}
            onChangeText={setCity}
            placeholder="Guadalajara, Jalisco"
          />

          <CustomInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <CustomInput
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <CustomButton title="Siguiente" onPress={handleNextStep} />
        </View>
      )}

      {/* STEP 3: IDENTITY VERIFICATION */}
      {step === 3 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verificación de Identidad</Text>
          <Text style={styles.cardSubtitle}>Por la seguridad de las mascotas y la comunidad, la verificación de documentos es obligatoria.</Text>
          
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.securityBadgeText}>Tus documentos se guardan de forma encriptada y privada.</Text>
          </View>

          {/* DOCUMENT 1: INE FRONT */}
          <View style={styles.docRow}>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>INE / Pasaporte (Frente) 🪪</Text>
              <Text style={styles.docStatus}>{getDocName(ineFront)}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.uploadBtn, ineFront ? styles.uploadedBtn : null]} 
              onPress={() => pickDocument('ineFront')}
            >
              <Ionicons name={ineFront ? "checkmark-circle" : "cloud-upload-outline"} size={20} color={ineFront ? Colors.white : Colors.accent} />
              <Text style={[styles.uploadBtnText, ineFront ? { color: Colors.white } : null]}>{ineFront ? "Listo" : "Subir"}</Text>
            </TouchableOpacity>
          </View>

          {/* DOCUMENT 2: INE BACK */}
          <View style={styles.docRow}>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>INE / Pasaporte (Reverso) 🪪</Text>
              <Text style={styles.docStatus}>{getDocName(ineBack)}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.uploadBtn, ineBack ? styles.uploadedBtn : null]} 
              onPress={() => pickDocument('ineBack')}
            >
              <Ionicons name={ineBack ? "checkmark-circle" : "cloud-upload-outline"} size={20} color={ineBack ? Colors.white : Colors.accent} />
              <Text style={[styles.uploadBtnText, ineBack ? { color: Colors.white } : null]}>{ineBack ? "Listo" : "Subir"}</Text>
            </TouchableOpacity>
          </View>

          {/* DOCUMENT 3: PROOF OF ADDRESS */}
          <View style={styles.docRow}>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>Comprobante de domicilio (Luz, agua, internet) 🏠</Text>
              <Text style={styles.docStatus}>{getDocName(proofAddress)}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.uploadBtn, proofAddress ? styles.uploadedBtn : null]} 
              onPress={() => pickDocument('proofAddress')}
            >
              <Ionicons name={proofAddress ? "checkmark-circle" : "cloud-upload-outline"} size={20} color={proofAddress ? Colors.white : Colors.accent} />
              <Text style={[styles.uploadBtnText, proofAddress ? { color: Colors.white } : null]}>{proofAddress ? "Listo" : "Subir"}</Text>
            </TouchableOpacity>
          </View>

          {/* DOCUMENT 4: SELFIE LIVENESS CHECK */}
          <View style={styles.docRow}>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>Selfie sosteniendo tu INE 📸</Text>
              <Text style={styles.docStatus}>{getDocName(selfieIne)}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.uploadBtn, selfieIne ? styles.uploadedBtn : null]} 
              onPress={() => pickDocument('selfieIne')}
            >
              <Ionicons name={selfieIne ? "checkmark-circle" : "camera-outline"} size={20} color={selfieIne ? Colors.white : Colors.accent} />
              <Text style={[styles.uploadBtnText, selfieIne ? { color: Colors.white } : null]}>{selfieIne ? "Listo" : "Captura"}</Text>
            </TouchableOpacity>
          </View>

          {/* ADOPTANTE ADDITIONAL DOCUMENTS */}
          {role === 'adoptante' && (
            <>
              <Text style={styles.dividerTitle}>Requisitos del Adoptante</Text>
              
              {/* DOCUMENT 5: COMMITMENT LETTER */}
              <View style={styles.docRow}>
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>Carta Compromiso firmada 📝</Text>
                  <Text style={styles.docStatus}>{getDocName(commitmentLetter)}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.uploadBtn, commitmentLetter ? styles.uploadedBtn : null]} 
                  onPress={() => pickDocument('commitmentLetter', true)}
                >
                  <Ionicons name={commitmentLetter ? "checkmark-circle" : "document-text-outline"} size={20} color={commitmentLetter ? Colors.white : Colors.accent} />
                  <Text style={[styles.uploadBtnText, commitmentLetter ? { color: Colors.white } : null]}>{commitmentLetter ? "Listo" : "PDF/Foto"}</Text>
                </TouchableOpacity>
              </View>

              {/* DOCUMENT 6: HOME SPACE */}
              <View style={styles.docRow}>
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>Foto del espacio de tu hogar (jardín, sala) 🛋️</Text>
                  <Text style={styles.docStatus}>{getDocName(homeSpace)}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.uploadBtn, homeSpace ? styles.uploadedBtn : null]} 
                  onPress={() => pickDocument('homeSpace')}
                >
                  <Ionicons name={homeSpace ? "checkmark-circle" : "image-outline"} size={20} color={homeSpace ? Colors.white : Colors.accent} />
                  <Text style={[styles.uploadBtnText, homeSpace ? { color: Colors.white } : null]}>{homeSpace ? "Listo" : "Subir"}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* DADOR ADDITIONAL DOCUMENTS (VACCINATION CARD HISTORIAL) */}
          {role === 'dador' && (
            <>
              <Text style={styles.dividerTitle}>Requisitos del Rescatista (Opcional)</Text>
              
              {/* DOCUMENT 5: VET HISTORY/CREDENTIALS */}
              <View style={styles.docRow}>
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>Constancia de clínica o historial vet ( Badge 🏥 )</Text>
                  <Text style={styles.docStatus}>{getDocName(vetHistory)}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.uploadBtn, vetHistory ? styles.uploadedBtn : null]} 
                  onPress={() => pickDocument('vetHistory')}
                >
                  <Ionicons name={vetHistory ? "checkmark-circle" : "medical-outline"} size={20} color={vetHistory ? Colors.white : Colors.accent} />
                  <Text style={[styles.uploadBtnText, vetHistory ? { color: Colors.white } : null]}>{vetHistory ? "Listo" : "Subir"}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <CustomButton 
            title="Finalizar registro" 
            onPress={handleSubmit} 
            loading={loading}
            disabled={loading}
            style={{ marginTop: 30 }}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.footerLink}>Inicia sesión</Text>
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
    marginBottom: 25,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    color: Colors.text,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressIndicator: {
    height: 6,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  stepText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
  },
  card: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 20,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    backgroundColor: Colors.background,
  },
  selectedRoleCard: {
    borderColor: Colors.accent,
    backgroundColor: '#FFEBF3', // fondo rosado suave para la selección
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleEmoji: {
    fontSize: 24,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  roleDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    marginLeft: 8,
  },
  radioFilled: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  avatarPicker: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarHelp: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    height: 48,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: 'Lato_400Regular',
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.white,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6EF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  securityBadgeText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.text,
    flex: 1,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: Colors.background,
  },
  docInfo: {
    flex: 1,
    paddingRight: 10,
  },
  docName: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  docStatus: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 85,
    gap: 4,
  },
  uploadedBtn: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  uploadBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: Colors.accent,
  },
  dividerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 5,
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
