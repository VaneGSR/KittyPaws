import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useKittyStore } from '../../../store/kittyStore';
import { AdoptionRequest, ChatMessage } from '../../../services/seedData';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function AdoptDashboardScreen() {
  const router = useRouter();
  const currentUser = useKittyStore(state => state.currentUser);
  const requests = useKittyStore(state => state.requests);
  const messages = useKittyStore(state => state.messages);
  const sendChatMessage = useKittyStore(state => state.sendChatMessage);
  const advanceRequestStep = useKittyStore(state => state.advanceRequestStep);
  const confirmHandover = useKittyStore(state => state.confirmHandover);

  const [activePanel, setActivePanel] = useState<'tracker' | 'chats'>('tracker');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  
  const scrollViewRef = useRef<ScrollView>(null);

  const getChatHistory = (reqId: string) => messages.filter(m => m.requestId === reqId);

  // Auto-scroll chat al final
  useEffect(() => {
    if (selectedRequestId && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [selectedRequestId, messages]);

  if (!currentUser) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Inicia sesión para gestionar tus adopciones.</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace('/login')}>
          <Text style={styles.loginBtnText}>Ir al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Filtrar solicitudes según el rol del usuario
  const myRequests = requests.filter(req => 
    currentUser.role === 'adoptante' 
      ? req.requesterId === currentUser.id 
      : req.ownerId === currentUser.id
  );

  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  const handleSendMessage = () => {
    if (!typedMessage.trim() || !selectedRequestId) return;
    
    // Enviar el mensaje del usuario
    sendChatMessage(selectedRequestId, typedMessage, currentUser.id);
    setTypedMessage('');
  };

  const handleConfirmDelivery = (requestId: string) => {
    confirmHandover(requestId, currentUser.role);
    Alert.alert('¡Excelente! 🎉', 'Has confirmado la entrega. Una vez que ambas partes confirmen, la mascota aparecerá como Adoptada y podrás subir fotos de seguimiento.');
  };

  const getStepIndicator = (req: AdoptionRequest) => {
    const steps = [
      { num: 1, label: 'Solicitud', icon: 'document-text-outline' },
      { num: 2, label: 'Docs', icon: 'shield-checkmark-outline' },
      { num: 3, label: 'Espacio', icon: 'home-outline' },
      { num: 4, label: 'Contrato', icon: 'pencil-outline' },
      { num: 5, label: 'Entrega', icon: 'gift-outline' }
    ];

    return (
      <View style={styles.stepperContainer}>
        {steps.map((st, idx) => {
          const completed = req.step >= st.num;
          const active = req.step === st.num;
          return (
            <View key={st.num} style={styles.stepWrapper}>
              <View style={[
                styles.stepCircle,
                completed && styles.stepCircleCompleted,
                active && styles.stepCircleActive
              ]}>
                <Ionicons 
                  name={st.icon as any} 
                  size={16} 
                  color={completed ? Colors.white : active ? Colors.accent : Colors.textSecondary} 
                />
              </View>
              <Text style={[
                styles.stepLabel, 
                completed && styles.stepLabelCompleted,
                active && styles.stepLabelActive
              ]}>
                {st.label}
              </Text>
              {idx < steps.length - 1 && (
                <View style={[
                  styles.stepLine,
                  req.step > st.num && styles.stepLineCompleted
                ]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER DE PANELES */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Adopciones y Coordinación</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity 
            style={[styles.toggleTab, activePanel === 'tracker' && styles.activeToggleTab]}
            onPress={() => {
              setActivePanel('tracker');
              setSelectedRequestId(null);
            }}
          >
            <Text style={[styles.toggleTabText, activePanel === 'tracker' && styles.activeToggleTabText]}>
              Tracker
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toggleTab, activePanel === 'chats' && styles.activeToggleTab]}
            onPress={() => {
              setActivePanel('chats');
              setSelectedRequestId(null);
            }}
          >
            <Text style={[styles.toggleTabText, activePanel === 'chats' && styles.activeToggleTabText]}>
              Chats Activos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RENDER CUERPO */}
      {!selectedRequestId ? (
        /* VISTA LISTAS GENERALES */
        myRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>No tienes procesos de adopción activos en este momento.</Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.exploreBtnText}>Explorar Mascotas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={myRequests}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const otherPartyName = currentUser.role === 'adoptante' ? item.ownerName : item.requesterName;
              const otherPartyAvatar = currentUser.role === 'adoptante' ? item.ownerAvatar : item.requesterAvatar;
              
              const statusColors = {
                'pendiente': '#E3F2FD',
                'info_requerida': '#FFF3E0',
                'aceptado': '#E8F5E9',
                'entregado': '#FFE6EF',
                'rechazado': '#FFEBEE'
              };
              
              const statusText = {
                'pendiente': 'Pendiente',
                'info_requerida': 'Info Requerida',
                'aceptado': 'Aprobada',
                'entregado': 'Entregada 🎉',
                'rechazado': 'Rechazada'
              };

              if (activePanel === 'tracker') {
                return (
                  <TouchableOpacity 
                    style={styles.card}
                    activeOpacity={0.95}
                    onPress={() => setSelectedRequestId(item.id)}
                  >
                    <View style={styles.cardTopRow}>
                      <Image source={{ uri: item.petImage }} style={styles.petAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.petName}>Adopción de {item.petName}</Text>
                        <Text style={styles.otherPartyText}>Caregiver: {otherPartyName}</Text>
                      </View>
                      <View style={[styles.statusTag, { backgroundColor: statusColors[item.status] || Colors.border }]}>
                        <Text style={styles.statusText}>{statusText[item.status] || item.status}</Text>
                      </View>
                    </View>
                    
                    {/* Stepper pequeño */}
                    <Text style={styles.progressHeader}>Progreso del proceso:</Text>
                    {getStepIndicator(item)}

                    <View style={styles.cardFooter}>
                      <Text style={styles.clickPrompt}>Toca para chatear y avanzar paso 💬</Text>
                      <Ionicons name="chevron-forward" size={16} color={Colors.accent} />
                    </View>
                  </TouchableOpacity>
                );
              } else {
                // PANEL CHATS
                const chatHistory = getChatHistory(item.id);
                const lastMsg = chatHistory[chatHistory.length - 1];
                const senderName = lastMsg ? (lastMsg.senderId === 'system' ? 'Bot' : lastMsg.senderId === item.requesterId ? item.requesterName : item.ownerName) : '';
                return (
                  <TouchableOpacity 
                    style={styles.chatRow}
                    onPress={() => setSelectedRequestId(item.id)}
                  >
                    <Image source={{ uri: otherPartyAvatar }} style={styles.chatAvatar} />
                    <View style={{ flex: 1 }}>
                      <View style={styles.chatHeaderRow}>
                        <Text style={styles.chatName}>{otherPartyName}</Text>
                        <Text style={styles.chatTime}>
                          {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </Text>
                      </View>
                      <Text style={styles.chatMessagePreview} numberOfLines={1}>
                        {lastMsg ? `${senderName}: ${lastMsg.text}` : 'Inicia la conversación...'}
                      </Text>
                      <Text style={styles.chatPetSubtitle}>Mascota: {item.petName}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }
            }}
          />
        )
      ) : (
        /* VISTA DETALLE DE COORDINACIÓN Y CHAT INTEGRADO */
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <View style={styles.chatDetailsContainer}>
            {/* Header del chat */}
            <View style={styles.chatDetailHeader}>
              <TouchableOpacity 
                style={styles.chatBackBtn} 
                onPress={() => setSelectedRequestId(null)}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Image source={{ uri: selectedRequest?.petImage }} style={styles.chatDetailPetAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.chatDetailPetName}>{selectedRequest?.petName}</Text>
                <Text style={styles.chatDetailParty}>Caregiver: {currentUser.role === 'adoptante' ? selectedRequest?.ownerName : selectedRequest?.requesterName}</Text>
              </View>
              
              {/* Botón de información para ver resumen del cuestionario */}
              <TouchableOpacity 
                style={styles.chatInfoBtn}
                onPress={() => {
                  Alert.alert(
                    'Detalles del Solicitante 🏠',
                    `Presentación: "${selectedRequest?.presentationMessage}"\n\n¿Otras mascotas?: ${selectedRequest?.hasOtherPets ? 'Sí' : 'No'}\n¿Niños?: ${selectedRequest?.hasChildren ? 'Sí' : 'No'}\n¿Jardín?: ${selectedRequest?.hasGarden ? 'Sí' : 'No'}\nHoras solo: ${selectedRequest?.hoursAlone} hrs/día`
                  );
                }}
              >
                <Ionicons name="information-circle-outline" size={24} color={Colors.accent} />
              </TouchableOpacity>
            </View>

            {/* Stepper detallado en la parte superior del chat */}
            <View style={styles.chatStepperWrapper}>
              {selectedRequest && getStepIndicator(selectedRequest)}
            </View>

            {/* Historial de Mensajes */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.messagesScroll}
              contentContainerStyle={{ padding: 15 }}
            >
              {selectedRequest && getChatHistory(selectedRequest.id).map((msg: ChatMessage) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <View 
                    key={msg.id} 
                    style={[
                      styles.messageBubbleContainer, 
                      isMe ? styles.myBubbleContainer : styles.otherBubbleContainer
                    ]}
                  >
                    <View style={[
                      styles.messageBubble,
                      isMe ? styles.myBubble : styles.otherBubble
                    ]}>
                      <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                        {msg.text}
                      </Text>
                      <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.otherMessageTime]}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Acciones flotantes según el paso actual de la simulación */}
            {selectedRequest && (
              <View style={styles.chatQuickActionsBox}>
                {selectedRequest.step === 1 && (
                  <View style={styles.actionPromptBox}>
                    <Text style={styles.actionPromptText}>🚀 Paso 1: Saluda en el chat para pasar a revisar tus documentos.</Text>
                  </View>
                )}

                {selectedRequest.step === 2 && (
                  <TouchableOpacity 
                    style={styles.quickStepBtn}
                    onPress={() => advanceRequestStep(selectedRequest.id)}
                  >
                    <Ionicons name="checkbox" size={18} color={Colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.quickStepText}>Aprobar Documentos y pasar a Revisar Espacio</Text>
                  </TouchableOpacity>
                )}

                {selectedRequest.step === 3 && (
                  <TouchableOpacity 
                    style={styles.quickStepBtn}
                    onPress={() => advanceRequestStep(selectedRequest.id)}
                  >
                    <Ionicons name="home" size={18} color={Colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.quickStepText}>Aprobar Espacio Físico (Paso 3)</Text>
                  </TouchableOpacity>
                )}

                {selectedRequest.step === 4 && (
                  <TouchableOpacity 
                    style={styles.quickStepBtn}
                    onPress={() => advanceRequestStep(selectedRequest.id)}
                  >
                    <Ionicons name="create" size={18} color={Colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.quickStepText}>Firmar Contrato Digital (Paso 4)</Text>
                  </TouchableOpacity>
                )}

                {selectedRequest.step === 5 && (
                  <View style={styles.handoverActionsRow}>
                    <TouchableOpacity 
                      style={[
                        styles.handoverConfirmBtn, 
                        selectedRequest.handoverConfirmedByAdopter && styles.handoverBtnConfirmed
                      ]}
                      onPress={() => handleConfirmDelivery(selectedRequest.id)}
                      disabled={currentUser.role === 'adoptante' ? selectedRequest.handoverConfirmedByAdopter : selectedRequest.handoverConfirmedByRescuer}
                    >
                      <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                      <Text style={styles.handoverBtnText}>
                        {currentUser.role === 'adoptante' 
                          ? (selectedRequest.handoverConfirmedByAdopter ? 'Esperando Rescatista...' : 'Confirmar Recibido ✅')
                          : (selectedRequest.handoverConfirmedByRescuer ? 'Esperando Adoptante...' : 'Confirmar Entregado ✅')
                        }
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Input de chat */}
            <View style={styles.chatInputContainer}>
              <TextInput 
                style={styles.chatTextInput}
                placeholder="Escribe tu mensaje..."
                placeholderTextColor={Colors.textSecondary}
                value={typedMessage}
                onChangeText={setTypedMessage}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity 
                style={styles.chatSendBtn} 
                onPress={handleSendMessage}
              >
                <Ionicons name="send" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
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
  header: {
    backgroundColor: Colors.white,
    paddingTop: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: Colors.text,
    marginBottom: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: Colors.background,
  },
  toggleTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeToggleTab: {
    borderBottomColor: Colors.accent,
  },
  toggleTabText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activeToggleTabText: {
    color: Colors.accent,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  exploreBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
  },
  exploreBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  petName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.text,
    marginBottom: 2,
  },
  otherPartyText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: Colors.text,
  },
  progressHeader: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: Colors.text,
    marginBottom: 10,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  stepWrapper: {
    alignItems: 'center',
    width: '18%',
    position: 'relative',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircleActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.white,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  stepLabel: {
    fontFamily: 'Lato_400Regular',
    fontSize: 8,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: Colors.accent,
    fontFamily: 'Lato_700Bold',
  },
  stepLabelCompleted: {
    color: Colors.text,
  },
  stepLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.border,
    width: '100%',
    left: '50%',
    top: 14,
    zIndex: 1,
  },
  stepLineCompleted: {
    backgroundColor: Colors.accent,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    paddingTop: 12,
    marginTop: 8,
  },
  clickPrompt: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.accent,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.text,
  },
  chatTime: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  chatMessagePreview: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  chatPetSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    color: Colors.accent,
  },
  chatDetailsContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chatBackBtn: {
    padding: 8,
    marginRight: 8,
  },
  chatDetailPetAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    marginRight: 10,
  },
  chatDetailPetName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.text,
  },
  chatDetailParty: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  chatInfoBtn: {
    padding: 8,
  },
  chatStepperWrapper: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  messagesScroll: {
    flex: 1,
  },
  messageBubbleContainer: {
    width: '100%',
    marginVertical: 4,
    flexDirection: 'row',
  },
  myBubbleContainer: {
    justifyContent: 'flex-end',
  },
  otherBubbleContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  myBubble: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  myMessageText: {
    color: Colors.white,
  },
  otherMessageText: {
    color: Colors.text,
  },
  messageTime: {
    fontFamily: 'Lato_400Regular',
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: Colors.textSecondary,
  },
  chatQuickActionsBox: {
    backgroundColor: Colors.white,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionPromptBox: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionPromptText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
  },
  quickStepBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  quickStepText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: Colors.white,
  },
  handoverActionsRow: {
    width: '100%',
  },
  handoverConfirmBtn: {
    backgroundColor: '#388E3C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  handoverBtnConfirmed: {
    backgroundColor: '#81C784',
    opacity: 0.8,
  },
  handoverBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: Colors.white,
    marginLeft: 6,
  },
  chatInputContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
    gap: 10,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chatSendBtn: {
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
