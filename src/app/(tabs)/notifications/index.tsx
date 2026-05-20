import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useKittyStore } from '../../../store/kittyStore';
import { AppNotification } from '../../../services/seedData';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const router = useRouter();
  const currentUser = useKittyStore(state => state.currentUser);
  const notifications = useKittyStore(state => state.notifications);
  const markNotificationsAsRead = useKittyStore(state => state.markNotificationsAsRead);

  const handleNotificationPress = (notif: AppNotification) => {
    switch (notif.type) {
      case 'like':
      case 'comment':
        if (notif.referenceId) {
          router.push(`/adoption/${notif.referenceId}/tracking`);
        }
        break;
      case 'system':
        router.push('/(tabs)/profile');
        break;
      case 'request':
        router.push('/(tabs)/adopt');
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return { name: 'heart', color: Colors.accent };
      case 'comment':
        return { name: 'chatbubble', color: '#1565C0' };
      case 'system':
        return { name: 'shield-checkmark', color: Colors.success };
      case 'request':
        return { name: 'paw', color: '#E65100' };
      default:
        return { name: 'notifications', color: Colors.textSecondary };
    }
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      markNotificationsAsRead(currentUser.id);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notificaciones 🔔</Text>
          <Text style={styles.headerSubtitle}>Entérate de la actividad en tu comunidad</Text>
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
            <Text style={styles.markReadText}>Marcar leídas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de Notificaciones */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.bellWrapper}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>Todo al día</Text>
          <Text style={styles.emptyText}>No tienes notificaciones pendientes.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const iconConfig = getIcon(item.type);
            return (
              <TouchableOpacity 
                style={[styles.notificationCard, !item.read && styles.unreadCard]}
                activeOpacity={0.8}
                onPress={() => handleNotificationPress(item)}
              >
                <View style={[styles.iconContainer, { backgroundColor: iconConfig.color + '20' }]}>
                  <Ionicons name={iconConfig.name as any} size={20} color={iconConfig.color} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={[styles.notificationText, !item.read && styles.unreadText]}>
                    {item.title}
                  </Text>
                  <Text style={styles.notificationDesc}>{item.message}</Text>
                  <Text style={styles.notificationTime}>
                    {new Date(item.createdAt).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                {!item.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: Colors.text,
  },
  headerSubtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  markReadBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  markReadText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: Colors.text,
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
    gap: 12,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  unreadText: {
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  notificationDesc: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    opacity: 0.8,
  },
  notificationTime: {
    fontFamily: 'Lato_400Regular',
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 4,
    opacity: 0.6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  bellWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
