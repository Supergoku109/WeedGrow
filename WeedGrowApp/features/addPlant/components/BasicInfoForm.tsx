// BasicInfoForm.tsx
// This component renders the first step of the Add Plant flow, allowing users to enter basic plant information.
// It uses custom WeedGrow UI components and handles form state via props.

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { AnimatedMakikoDropdownInput } from '@/components/ui/AnimatedMakikoDropdownInput';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { AnimatedMakikoInput } from '@/components/ui/AnimatedMakikoInput';

import type { PlantForm } from '@/features/plants/form/PlantForm';
import type { Step1BasicInfoLogic } from '@/features/addPlant/hooks/useStep1BasicInfo';

// Props for the BasicInfoForm component
interface BasicInfoFormProps {
  form: PlantForm; // Form state object
  logic: Step1BasicInfoLogic; // Logic handlers for form fields and validation
  next(): void; // Callback to go to next step
  back(): void; // Callback to go to previous step
}

// Styles for icons and input fields
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

// Main form component for entering basic plant info
export function BasicInfoForm({ form, logic, next, back }: BasicInfoFormProps) {
  return (
    // Card container for the form
    <WeedGrowCard style={{ width: '100%', maxWidth: 480}}>
      <View style={{ padding: 16, gap: 16 }}>
        {/* Title */}
        <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>
          🌱 Let’s start with the basics
        </ThemedText>

          {/* Plant Name input with animated icon */}
          <AnimatedMakikoInput
            label={"Plant Name"}
            iconClass={FontAwesomeIcon}
            iconName={"leaf"}
            iconColor="#4caf50"
            inputPadding={12}
            inputStyle={{ color: '#fff', fontSize: 16, paddingLeft: 45 }}
            value={form.name ? ('' + form.name) : ''}
            onChangeText={(val: string) => logic.setField('name', val)}
            style={{ marginBottom: 16 }}
          />

          {/* Strain dropdown selection */}
          <AnimatedMakikoDropdownInput
            label="Strain"
            iconName="dna"
            iconClass={MaterialCommunityIcons}
            iconColor="#4caf50"
            value={form.strain}
            options={logic.filteredStrains.map(opt => ({ label: opt, value: opt }))}
            onSelect={val => logic.setField('strain', val)}
            placeholder="Select strain"
          />

        {/* Section: Environment selection (always shown) */}
        <WeedGrowFormSection label="Environment">
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            {/* Render environment options as selectable buttons */}
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
                {/* Icon for each environment */}
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

        {/* Section: Age (only if growthStage is vegetative, flowering, or clone) */}
        {(form.growthStage === 'vegetative' || form.growthStage === 'flowering' || form.growthStage === 'clone') && (
          <WeedGrowFormSection label="Age">
            {/* Numeric input for plant age in days */}
            <WeedGrowTextInput
              label="Age in Days"
              value={form.ageDays}
              onChangeText={(val: string) => logic.setField('ageDays', val)}
              keyboardType="numeric"
              icon="calendar"
            />
          </WeedGrowFormSection>
        )}

        {/* Navigation buttons: Back and Next */}
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
