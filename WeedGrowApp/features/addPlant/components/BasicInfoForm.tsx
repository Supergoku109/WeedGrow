// features/addPlant/components/BasicInfoForm.tsx

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { WeedGrowDropdownInput } from '@/ui/WeedGrowDropdownInput';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import type { PlantForm } from '@/features/plants/form/PlantForm';
import type { Step2BasicInfoLogic } from '../hooks/useStep2BasicInfo';

interface BasicInfoFormProps {
  form: PlantForm;
  logic: Step2BasicInfoLogic;
  next(): void;
  back(): void;
}

export function BasicInfoForm({ form, logic, next, back }: BasicInfoFormProps) {
  return (
    <WeedGrowCard style={{ width: '100%', maxWidth: 480 }}>
      <View style={{ padding: 16, gap: 16 }}>
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

          <WeedGrowDropdownInput
            icon="dna"
            label="Strain"
            value={form.strain || 'Unknown'}
            options={[{ label: 'Unknown', value: 'Unknown' }, ...logic.filteredStrains.map(opt => ({ label: opt, value: opt }))]}
            onSelect={val => logic.setField('strain', val)}
            placeholder="Select strain"
          />
        </WeedGrowFormSection>

        {/* Remove Growth Stage selection, now handled in Step 1 */}

        {/* Show Age only if growthStage is vegetative, flowering, or clone */}
        {(form.growthStage === 'vegetative' || form.growthStage === 'flowering' || form.growthStage === 'clone') && (
          <>
            <WeedGrowFormSection label="Age">
              <WeedGrowTextInput
                label="Age in Days"
                value={form.ageDays}
                onChangeText={(val: string) => logic.setField('ageDays', val)}
                keyboardType="numeric"
                icon="calendar"
              />
            </WeedGrowFormSection>
            <WeedGrowFormSection label="Environment">
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                {['outdoor', 'greenhouse', 'indoor'].map((env) => (
                  <TouchableOpacity
                    key={env}
                    style={{
                      backgroundColor: form.environment === env ? '#4caf50' : '#232a25',
                      borderColor: form.environment === env ? '#8bc34a' : 'transparent',
                      borderWidth: 2,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 100,
                      height: 90,
                      marginHorizontal: 4,
                      elevation: 2,
                    }}
                    onPress={() => logic.setField('environment', env)}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons
                      name={env === 'outdoor' ? 'weather-sunny' : env === 'greenhouse' ? 'greenhouse' : 'home'}
                      size={32}
                      color={form.environment === env ? '#fff' : '#8bc34a'}
                    />
                    <ThemedText style={{
                      color: form.environment === env ? '#fff' : '#8bc34a',
                      fontWeight: '600',
                      fontSize: 15,
                      marginTop: 8,
                    }}>{env.charAt(0).toUpperCase() + env.slice(1)}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </WeedGrowFormSection>
          </>
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
      </View>
    </WeedGrowCard>
  );
}
