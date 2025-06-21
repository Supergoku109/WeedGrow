/**
 * Modal component for editing group details
 * This component renders a modal for editing group details, including the group name and plant membership.
 * It provides form state, validation, and save/cancel actions.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, StyleSheet, TextInput, Button, ScrollView } from 'react-native';
import { ThemedText } from '@/ui/ThemedText';
import { ThemedView } from '@/ui/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GroupWithId } from '../api/groupApi';
import { PlantWithId } from '../hooks/useGroupDetail';

// Props for the EditGroupModal component
interface EditGroupModalProps {
  visible: boolean;
  group: GroupWithId;
  allPlants: PlantWithId[];
  onClose: () => void;
  onSave?: (updatedGroup: GroupWithId) => void;
}

/**
 * Modal for editing group details including name and plant membership
 */
export default function EditGroupModal({ visible, group, allPlants, onClose, onSave }: EditGroupModalProps) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  
  // Form state for group name and plant selection
  const [name, setName] = useState(group?.name || '');
  const [plantIds, setPlantIds] = useState<string[]>(group?.plantIds || []);
  const [nameError, setNameError] = useState<string | null>(null);

  // Sync state with props when group changes
  useEffect(() => {
    if (group) {
      setName(group.name || '');
      setPlantIds(group.plantIds || []);
      setNameError(null);
    }
  }, [group]);

  /**
   * Toggle a plant's inclusion in the group
   */
  const togglePlantInGroup = useCallback((plantId: string) => {
    setPlantIds((currentIds) =>
      currentIds.includes(plantId)
        ? currentIds.filter(id => id !== plantId)
        : [...currentIds, plantId]
    );
  }, []);

  /**
   * Validate and save group changes
   */
  const handleSave = useCallback(() => {
    // Validate form
    if (!name.trim()) {
      setNameError('Group name cannot be empty');
      return;
    }

    if (onSave && group) {
      onSave({ 
        ...group, 
        name: name.trim(), 
        plantIds 
      });
    }
    onClose();
  }, [name, plantIds, onSave, group, onClose]);

  // Don't render anything if not visible
  if (!visible) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ThemedView style={styles.modal}>
          <ThemedText type="title" style={styles.modalTitle}>Edit Group</ThemedText>          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (text.trim()) setNameError(null);
            }}
            placeholder="Group Name"
            style={[
              styles.input, 
              { color: Colors[theme].text, borderColor: nameError ? '#ff6b6b' : Colors[theme].gray }
            ]}
            placeholderTextColor={Colors[theme].gray}
          />
          {nameError && (
            <ThemedText style={styles.errorText}>{nameError}</ThemedText>
          )}
          
          <ThemedText style={styles.sectionHeader}>Plants in Group</ThemedText>
          <ScrollView style={styles.plantList}>
            {allPlants.map((plant) => (
              <View key={plant.id} style={styles.plantRow}>
                <ThemedText>{plant.name}</ThemedText>
                <Button
                  title={plantIds.includes(plant.id) ? 'Remove' : 'Add'}
                  onPress={() => togglePlantInGroup(plant.id)}
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
  modalTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 12,
    fontSize: 14,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  plantList: {
    maxHeight: 200,
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
});
