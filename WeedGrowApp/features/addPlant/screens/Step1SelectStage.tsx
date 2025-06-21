import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/ui/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STAGES = [
  { key: 'germination', label: 'Germination', icon: 'seed' },
  { key: 'seedling', label: 'Seedling', icon: 'sprout' },
  { key: 'vegetative', label: 'Vegetative', icon: 'leaf' },
  { key: 'flowering', label: 'Flowering', icon: 'flower' },
  { key: 'clone', label: 'Clone', icon: 'content-duplicate' },
];

export default function Step1SelectStage({ selectedStage, onSelectStage, next, back }: {
  selectedStage: string | null;
  onSelectStage: (stage: string) => void;
  next: () => void;
  back: () => void;
}) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Select Plant Stage</ThemedText>
      <View style={styles.cardRow}>
        {STAGES.map((stage) => (
          <TouchableOpacity
            key={stage.key}
            style={[styles.card, selectedStage === stage.key && styles.cardSelected]}
            onPress={() => onSelectStage(stage.key)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name={stage.icon as any} size={36} color={selectedStage === stage.key ? '#fff' : '#8bc34a'} />
            <ThemedText style={[styles.cardLabel, selectedStage === stage.key && styles.cardLabelSelected]}>
              {stage.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={back}>
          <ThemedText style={styles.buttonText}>Back</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !selectedStage && styles.buttonDisabled]}
          onPress={next}
          disabled={!selectedStage}
        >
          <ThemedText style={styles.buttonText}>Next</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181f1b',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 32,
    letterSpacing: 1,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 18,
  },
  card: {
    width: 110,
    height: 130,
    backgroundColor: '#232a25',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: '#4caf50',
    borderColor: '#8bc34a',
  },
  cardLabel: {
    marginTop: 12,
    color: '#8bc34a',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  cardLabelSelected: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 32,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 100,
  },
  backButton: {
    backgroundColor: '#232a25',
    borderWidth: 1,
    borderColor: '#8bc34a',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9e9e9e',
  },
});
