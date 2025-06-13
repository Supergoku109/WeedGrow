import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ThemedText } from './ThemedText';

export type LogType = 'watering' | 'feeding' | 'pests' | 'training' | 'health' | 'notes';

interface WeedGrowLogTypeSheetProps {
  visible: boolean;
  onSelect: (type: LogType) => void;
  onClose: () => void;
}

export default function WeedGrowLogTypeSheet({ visible, onSelect, onClose }: WeedGrowLogTypeSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ThemedText style={styles.title}>Add Log</ThemedText>
          <TouchableOpacity style={styles.item} onPress={() => onSelect('watering')}><Text style={styles.icon}>💧</Text><Text>Water</Text></TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => onSelect('feeding')}><Text style={styles.icon}>🧪</Text><Text>Feeding</Text></TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => onSelect('pests')}><Text style={styles.icon}>🪲</Text><Text>Pests</Text></TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => onSelect('training')}><Text style={styles.icon}>🌱</Text><Text>Training</Text></TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => onSelect('health')}><Text style={styles.icon}>❤️</Text><Text>Health</Text></TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => onSelect('notes')}><Text style={styles.icon}>📝</Text><Text>Notes</Text></TouchableOpacity>
          <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    paddingBottom: 32,
    alignItems: 'stretch',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  icon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  cancel: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 10,
  },
});
