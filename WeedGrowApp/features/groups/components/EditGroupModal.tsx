/**
 * Modal component for editing group details
 * This component renders a modal for editing group details, including the group name and plant membership.
 * It provides form state, validation, and save/cancel actions.
 */
import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Modal, View, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GroupWithId } from '../api/groupApi';
import { PlantWithId } from '../hooks/useGroupDetail';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { ColorTokens, Typography, Spacing } from '@/design-system/tokens';

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
      <ThemedText accessibilityRole="text" style={styles.plantName}>{plant.name}</ThemedText>
      {isMember ? (
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${plant.name} from group`}
          style={({ pressed }) => [
            styles.toggleChip,
            styles.removeChip,
            pressed && styles.btnPressed,
          ]}
        >
          <MaterialCommunityIcons
            name="minus-circle-outline"
            size={16}
            color="#fecaca"
            style={{ marginRight: 6 }}
          />
          <ThemedText style={[styles.toggleText, styles.removeText]}>Remove</ThemedText>
        </Pressable>
      ) : (
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={`Add ${plant.name} to group`}
          style={({ pressed }) => [
            styles.toggleChip,
            styles.toggleOff,
            pressed && styles.btnPressed,
          ]}
        >
          <MaterialCommunityIcons
            name={'plus'}
            size={16}
            color={'#dbeafe'}
            style={{ marginRight: 6 }}
          />
          <ThemedText style={[styles.toggleText, styles.toggleTextOff]}>
            Add
          </ThemedText>
        </Pressable>
      )}
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
        <LinearGradient
          colors={[ThemeColorsBgStart, ThemeColorsBgEnd] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.modal, theme === 'dark' ? styles.modalDark : styles.modalLight]}
        >
          {/* Accent sweep */}
          <LinearGradient
            colors={['rgba(16,185,129,0.22)', 'rgba(59,130,246,0.16)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.accent}
          />

          {/* Header */}
          <View style={styles.headerRow}>
            <ThemedText type="title" style={styles.modalTitle} accessibilityRole="header">Edit Group</ThemedText>
            <Pressable onPress={onClose} style={styles.iconBtn} accessibilityLabel="Close">
              <Feather name="x" size={22} color={ColorTokens.text.secondary} />
            </Pressable>
          </View>

          {/* Name input */}
          <TextInput
            value={name}
            onChangeText={handleNameChange}
            placeholder="Group Name"
            style={[
              styles.input,
              theme === 'dark' ? styles.inputDark : styles.inputLight,
              { borderColor: nameError ? ColorTokens.status.error : 'rgba(255,255,255,0.08)' },
            ]}
            placeholderTextColor={ColorTokens.text.secondary}
            accessibilityLabel="Group Name"
            accessibilityHint="Enter the group name"
            autoFocus
            returnKeyType="done"
            maxLength={40}
          />
          {nameError && (
            <ThemedText style={styles.errorText} accessibilityRole="alert">{nameError}</ThemedText>
          )}

          {/* Members */}
          <ThemedText style={styles.sectionHeader} accessibilityRole="header">Plants in Group</ThemedText>
          <ScrollView style={styles.plantList} contentContainerStyle={{ paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
            {plantRows}
          </ScrollView>

          {/* Actions */}
          <View style={styles.buttonRow}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.actionBtn, styles.cancelBtn, pressed && styles.btnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing group"
            >
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </Pressable>

            <LinearGradient
              colors={[ColorTokens.brand.primary, ColorTokens.brand.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveGradient}
            >
              <Pressable
                onPress={handleSave}
                style={({ pressed }) => [styles.actionBtn, styles.saveBtn, pressed && styles.btnPressed]}
                accessibilityRole="button"
                accessibilityLabel="Save group changes"
              >
                <MaterialCommunityIcons name="content-save" size={18} color="#fff" style={{ marginRight: 8 }} />
                <ThemedText style={styles.saveText}>Save</ThemedText>
              </Pressable>
            </LinearGradient>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
});

export default EditGroupModal;

// Compute solid gradient bases per theme
const ThemeColorsBgStart = 'rgba(20, 24, 31, 1)';
const ThemeColorsBgEnd = 'rgba(20, 24, 31, 1)';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  modalDark: {
    backgroundColor: ColorTokens.background.card,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  modalLight: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  accent: {
    position: 'absolute',
    top: -60,
    right: -80,
    width: 280,
    height: 220,
    transform: [{ rotate: '20deg' }],
    borderRadius: 140,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    ...Typography.styles.h3,
    color: ColorTokens.text.primary,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 6,
  },
  inputDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: ColorTokens.text.primary,
  },
  inputLight: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    color: '#111827',
  },
  errorText: {
    color: ColorTokens.status.error,
    marginBottom: 8,
    fontSize: 14,
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 8,
    ...Typography.styles.label,
    color: ColorTokens.text.secondary,
  },
  plantList: {
    maxHeight: 320,
    marginBottom: 4,
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  plantName: {
    ...Typography.styles.body,
    color: ColorTokens.text.primary,
  },
  toggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  toggleOn: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderColor: 'rgba(16,185,129,0.25)',
  },
  toggleOff: {
    backgroundColor: 'rgba(59,130,246,0.14)',
    borderColor: 'rgba(59,130,246,0.22)',
  },
  // New explicit remove style for members
  removeChip: {
    backgroundColor: 'rgba(248,113,113,0.16)',
    borderColor: 'rgba(248,113,113,0.28)',
  },
  toggleText: {
    ...Typography.styles.label,
  },
  toggleTextOn: {
    color: '#d1fae5',
  },
  toggleTextOff: {
    color: '#dbeafe',
  },
  removeText: {
    color: '#fecaca',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
  },
  cancelText: {
    color: ColorTokens.text.primary,
    fontWeight: '700',
  },
  saveGradient: {
    flex: 1,
    borderRadius: 12,
  },
  saveBtn: {
    backgroundColor: 'transparent',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.8,
  },
});
