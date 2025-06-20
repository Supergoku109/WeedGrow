import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Text, Container, Button, Input } from '@/design-system';
import { ColorTokens, Spacing, BorderRadius } from '@/design-system/tokens';
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

  const handleSubmit = () => {
    onSubmit({ description });
    setDescription(''); // Reset form
  };

  const handleCancel = () => {
    onCancel();
    setDescription(''); // Reset form
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <Container style={styles.sheet}>
          <Text variant="h3" align="center" style={{ marginBottom: Spacing.md }}>
            {label}
          </Text>
          
          <Input
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ marginBottom: Spacing.lg }}
          />
          
          <Container direction="row" gap={Spacing.sm}>
            <Button
              variant="secondary"
              onPress={handleCancel}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onPress={handleSubmit}
              style={{ flex: 1 }}
            >
              Save
            </Button>
          </Container>
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
});
