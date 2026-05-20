import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface VerificationBadgeProps {
  type: 'identity' | 'vaccines' | 'pending';
}

export default function VerificationBadge({ type }: VerificationBadgeProps) {
  if (type === 'identity') {
    return (
      <View style={[styles.badge, styles.identityBadge]}>
        <Ionicons name="checkmark-circle" size={14} color="#2E7D32" style={{ marginRight: 4 }} />
        <Text style={[styles.text, { color: '#2E7D32' }]}>Identidad Verificada</Text>
      </View>
    );
  }

  if (type === 'vaccines') {
    return (
      <View style={[styles.badge, styles.vaccinesBadge]}>
        <Ionicons name="medical" size={14} color="#1565C0" style={{ marginRight: 4 }} />
        <Text style={[styles.text, { color: '#1565C0' }]}>Verificado 🏥</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.pendingBadge]}>
      <Ionicons name="time" size={14} color={Colors.textSecondary} style={{ marginRight: 4 }} />
      <Text style={[styles.text, { color: Colors.textSecondary }]}>Pendiente de revisión</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  identityBadge: {
    backgroundColor: '#E8F5E9',
  },
  vaccinesBadge: {
    backgroundColor: '#E3F2FD',
  },
  pendingBadge: {
    backgroundColor: Colors.border,
  },
  text: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
  },
});
