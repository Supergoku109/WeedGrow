import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View
} from 'react-native';
import { TextInput, Menu, SegmentedButtons, Button } from 'react-native-paper';
import StepIndicatorBar from '@/ui/StepIndicatorBar';
import { ThemedText } from '@/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import type { PlantForm } from '@/features/plants/form/PlantForm';

interface AddPlantStepProps {
  form: PlantForm;
  setField: (field: keyof PlantForm, value: any) => void;
  next?: () => void;
  back?: () => void;
}

export default function Step1BasicInfo({ form, setField, next }: AddPlantStepProps) {
  const strains = ['Sativa', 'Indica', 'Hybrid'];
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  const [strainMenu, setStrainMenu] = useState(false);
  const [strainSearch, setStrainSearch] = useState('');

  const isValid = form.name.trim().length > 0 && (form.growthStage === 'vegetative' || form.growthStage === 'flowering' ? form.ageDays.trim().length : true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            <StepIndicatorBar currentPosition={0} />
            <WeedGrowCard style={{ marginTop: 8 }}>
              <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>🌱 Let’s start with the basics</ThemedText>

              <WeedGrowFormSection label="Plant Details">
                <WeedGrowTextInput
                  label="Plant Name"
                  value={form.name}
                  onChangeText={(val: string) => setField('name', val)}
                  icon="sprout"
                />

                <Menu visible={strainMenu} onDismiss={() => setStrainMenu(false)}
                  anchor={
                    <WeedGrowTextInput
                      label="Strain"
                      value={form.strain || 'Unknown'}
                      editable={false}
                      right={<TextInput.Icon icon="menu-down" onPress={() => setStrainMenu(true)} />}
                      icon="dna"
                    />
                  }>
                  <TextInput placeholder="Search..." value={strainSearch} onChangeText={setStrainSearch} style={{ margin: 8 }} />
                  {['Unknown', ...strains.filter(s => s.toLowerCase().includes(strainSearch.toLowerCase()))].map(opt => (
                    <Menu.Item key={opt} title={opt} onPress={() => { setField('strain', opt); setStrainMenu(false); setStrainSearch(''); }} />
                  ))}
                </Menu>
              </WeedGrowFormSection>

              <WeedGrowFormSection label="Growth Stage">
                <SegmentedButtons
                  value={form.growthStage}
                  onValueChange={(val) => setField('growthStage', val)}
                  buttons={[
                    { value: 'germination', label: 'Germination', icon: 'seed' },
                    { value: 'seedling', label: 'Seedling', icon: 'leaf' },
                    { value: 'vegetative', label: 'Vegetative', icon: 'tree' },
                    { value: 'flowering', label: 'Flowering', icon: 'flower' },
                  ]}
                />
              </WeedGrowFormSection>

              {(form.growthStage === 'vegetative' || form.growthStage === 'flowering') && (
                <WeedGrowFormSection label="Age">
                  <WeedGrowTextInput
                    label="Age in Days"
                    value={form.ageDays}
                    onChangeText={(val: string) => setField('ageDays', val)}
                    keyboardType="numeric"
                    icon="calendar"
                  />
                </WeedGrowFormSection>
              )}

              <WeedGrowButtonRow>
                <Button mode="contained" disabled={!isValid} onPress={next}>Next</Button>
              </WeedGrowButtonRow>
            </WeedGrowCard>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
