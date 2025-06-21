// CareForm.tsx
// This component renders the Care Details step of the Add Plant flow.
// It collects information about watering, fertilizer, pest history, and training techniques for a plant.

import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { WeedGrowDropdownInput } from '@/ui/WeedGrowDropdownInput';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import type { PlantForm } from '@/features/plants/form/PlantForm';
import type { Step4CareLogic } from '../hooks/useStep4Care';

// Props for the CareForm component
interface CareFormProps {
  form: PlantForm; // Form state object
  logic: Step4CareLogic; // Logic handlers for care step
  next(): void; // Callback to go to next step
  back(): void; // Callback to go to previous step
}

// Title section for the form
const TitleSection = () => (
  <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>
    💧 Care Details
  </ThemedText>
);

// Section for watering frequency and fertilizer input
const WateringSection = ({ form, logic }: { form: PlantForm; logic: Step4CareLogic }) => (
  <WeedGrowFormSection label="Watering & Fertilizer">
    {/* Dropdown for watering frequency */}
    <WeedGrowDropdownInput
      icon="water"
      label="Watering Frequency"
      value={form.wateringFrequency || ''}
      options={logic.wateringOptions.map(opt => ({ label: opt, value: opt }))}
      onSelect={(val: string) => logic.setField('wateringFrequency', val)}
      placeholder="Select frequency"
    />
    {/* Text input for fertilizer */}
    <WeedGrowTextInput
      label="Fertilizer"
      value={form.fertilizer || ''}
      onChangeText={(val: string) => logic.setField('fertilizer', val)}
      icon="leaf"
    />
  </WeedGrowFormSection>
);

// Section for selecting pest history using chips
const PestSection = ({ form, logic }: { form: PlantForm; logic: Step4CareLogic }) => (
  <WeedGrowFormSection label="Pest History">
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {logic.pestOptions.map(p => (
        <Chip
          key={p}
          selected={form.pests?.includes(p)}
          onPress={() => logic.togglePest(p)}
          style={{
            backgroundColor: form.pests?.includes(p) ? logic.tint : '#223c2b',
            borderRadius: 8
          }}
          textStyle={{
            color: form.pests?.includes(p) ? '#fff' : logic.textColor,
            fontWeight: '600'
          }}
        >
          {p}
        </Chip>
      ))}
    </View>
  </WeedGrowFormSection>
);

// Section for selecting training techniques using chips
const TrainingSection = ({ form, logic }: { form: PlantForm; logic: Step4CareLogic }) => (
  <WeedGrowFormSection label="Training Techniques">
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {logic.trainingOptions.map(t => (
        <Chip
          key={t}
          selected={form.trainingTags?.includes(t)}
          onPress={() => logic.toggleTraining(t)}
          style={{
            backgroundColor: form.trainingTags?.includes(t) ? logic.tint : '#223c2b',
            borderRadius: 8
          }}
          textStyle={{
            color: form.trainingTags?.includes(t) ? '#fff' : logic.textColor,
            fontWeight: '600'
          }}
        >
          {t}
        </Chip>
      ))}
    </View>
  </WeedGrowFormSection>
);

// Main form component for entering care details
export function CareForm({ form, logic, next, back }: CareFormProps) {
  return (
    <WeedGrowCard style={{ width: '100%', maxWidth: 480 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        <TitleSection />
        <WateringSection form={form} logic={logic} />
        <PestSection form={form} logic={logic} />
        <TrainingSection form={form} logic={logic} />

        {/* Navigation buttons: Back and Next */}
        <WeedGrowButtonRow>
          <Button mode="outlined" onPress={back} style={{ flex: 1 }}>
            Back
          </Button>
          <Button mode="contained" onPress={next} style={{ flex: 1 }}>
            Next
          </Button>
        </WeedGrowButtonRow>
      </ScrollView>
    </WeedGrowCard>
  );
}
