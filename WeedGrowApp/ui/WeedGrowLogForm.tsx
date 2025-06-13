import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ThemedText } from './ThemedText';
import { LogType } from './WeedGrowLogTypeSheet';

interface WeedGrowLogFormProps {
  visible: boolean;
  logType: LogType;
  onSubmit: (fields: { description: string }) => void;
  onCancel: () => void;
}

export default function WeedGrowLogForm({ visible, logType, onSubmit, onCancel }: WeedGrowLogFormProps) {
  const [description, setDescription] = useState('');

  let label = '';
  switch (logType) {
    case 'watering': label = 'Water Log'; break;
    case 'feeding': label = 'Feeding Log'; break;
    case 'pests': label = 'Pest Log'; break;
    case 'training': label = 'Training Log'; break;
    case 'health': label = 'Health Log'; break;
    case 'notes': label = 'Note'; break;
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ThemedText style={styles.title}>{label}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View style={styles.row}>
            <TouchableOpacity style={styles.cancel} onPress={onCancel}><Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.submit} onPress={() => onSubmit({ description })}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text></TouchableOpacity>
          </View>
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
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    minHeight: 60,
    marginBottom: 18,
    backgroundColor: '#f8fafc',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancel: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    marginRight: 8,
  },
  submit: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    marginLeft: 8,
  },
});
