// features/addPlant/components/BasicInfoForm.tsx

import React from 'react';
import { ScrollView, View } from 'react-native';
import {
  TextInput as PaperTextInput,
  Menu,
  SegmentedButtons,
  Button
} from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';

import type { PlantForm } from '@/features/plants/form/PlantForm';
import type { Step1BasicInfoLogic } from '../hooks/useStep1BasicInfo';

interface BasicInfoFormProps {
  form: PlantForm;
  logic: Step1BasicInfoLogic;
  next(): void;
  back(): void;
}

export function BasicInfoForm({ form, logic, next, back }: BasicInfoFormProps) {
  return (
    <WeedGrowCard style={{ width: '100%', maxWidth: 480 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>
          🌱 Let’s start with the basics
        </ThemedText>

        <WeedGrowFormSection label="Plant Details">
          <WeedGrowTextInput
            label="Plant Name"
            value={form.name}
            onChangeText={(val: string) => logic.setField('name', val)}
            icon="sprout"
          />

          <Menu
            visible={logic.strainMenuVisible}
            onDismiss={logic.closeStrainMenu}
            anchor={
              <WeedGrowTextInput
                label="Strain"
                value={form.strain || 'Unknown'}
                editable={false}
                right={<PaperTextInput.Icon icon="menu-down" onPress={logic.openStrainMenu} />}
                icon="dna"
              />
            }
          >
            <PaperTextInput
              placeholder="Search…"
              value={logic.strainSearch}
              onChangeText={logic.setStrainSearch}
              style={{ margin: 8 }}
            />
            {['Unknown', ...logic.filteredStrains].map(opt => (
              <Menu.Item
                key={opt}
                title={opt}
                onPress={() => {
                  logic.setField('strain', opt);
                  logic.closeStrainMenu();
                }}
              />
            ))}
          </Menu>
        </WeedGrowFormSection>

        <WeedGrowFormSection label="Growth Stage">
          <SegmentedButtons
            value={form.growthStage}
            onValueChange={(val: string) => logic.setField('growthStage', val)}
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
              onChangeText={(val: string) => logic.setField('ageDays', val)}
              keyboardType="numeric"
              icon="calendar"
            />
          </WeedGrowFormSection>
        )}

        <WeedGrowButtonRow>
          <Button
            mode="outlined"
            onPress={back}
            style={{ flex: 1, marginRight: 8 }}
            labelStyle={{ fontWeight: '600' }}
          >
            Back
          </Button>
          <Button
            mode="contained"
            onPress={next}
            disabled={!logic.isValid}
            style={{ flex: 1 }}
            labelStyle={{ fontWeight: '600' }}
          >
            Next
          </Button>
        </WeedGrowButtonRow>
      </ScrollView>
    </WeedGrowCard>
  );
}
