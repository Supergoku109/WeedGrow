// features/addPlant/components/BasicInfoForm.tsx

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { WeedGrowDropdownInput } from '@/ui/WeedGrowDropdownInput';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { AnimatedMakikoInput } from '@/components/ui/AnimatedMakikoInput';

import type { PlantForm } from '@/features/plants/form/PlantForm';
import type { Step1BasicInfoLogic } from '@/features/addPlant/hooks/useStep1BasicInfo';

interface BasicInfoFormProps {
  form: PlantForm;
  logic: Step1BasicInfoLogic;
  next(): void;
  back(): void;
}

const styles = StyleSheet.create({
  iconBg: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    zIndex: 1,
  },
  icon: {
    position: 'absolute',
    left: 8,
    top: 16,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#232a25',
    paddingVertical: 0,
    fontWeight: '500',
  },
});

export function BasicInfoForm({ form, logic, next, back }: BasicInfoFormProps) {
  return (
    <WeedGrowCard style={{ width: '100%', maxWidth: 480 }}>
      <View style={{ padding: 16, gap: 16 }}>
        <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>
          🌱 Let’s start with the basics
        </ThemedText>

        <WeedGrowFormSection label="Plant Details">
          <AnimatedMakikoInput
            label={"Plant Name"}
            iconClass={FontAwesomeIcon}
            iconName={"leaf"}
            iconColor={form.name ? '#4caf50' : '#8bc34a'}
            inputPadding={16}
            inputStyle={{ color: '#db786d', fontSize: 16 }}
            value={form.name ? ('' + form.name) : ''}
            onChangeText={(val: string) => logic.setField('name', val)}
            style={{ marginBottom: 16 }}
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

        {/* Always show Environment selection */}
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

        {/* Show Age only if growthStage is vegetative, flowering, or clone */}
        {(form.growthStage === 'vegetative' || form.growthStage === 'flowering' || form.growthStage === 'clone') && (
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
      </View>
    </WeedGrowCard>
  );
}
