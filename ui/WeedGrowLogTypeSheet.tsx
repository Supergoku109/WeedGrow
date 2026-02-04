import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Text, Container, Button } from '@/design-system';
import { ColorTokens, Spacing, BorderRadius } from '@/design-system/tokens';

export type LogType = 'watering' | 'feeding' | 'pests' | 'training' | 'health' | 'notes';

interface WeedGrowLogTypeSheetProps {
  visible: boolean;
  onSelect: (type: LogType) => void;
  onClose: () => void;
}

const LOG_TYPES = [
  { type: 'watering' as LogType, icon: '💧', label: 'Water' },
  { type: 'feeding' as LogType, icon: '🧪', label: 'Feeding' },
  { type: 'pests' as LogType, icon: '🪲', label: 'Pests' },
  { type: 'training' as LogType, icon: '🌱', label: 'Training' },
  { type: 'health' as LogType, icon: '❤️', label: 'Health' },
  { type: 'notes' as LogType, icon: '📝', label: 'Notes' },
];

export default function WeedGrowLogTypeSheet({ visible, onSelect, onClose }: WeedGrowLogTypeSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Container style={styles.sheet}>
          <Text variant="h3" align="center" style={{ marginBottom: Spacing.md }}>
            Add Log
          </Text>
          
          {LOG_TYPES.map(({ type, icon, label }) => (
            <TouchableOpacity
              key={type}
              style={styles.item}
              onPress={() => onSelect(type)}
            >
              <Text style={styles.icon}>{icon}</Text>
              <Text variant="body">{label}</Text>
            </TouchableOpacity>
          ))}
            <Button
            variant="ghost"
            onPress={onClose}
            style={{ marginTop: Spacing.lg }}
          >
            Cancel
          </Button>
        </Container>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: ColorTokens.background.primary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ColorTokens.border.secondary,
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
});
