import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Pet,
  AdoptionRequest,
  ChatMessage,
  PostAdoptionUpdate,
  AppNotification,
  Review,
  Comment,
  seedUsers,
  seedPets,
  seedUpdates
} from '../services/seedData';

interface KittyState {
  users: User[];
  pets: Pet[];
  updates: PostAdoptionUpdate[];
  requests: AdoptionRequest[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  currentUser: User | null;
  initialized: boolean;

  // Actions
  initializeStore: () => void;
  login: (email: string) => boolean;
  loginAsUser: (userId: string) => void;
  logout: () => void;
  registerUser: (user: Omit<User, 'id' | 'rating' | 'reviewsCount' | 'reviews' | 'verified'>) => User;
  updateUserBio: (userId: string, bio: string) => void;
  updateUserDocuments: (userId: string, docs: User['documents']) => void;
  updateVerificationStatus: (userId: string, status: User['verified']) => void;
  
  addPet: (pet: Omit<Pet, 'id' | 'createdAt' | 'status' | 'comments'>) => Pet;
  toggleLikePet: (petId: string) => void;
  addCommentToPet: (petId: string, text: string) => void;
  
  submitAdoptionRequest: (request: Omit<AdoptionRequest, 'id' | 'status' | 'createdAt' | 'step' | 'handoverConfirmedByAdopter' | 'handoverConfirmedByRescuer'>) => AdoptionRequest;
  updateRequestStatus: (requestId: string, status: AdoptionRequest['status']) => void;
  advanceRequestStep: (requestId: string) => void;
  confirmHandover: (requestId: string, role: 'adoptante' | 'dador') => void;
  
  sendChatMessage: (requestId: string, text: string, senderId: string) => void;
  triggerMockReply: (requestId: string, lastUserMessage: string) => void;
  
  addPostAdoptionUpdate: (update: Omit<PostAdoptionUpdate, 'id' | 'likes' | 'likedBy' | 'comments' | 'createdAt'>) => void;
  toggleLikeUpdate: (updateId: string) => void;
  addCommentToUpdate: (updateId: string, text: string) => void;
  
  submitReview: (userId: string, rating: number, comment: string, tags: string[]) => void;
  addNotification: (userId: string, title: string, message: string, type: AppNotification['type'], refId: string) => void;
  markNotificationsAsRead: (userId: string) => void;
  clearStore: () => void;
}

export const useKittyStore = create<KittyState>()(
  persist(
    (set, get) => ({
      users: [],
      pets: [],
      updates: [],
      requests: [],
      messages: [],
      notifications: [],
      currentUser: null,
      initialized: false,

      initializeStore: () => {
        if (get().initialized) return;
        set({
          users: seedUsers,
          pets: seedPets,
          updates: seedUpdates,
          requests: [],
          messages: [],
          notifications: [],
          currentUser: seedUsers[4], // Default logeado Carlos García (Adoptante) para demostración inmediata
          initialized: true
        });

        // Generar algunas notificaciones semilla para Carlos
        get().addNotification(
          'u5',
          '¡Bienvenido a KittyPaws! 🐾',
          'Tu cuenta ha sido creada y tus documentos están listos para revisión.',
          'system',
          'u5'
        );
      },

      login: (email: string) => {
        const user = get().users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      loginAsUser: (userId: string) => {
        const user = get().users.find(u => u.id === userId);
        if (user) {
          set({ currentUser: user });
        }
      },

      logout: () => {
        set({ currentUser: null });
      },

      registerUser: (userData) => {
        const newId = `u_${Date.now()}`;
        const newUser: User = {
          ...userData,
          id: newId,
          rating: 5.0,
          reviewsCount: 0,
          reviews: [],
          verified: 'pending' // Comienza pendiente hasta subir documentos
        };

        set(state => ({
          users: [...state.users, newUser],
          currentUser: newUser
        }));

        get().addNotification(
          newId,
          'Cuenta registrada 📝',
          'Tu cuenta fue creada. Completa tu verificación subiendo documentos en tu perfil.',
          'system',
          newId
        );

        return newUser;
      },

      updateUserBio: (userId, bio) => {
        set(state => {
          const updatedUsers = state.users.map(u => u.id === userId ? { ...u, bio } : u);
          const updatedCurrentUser = state.currentUser?.id === userId ? { ...state.currentUser, bio } : state.currentUser;
          return { users: updatedUsers, currentUser: updatedCurrentUser };
        });
      },

      updateUserDocuments: (userId, docs) => {
        set(state => {
          const updatedUsers = state.users.map(u => {
            if (u.id === userId) {
              const updatedDocs = { ...u.documents, ...docs };
              // Al subir documentos obligatorios, el estado pasa a pending
              return { ...u, documents: updatedDocs, verified: 'pending' as const };
            }
            return u;
          });
          const updatedCurrentUser = state.currentUser?.id === userId 
            ? { ...state.currentUser, documents: { ...state.currentUser.documents, ...docs }, verified: 'pending' as const } 
            : state.currentUser;
          return { users: updatedUsers, currentUser: updatedCurrentUser };
        });

        get().addNotification(
          userId,
          'Documentos recibidos 📋',
          'Tus documentos están en revisión por nuestro equipo. Tiempo estimado: 10 minutos.',
          'system',
          userId
        );
      },

      updateVerificationStatus: (userId, status) => {
        set(state => {
          const updatedUsers = state.users.map(u => u.id === userId ? { ...u, verified: status } : u);
          const updatedCurrentUser = state.currentUser?.id === userId ? { ...state.currentUser, verified: status } : state.currentUser;
          return { users: updatedUsers, currentUser: updatedCurrentUser };
        });

        const statusLabel = status === 'verified' ? 'Verificado ✅' : status === 'rejected' ? 'Rechazado ❌' : 'En revisión 🕐';
        const msg = status === 'verified' 
          ? '¡Felicidades! Tu identidad ha sido verificada. Ya puedes adoptar y dar en adopción sin límites.'
          : status === 'rejected'
          ? 'Tus documentos no son legibles. Por favor, sube una foto clara del INE y comprobante.'
          : 'Tus documentos se encuentran en revisión.';

        get().addNotification(
          userId,
          `Estado de verificación: ${statusLabel}`,
          msg,
          'status',
          userId
        );
      },

      addPet: (petData) => {
        const newId = `p_${Date.now()}`;
        const newPet: Pet = {
          ...petData,
          id: newId,
          createdAt: new Date().toISOString(),
          status: 'disponible',
          comments: []
        };

        set(state => ({
          pets: [newPet, ...state.pets]
        }));

        // Notificar seguidores o al propio creador
        get().addNotification(
          petData.ownerId,
          'Mascota publicada 🐾',
          `Tu publicación de ${petData.name} se ha subido correctamente.`,
          'system',
          newId
        );

        return newPet;
      },

      toggleLikePet: (petId) => {
        const currentUserId = get().currentUser?.id;
        if (!currentUserId) return;

        set(state => {
          const updatedPets = state.pets.map(p => {
            if (p.id === petId) {
              const tags = [...p.tags];
              const likedIndex = tags.indexOf('liked');
              if (likedIndex > -1) {
                tags.splice(likedIndex, 1);
              } else {
                tags.push('liked');
              }
              return { ...p, tags };
            }
            return p;
          });
          return { pets: updatedPets };
        });
      },

      addCommentToPet: (petId, text) => {
        const user = get().currentUser;
        if (!user) return;

        const newComment: Comment = {
          id: `c_${Date.now()}`,
          userId: user.id,
          username: user.username,
          userAvatar: user.avatar,
          text,
          createdAt: new Date().toISOString()
        };

        set(state => {
          const updatedPets = state.pets.map(p => {
            if (p.id === petId) {
              return { ...p, comments: [...p.comments, newComment] };
            }
            return p;
          });
          return { pets: updatedPets };
        });

        // Notificar al dueño del animal
        const pet = get().pets.find(p => p.id === petId);
        if (pet && pet.ownerId !== user.id) {
          get().addNotification(
            pet.ownerId,
            'Nuevo comentario 💬',
            `@${user.username} comentó en la publicación de ${pet.name}: "${text.substring(0, 30)}..."`,
            'comment',
            petId
          );
        }
      },

      submitAdoptionRequest: (reqData) => {
        const newId = `req_${Date.now()}`;
        const newRequest: AdoptionRequest = {
          ...reqData,
          id: newId,
          status: 'pendiente',
          step: 1,
          handoverConfirmedByAdopter: false,
          handoverConfirmedByRescuer: false,
          createdAt: new Date().toISOString()
        };

        set(state => ({
          requests: [newRequest, ...state.requests]
        }));

        // Poner la mascota en estado 'proceso'
        set(state => ({
          pets: state.pets.map(p => p.id === reqData.petId ? { ...p, status: 'proceso' as const } : p)
        }));

        // Notificar al dador original
        get().addNotification(
          reqData.ownerId,
          'Nueva solicitud de adopción 🐾',
          `${reqData.requesterName} quiere adoptar a ${reqData.petName}.`,
          'request',
          newId
        );

        // Crear primer mensaje del chat con el mensaje de presentación
        const chatMsgId = `msg_${Date.now()}`;
        const firstMsg: ChatMessage = {
          id: chatMsgId,
          requestId: newId,
          senderId: reqData.requesterId,
          text: `Mensaje de presentación: ${reqData.presentationMessage}\n\nDetalles:\n- ¿Tiene otras mascotas?: ${reqData.hasOtherPets ? 'Sí' : 'No'}\n- ¿Tiene niños en casa?: ${reqData.hasChildren ? 'Sí' : 'No'}\n- ¿Tiene patio/jardín?: ${reqData.hasGarden ? 'Sí' : 'No'}\n- Horas que pasará solo: ${reqData.hoursAlone} hrs.`,
          createdAt: new Date().toISOString()
        };

        set(state => ({
          messages: [...state.messages, firstMsg]
        }));

        // Lanzar una respuesta automática del dador simulada después de 2 segundos
        setTimeout(() => {
          get().triggerMockReply(newId, reqData.presentationMessage);
        }, 2000);

        return newRequest;
      },

      updateRequestStatus: (requestId, status) => {
        set(state => {
          const updatedRequests = state.requests.map(r => {
            if (r.id === requestId) {
              // Si el estado es entregado, marcar la mascota como adoptada
              if (status === 'entregado') {
                set(st => ({
                  pets: st.pets.map(p => p.id === r.petId ? { ...p, status: 'adoptado' as const, adopterId: r.requesterId } : p)
                }));

                // Agregar automáticamente a las actualizaciones del timeline una entrada inicial
                const updateId = `up_${Date.now()}`;
                const newUp: PostAdoptionUpdate = {
                  id: updateId,
                  petId: r.petId,
                  petName: r.petName,
                  updaterId: r.requesterId,
                  updaterName: r.requesterName,
                  updaterAvatar: r.requesterAvatar,
                  description: `¡Oficialmente adoptado! 🎉 Bienvenido a tu nuevo hogar, ${r.petName}.`,
                  images: [r.petImage],
                  likes: 0,
                  likedBy: [],
                  comments: [],
                  isPublic: true,
                  createdAt: new Date().toISOString(),
                  timeLabel: 'Día 1'
                };
                set(st => ({ updates: [newUp, ...st.updates] }));
              }
              return { ...r, status, step: status === 'entregado' ? 5 : r.step };
            }
            return r;
          });
          return { requests: updatedRequests };
        });

        // Notificar al solicitante
        const req = get().requests.find(r => r.id === requestId);
        if (req) {
          const statusLabels: Record<string, string> = {
            info_requerida: 'Solicitud: Más información solicitada 💬',
            aceptado: '¡Solicitud aceptada! 🎉',
            rechazado: 'Solicitud rechazada ❌',
            entregado: '¡Adopción completada! 🏆'
          };
          const statusMsgs: Record<string, string> = {
            info_requerida: `El dador de ${req.petName} te ha enviado un mensaje pidiendo más detalles. Revisa tu chat.`,
            aceptado: `Tu solicitud para adoptar a ${req.petName} fue aprobada. Chatea con el dador para coordinar la entrega.`,
            rechazado: `Desafortunadamente, la solicitud para adoptar a ${req.petName} no fue aprobada en esta ocasión.`,
            entregado: `¡Confirmamos la entrega de ${req.petName}! Recuerda subir fotos de seguimiento para mantener al dador al tanto.`
          };

          if (statusLabels[status]) {
            get().addNotification(
              req.requesterId,
              statusLabels[status],
              statusMsgs[status],
              'status',
              requestId
            );
          }
        }
      },

      advanceRequestStep: (requestId) => {
        set(state => {
          const updatedRequests = state.requests.map(r => {
            if (r.id === requestId) {
              const nextStep = Math.min(5, r.step + 1);
              let nextStatus = r.status;
              if (nextStep === 2) nextStatus = 'info_requerida';
              if (nextStep === 3) nextStatus = 'info_requerida';
              if (nextStep === 4) nextStatus = 'aceptado';
              
              // Simular mensaje automático del bot de la app
              setTimeout(() => {
                let replyText = '';
                if (nextStep === 2) {
                  replyText = `🤖 [KittyPaws Bot]: El dador está revisando tus documentos de identidad. ¡Se ven muy bien! Procedamos al Paso 3: Revisión de Espacio Hogar.`;
                } else if (nextStep === 3) {
                  replyText = `🤖 [KittyPaws Bot]: Las fotos del espacio de tu hogar han sido aprobadas. Procedamos al Paso 4: Firma del contrato de adopción digital.`;
                } else if (nextStep === 4) {
                  replyText = `🤖 [KittyPaws Bot]: El contrato digital de adopción ha sido firmado por ambas partes. Procedamos al Paso 5: Coordinar entrega.`;
                }
                if (replyText) {
                  // Mensaje especial enviado por la cuenta de sistema
                  const newMsg: ChatMessage = {
                    id: `msg_bot_${Date.now()}`,
                    requestId,
                    senderId: 'system',
                    text: replyText,
                    createdAt: new Date().toISOString()
                  };
                  set(st => ({ messages: [...st.messages, newMsg] }));
                }
              }, 1000);

              return { ...r, step: nextStep, status: nextStatus as any };
            }
            return r;
          });
          return { requests: updatedRequests };
        });
      },

      confirmHandover: (requestId, role) => {
        set(state => {
          const updatedRequests = state.requests.map(r => {
            if (r.id === requestId) {
              const updated = {
                ...r,
                handoverConfirmedByAdopter: role === 'adoptante' ? true : r.handoverConfirmedByAdopter,
                handoverConfirmedByRescuer: role === 'dador' ? true : r.handoverConfirmedByRescuer
              };
              
              if (updated.handoverConfirmedByAdopter && updated.handoverConfirmedByRescuer) {
                // Ambos confirmados, completar la adopción
                setTimeout(() => {
                  get().updateRequestStatus(requestId, 'entregado');
                }, 500);
              }
              
              return updated;
            }
            return r;
          });
          return { requests: updatedRequests };
        });
      },

      sendChatMessage: (requestId, text, senderId) => {
        const newMsg: ChatMessage = {
          id: `msg_${Date.now()}`,
          requestId,
          senderId,
          text,
          createdAt: new Date().toISOString()
        };

        set(state => ({
          messages: [...state.messages, newMsg]
        }));

        // Si el remitente es el usuario logueado (adopter), disparar respuesta mock del dador
        const req = get().requests.find(r => r.id === requestId);
        if (req && senderId === req.requesterId) {
          setTimeout(() => {
            get().triggerMockReply(requestId, text);
          }, 1500);
        }
      },

      triggerMockReply: (requestId, lastUserMessage) => {
        const req = get().requests.find(r => r.id === requestId);
        if (!req) return;

        let replyText = '';
        const msgClean = lastUserMessage.toLowerCase();

        if (msgClean.includes('hola') || msgClean.includes('presentación')) {
          replyText = `¡Hola! Qué gusto saludarte. Vi tu solicitud para adoptar a ${req.petName} y tu mensaje de presentación. Se ve que tienes mucho interés. ¿Es tu primera vez adoptando o ya tienes experiencia cuidando mascotas?`;
        } else if (msgClean.includes('experiencia') || msgClean.includes('sí') || msgClean.includes('tengo') || msgClean.includes('perro') || msgClean.includes('gato')) {
          replyText = `¡Excelente! Eso me da mucha tranquilidad. Me gustaría coordinar una videollamada corta o reunirnos en la veterinaria local para conocernos y que veas a ${req.petName}. ¿Te queda bien el fin de semana o prefieres un día entre semana por la tarde?`;
        } else if (msgClean.includes('fin de semana') || msgClean.includes('sábado') || msgClean.includes('domingo') || msgClean.includes('tarde') || msgClean.includes('semana')) {
          replyText = `¡Perfecto! Nos vemos entonces. De hecho, voy a proceder a **Aceptar tu solicitud** aquí en la aplicación para avanzar en el proceso y que podamos confirmar la entrega una vez que lo tengas contigo. ¡Gracias por abrirle las puertas de tu hogar!`;
          // Cambiar estado a aceptado automáticamente
          setTimeout(() => {
            get().updateRequestStatus(requestId, 'aceptado');
          }, 3000);
        } else {
          replyText = `Entendido. Coordinemos los detalles de la entrega de ${req.petName}. Cualquier otra duda que tengas sobre sus vacunas o cuidados, dime y con gusto te platico.`;
        }

        const newMsg: ChatMessage = {
          id: `msg_mock_${Date.now()}`,
          requestId,
          senderId: req.ownerId, // Enviado por el rescatista
          text: replyText,
          createdAt: new Date().toISOString()
        };

        set(state => ({
          messages: [...state.messages, newMsg]
        }));

        // Crear notificación de chat
        get().addNotification(
          req.requesterId,
          `Mensaje de ${req.ownerName} 💬`,
          replyText.substring(0, 50) + '...',
          'comment',
          requestId
        );
      },

      addPostAdoptionUpdate: (upData) => {
        const newId = `up_${Date.now()}`;
        const newUp: PostAdoptionUpdate = {
          ...upData,
          id: newId,
          likes: 0,
          likedBy: [],
          comments: [],
          createdAt: new Date().toISOString()
        };

        set(state => ({
          updates: [newUp, ...state.updates]
        }));

        // Notificar al dueño original (rescatista/dador)
        const pet = get().pets.find(p => p.id === upData.petId);
        if (pet) {
          get().addNotification(
            pet.ownerId,
            `¡Actualización de ${upData.petName}! ❤️`,
            `${upData.updaterName} subió fotos de: ${upData.timeLabel}.`,
            'like',
            newId
          );
        }
      },

      toggleLikeUpdate: (updateId) => {
        const userId = get().currentUser?.id;
        if (!userId) return;

        set(state => {
          const updated = state.updates.map(up => {
            if (up.id === updateId) {
              const likedBy = [...up.likedBy];
              const idx = likedBy.indexOf(userId);
              let likes = up.likes;
              if (idx > -1) {
                likedBy.splice(idx, 1);
                likes = Math.max(0, likes - 1);
              } else {
                likedBy.push(userId);
                likes += 1;

                // Notificar al creador del update si es otra persona
                if (up.updaterId !== userId) {
                  get().addNotification(
                    up.updaterId,
                    'Le gustó tu actualización ❤️',
                    `A alguien le gustó tu foto de seguimiento de ${up.petName}.`,
                    'like',
                    updateId
                  );
                }
              }
              return { ...up, likedBy, likes };
            }
            return up;
          });
          return { updates: updated };
        });
      },

      addCommentToUpdate: (updateId, text) => {
        const user = get().currentUser;
        if (!user) return;

        const newComment: Comment = {
          id: `c_${Date.now()}`,
          userId: user.id,
          username: user.username,
          userAvatar: user.avatar,
          text,
          createdAt: new Date().toISOString()
        };

        set(state => {
          const updated = state.updates.map(up => {
            if (up.id === updateId) {
              // Notificar
              if (up.updaterId !== user.id) {
                get().addNotification(
                  up.updaterId,
                  'Comentario en actualización 💬',
                  `@${user.username} comentó tu seguimiento: "${text.substring(0, 30)}..."`,
                  'comment',
                  updateId
                );
              }
              return { ...up, comments: [...up.comments, newComment] };
            }
            return up;
          });
          return { updates: updated };
        });
      },

      submitReview: (userId, rating, comment, tags) => {
        const reviewer = get().currentUser;
        if (!reviewer) return;

        const newReview: Review = {
          id: `rev_${Date.now()}`,
          fromUser: reviewer.id,
          fromName: reviewer.fullName,
          fromAvatar: reviewer.avatar,
          rating,
          comment,
          date: new Date().toISOString().split('T')[0],
          tags
        };

        set(state => {
          const updatedUsers = state.users.map(u => {
            if (u.id === userId) {
              const reviews = [...u.reviews, newReview];
              const reviewsCount = reviews.length;
              const avgRating = Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1));
              return { ...u, reviews, reviewsCount, rating: avgRating };
            }
            return u;
          });

          const updatedCurrentUser = state.currentUser?.id === userId
            ? updatedUsers.find(u => u.id === userId) || state.currentUser
            : state.currentUser;

          return { users: updatedUsers, currentUser: updatedCurrentUser };
        });

        get().addNotification(
          userId,
          'Nueva reseña recibida ⭐',
          `@${reviewer.username} te dejó una calificación de ${rating} estrellas.`,
          'review',
          userId
        );
      },

      addNotification: (userId, title, message, type, refId) => {
        const newNotif: AppNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          userId,
          title,
          message,
          type,
          referenceId: refId,
          read: false,
          createdAt: new Date().toISOString()
        };

        set(state => ({
          notifications: [newNotif, ...state.notifications]
        }));
      },

      markNotificationsAsRead: (userId) => {
        set(state => ({
          notifications: state.notifications.map(n => n.userId === userId ? { ...n, read: true } : n)
        }));
      },

      clearStore: () => {
        set({
          users: [],
          pets: [],
          updates: [],
          requests: [],
          messages: [],
          notifications: [],
          currentUser: null,
          initialized: false
        });
      }
    }),
    {
      name: 'kitty-store',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
