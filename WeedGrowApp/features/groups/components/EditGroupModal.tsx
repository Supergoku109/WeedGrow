import React, { useState } from 'react';
import { Modal, View, StyleSheet, TextInput, Button, Text, ScrollView } from 'react-native';
import { ThemedText } from '@/ui/ThemedText';
import { ThemedView } from '@/ui/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface EditGroupModalProps {
  visible: boolean;
  group: any;
  allPlants: any[];
  onClose: () => void;
  onSave?: (group: any) => void;
}

export default function EditGroupModal({ visible, group, allPlants, onClose, onSave }: EditGroupModalProps) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const [name, setName] = useState(group?.name || '');
  const [plantIds, setPlantIds] = useState<string[]>(group?.plantIds || []);

  React.useEffect(() => {
    setName(group?.name || '');
    setPlantIds(group?.plantIds || []);
  }, [group]);

  const handleSave = () => {
    if (onSave) {
      onSave({ ...group, name, plantIds });
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ThemedView style={[styles.modal, { backgroundColor: Colors[theme].background }] }>
          <ThemedText type="title" style={{ marginBottom: 16 }}>Edit Group</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Group Name"
            style={[styles.input, { color: Colors[theme].text, borderColor: Colors[theme].gray }]}
            placeholderTextColor={Colors[theme].gray}
          />
          <ThemedText style={{ marginTop: 16, marginBottom: 8 }}>Plants in Group</ThemedText>
          <ScrollView style={{ maxHeight: 200 }}>
            {allPlants.map((plant) => (
              <View key={plant.id} style={styles.plantRow}>
                <Text style={{ color: Colors[theme].text }}>{plant.name}</Text>
                <Button
                  title={plantIds.includes(plant.id) ? 'Remove' : 'Add'}
                  onPress={() => {
                    setPlantIds((ids) =>
                      ids.includes(plant.id)
                        ? ids.filter((id) => id !== plant.id)
                        : [...ids, plant.id]
                    );
                  }}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={onClose} color="#888" />
            <Button title="Save" onPress={handleSave} color={Colors[theme].tint} />
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
});
