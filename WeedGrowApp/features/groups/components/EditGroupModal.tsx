/**
 * Modal component for editing group details
 * This component renders a modal for editing group details, including the group name and plant membership.
 * It provides form state, validation, and save/cancel actions.
 */
import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Modal, View, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
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

interface PlantRowProps {
  plant: PlantWithId;
  isMember: boolean;
  onToggle: (plantId: string) => void;
}

const PlantRow = memo(function PlantRow({ plant, isMember, onToggle }: PlantRowProps) {
  const handlePress = useCallback(() => onToggle(plant.id), [onToggle, plant.id]);
  return (
    <View style={styles.plantRow}>
      <ThemedText accessibilityRole="text">{plant.name}</ThemedText>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={isMember ? `Remove ${plant.name} from group` : `Add ${plant.name} to group`}
        style={({ pressed }) => [styles.plantButton, isMember ? styles.removeBtn : styles.addBtn, pressed && styles.btnPressed]}
      >
        <ThemedText style={styles.plantButtonText}>{isMember ? 'Remove' : 'Add'}</ThemedText>
      </Pressable>
    </View>
  );
});

const EditGroupModal = memo(function EditGroupModal({ visible, group, allPlants, onClose, onSave }: EditGroupModalProps) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const [name, setName] = useState(group?.name || '');
  const [plantIds, setPlantIds] = useState<string[]>(group?.plantIds || []);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    setName(group?.name || '');
    setPlantIds(group?.plantIds || []);
    setNameError(null);
  }, [group]);

  const togglePlantInGroup = useCallback((plantId: string) => {
    setPlantIds((currentIds) =>
      currentIds.includes(plantId)
        ? currentIds.filter(id => id !== plantId)
        : [...currentIds, plantId]
    );
  }, []);

  const handleSave = useCallback(() => {
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

  const handleNameChange = useCallback((text: string) => {
    setName(text);
    if (text.trim()) setNameError(null);
  }, []);

  const plantRows = useMemo(() =>
    allPlants.map((plant) => (
      <PlantRow
        key={plant.id}
        plant={plant}
        isMember={plantIds.includes(plant.id)}
        onToggle={togglePlantInGroup}
      />
    )), [allPlants, plantIds, togglePlantInGroup]
  );

  if (!visible) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ThemedView style={styles.modal}>
          <ThemedText type="title" style={styles.modalTitle} accessibilityRole="header">Edit Group</ThemedText>
          <TextInput
            value={name}
            onChangeText={handleNameChange}
            placeholder="Group Name"
            style={[
              styles.input,
              { color: Colors[theme].text, borderColor: nameError ? '#ff6b6b' : Colors[theme].gray }
            ]}
            placeholderTextColor={Colors[theme].gray}
            accessibilityLabel="Group Name"
            accessibilityHint="Enter the group name"
            autoFocus
            returnKeyType="done"
            maxLength={40}
          />
          {nameError && (
            <ThemedText style={styles.errorText} accessibilityRole="alert">{nameError}</ThemedText>
          )}
          <ThemedText style={styles.sectionHeader} accessibilityRole="header">Plants in Group</ThemedText>
          <ScrollView style={styles.plantList} keyboardShouldPersistTaps="handled">
            {plantRows}
          </ScrollView>
          <View style={styles.buttonRow}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.actionBtn, styles.cancelBtn, pressed && styles.btnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing group"
            >
              <ThemedText style={styles.actionBtnText}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [styles.actionBtn, styles.saveBtn, pressed && styles.btnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Save group changes"
            >
              <ThemedText style={styles.actionBtnText}>Save</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
});

export default EditGroupModal;

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
    backgroundColor: '#fff',
  },
  modalTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
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
    textAlign: 'left',
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  plantList: {
    maxHeight: 200,
    marginBottom: 8,
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 6,
  },
  plantButton: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    backgroundColor: '#e0f7e9',
  },
  removeBtn: {
    backgroundColor: '#ffeaea',
  },
  btnPressed: {
    opacity: 0.7,
  },
  plantButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
  },
  saveBtn: {
    backgroundColor: '#4caf50',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
});
