// EnvironmentForm.tsx
// This component renders the Environment step of the Add Plant flow.
// It collects information about where and how the plant is growing (sensor profile, planted in, pot size, sunlight exposure).

import React, { useState, useRef } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { Button, Tooltip } from 'react-native-paper'
import { FadeIn } from 'react-native-reanimated'
import { ThemedText } from '@/ui/ThemedText'
import { WeedGrowCard } from '@/ui/WeedGrowCard'
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow'
import { WeedGrowDropdownInput } from '@/ui/WeedGrowDropdownInput'
import { SegmentedButtons } from 'react-native-paper'
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection'
import type { Step2EnvironmentLogic } from '../hooks/useStep2Environment'
import { PlantForm } from '@/features/plants/form/PlantForm'
import { AnimatedMakikoDropdownInput } from '@/components/ui/AnimatedMakikoDropdownInput'
import { AnimatedMakikoInput } from '@/components/ui/AnimatedMakikoInput'
import { AnimatedMakikoChipInput } from '@/components/ui/AnimatedMakikoChipInput'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { LinearGradient } from 'expo-linear-gradient'
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { WeedGrowCardBackground } from '@/components/ui/WeedGrowCardBackground'

// Props for the EnvironmentForm component
interface EnvironmentFormProps {
  form: PlantForm // Form state object
  logic: Step2EnvironmentLogic // Logic handlers for environment step
  next(): void // Callback to go to next step
  back(): void // Callback to go to previous step
}

// Section for selecting a sensor profile (for indoor/greenhouse)
const SensorProfileSection = ({ logic }: { logic: Step2EnvironmentLogic }) => (
  <WeedGrowFormSection label="Sensor Profile" style={{ marginBottom: 16 }}>
    <WeedGrowDropdownInput
      icon="chip"
      label={logic.loadingProfiles ? 'Loading…' : 'Sensor Profile'}
      value={logic.sensorOptions.find((o) => o.value === logic.environment)?.label || ''}
      options={logic.sensorOptions.map((o) => ({ label: o.label, value: o.value }))}
      onSelect={(v) => logic.setField('sensorProfileId', v)}
      placeholder="Select profile"
      zIndex={3000}
    />
  </WeedGrowFormSection>
)

// Section for selecting if the plant is in a pot or in the ground
const PlantedInSection = ({ logic }: { logic: Step2EnvironmentLogic }) => (
  <WeedGrowFormSection label="Planted In" style={{ marginBottom: 16 }}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      {['pot', 'ground'].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={{
            flex: 1,
            margin: 4,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor: logic.plantedIn === opt ? '#4CAF50' : '#232a25',
            alignItems: 'center',
          }}
          onPress={() => logic.setField('plantedIn', opt)}
        >
          <Text style={{ fontWeight: '600', color: '#FFFFFF' }}>{opt === 'pot' ? 'Pot' : 'Ground'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </WeedGrowFormSection>
)

// Section for selecting pot size (only if planted in a pot)
const PotSizeSection = ({ form, logic }: { form: PlantForm; logic: Step2EnvironmentLogic }) => (
  <WeedGrowFormSection style={{ marginBottom: 16 }}>
    <AnimatedMakikoDropdownInput
      label="Pot Size"
      iconName="flower-pot"
      iconClass={MaterialCommunityIcons}
      iconColor="#4caf50"
      value={form.potSize || ''}
      options={logic.potSizeOptions.map((p) => ({ label: p, value: p }))}
      onSelect={(v) => logic.setField('potSize', v)}
      placeholder="Select pot size"
      style={{ marginBottom: 0 }}
    />
  </WeedGrowFormSection>
)

// Section for selecting sunlight exposure (for outdoor/greenhouse)
const SunlightExposureSection = ({ form, logic }: { form: PlantForm; logic: Step2EnvironmentLogic }) => (
  <WeedGrowFormSection style={{ marginBottom: 16 }}>
    <AnimatedMakikoDropdownInput
      label="Sunlight Exposure"
      iconName="white-balance-sunny"
      iconClass={MaterialCommunityIcons}
      iconColor="#4caf50"
      value={form.sunlightExposure || ''}
      options={logic.sunlightOptions.map((opt) => ({ label: opt.label, value: opt.value }))}
      onSelect={(v) => logic.setField('sunlightExposure', v)}
      placeholder="Select sunlight"
      style={{ marginBottom: 0 }}
    />
  </WeedGrowFormSection>
)

// Section for selecting soil type
const soilTypeOptions = [
  { label: 'Native soil (garden)', value: 'native' },
  { label: 'Raised bed soil', value: 'raised' },
  { label: 'Store-bought potting soil', value: 'store' },
  { label: 'Custom mix', value: 'custom' },
];

const SoilTypeSection = ({ form, logic }: { form: PlantForm; logic: Step2EnvironmentLogic }) => (
  <WeedGrowFormSection style={{ marginBottom: 16 }}>
    <AnimatedMakikoDropdownInput
      label="Soil Type"
      iconName="shovel"
      iconClass={MaterialCommunityIcons}
      iconColor="#4caf50"
      value={form.soilType || ''}
      options={soilTypeOptions}
      onSelect={(v) => logic.setField('soilType', v)}
      placeholder="Select soil type"
      style={{ marginBottom: 0 }}
    />
  </WeedGrowFormSection>
)

// Advanced options for Permanent Protection
const protectionOptions = [
  { label: 'Cage', value: 'cage' },
  { label: 'Netting', value: 'netting' },
  { label: 'Row cover', value: 'row_cover' },
  { label: 'Animal fence', value: 'animal_fence' },
  { label: 'None', value: 'none' },
  { label: 'Other', value: 'other' },
];

// Common companion planting options
const companionOptions = [
  'Basil', 'Marigold', 'Clover', 'Mint', 'Chives', 'None', 'Other'
];

// Advanced Setup Section
const AdvancedSetupSection = ({ form, logic, scrollRef }: { form: PlantForm; logic: Step2EnvironmentLogic; scrollRef?: any }) => {
  const [expanded, setExpanded] = useState(false);
  const [companionInput, setCompanionInput] = useState('');
  const companions = form.companionPlants || [];

  const handleAddCompanion = (val: string) => {
    if (val && !companions.includes(val)) {
      logic.setField('companionPlants', [...companions, val]);
      setCompanionInput('');
    }
  };
  const handleRemoveCompanion = (val: string) => {
    logic.setField('companionPlants', companions.filter((c: string) => c !== val));
  };

  // Add a ref for the dropdown input
  const dropdownInputRef = useRef(null);

  return (
    <View style={{ marginTop: 8 }}>
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        style={{
          backgroundColor: '#355c3a',
          borderRadius: 10,
          padding: 12,
          alignItems: 'center',
          marginBottom: expanded ? 12 : 0,
        }}
        activeOpacity={0.85}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
          {expanded ? 'Hide Advanced Setup' : 'Optional Advanced Setup'}
        </Text>
      </TouchableOpacity>
      {expanded && (
        <>
          {/* Soil pH target */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <AnimatedMakikoInput
              label="Soil pH"
              iconName="flask"
              iconClass={MaterialCommunityIcons}
              iconColor="#4caf50"
              value={form.soilPh || ''}
              onChangeText={val => logic.setField('soilPh', val)}
              keyboardType="numeric"
              inputStyle={{ width: 120 }}
            />
            <Tooltip title="Only set if known — helps with nutrient advice">
              <MaterialCommunityIcons name="information-outline" size={22} color="#aaa" />
            </Tooltip>
          </View>
          {/* Permanent protection */}
          <AnimatedMakikoDropdownInput
            ref={dropdownInputRef}
            label="Permanent Protection"
            iconName="shield"
            iconClass={MaterialCommunityIcons}
            iconColor="#4caf50"
            value={form.permanentProtection || ''}
            options={protectionOptions}
            onSelect={v => logic.setField('permanentProtection', v)}
            placeholder="Select protection"
            style={{ marginBottom: 24 }}
            onFocusInput={() => {
              if (scrollRef && scrollRef.current && dropdownInputRef.current) {
                scrollRef.current.scrollToFocusedInput(dropdownInputRef.current);
              }
            }}
          />
          {/* Companion planting */}
          <AnimatedMakikoChipInput
            label="Companion Plants"
            iconName="leaf"
            iconClass={MaterialCommunityIcons}
            iconColor="#4caf50"
            value={companions}
            onChange={chips => logic.setField('companionPlants', chips)}
            suggestions={companionOptions}
            style={{ marginBottom: 16 }}
          />
        </>
      )}
    </View>
  );
};

// Main form component for entering environment details
export function EnvironmentForm({ form, logic, next, back }: EnvironmentFormProps) {
  const scrollRef = useRef<any>(null);
  return (
    <WeedGrowCard style={{ width: '100%', maxWidth: 480, overflow: 'hidden', padding: 0 }} entering={FadeIn.duration(500)}>
      <WeedGrowCardBackground>
        <View style={{ flex: 1, position: 'relative' }}>
          <KeyboardAwareScrollView
            ref={scrollRef}
            contentContainerStyle={{ position: 'relative', zIndex: 1 }}
            showsVerticalScrollIndicator={false}
            enableOnAndroid
            extraScrollHeight={120}
            keyboardShouldPersistTaps="handled"
            keyboardOpeningTime={0}
          >
            <View style={{ padding: 16, gap: 16 }}>
              {/* Title */}
              <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>
                🌿 Where is your plant growing?
              </ThemedText>

              {/* Show sensor profile if indoor or greenhouse */}
              {(logic.environment === 'indoor' || logic.environment === 'greenhouse') && (
                <SensorProfileSection logic={logic} />
              )}

              {/* Planted in pot or ground */}
              <PlantedInSection logic={logic} />

              {/* Show pot size if planted in a pot */}
              {logic.plantedIn === 'pot' && <PotSizeSection form={form} logic={logic} />}

              {/* Show sunlight exposure if outdoor or greenhouse */}
              {(logic.environment === 'outdoor' || logic.environment === 'greenhouse') && (
                <>
                  <SunlightExposureSection form={form} logic={logic} />
                  <SoilTypeSection form={form} logic={logic} />
                  <AdvancedSetupSection form={form} logic={logic} scrollRef={scrollRef} />
                </>
              )}

              {/* Navigation buttons: Back and Next */}
              <WeedGrowButtonRow>
                <Button onPress={back} mode="outlined" style={{ flex: 1, marginRight: 8 }}>
                  Back
                </Button>
                <Button onPress={next} mode="contained" style={{ flex: 1 }}>
                  Next
                </Button>
              </WeedGrowButtonRow>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </WeedGrowCardBackground>
    </WeedGrowCard>
  )
}
