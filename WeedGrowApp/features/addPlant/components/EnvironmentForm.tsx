// features/addPlant/components/EnvironmentForm.tsx

import React from 'react'
import { View, ScrollView, TouchableOpacity, Text } from 'react-native'
import { Button } from 'react-native-paper'
import { FadeIn } from 'react-native-reanimated'
import { ThemedText } from '@/ui/ThemedText'
import { WeedGrowCard } from '@/ui/WeedGrowCard'
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow'
import { WeedGrowDropdownInput } from '@/ui/WeedGrowDropdownInput'
import { SegmentedButtons } from 'react-native-paper'
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection'
import type { Step3EnvironmentLogic } from '../hooks/useStep3Environment'
import { PlantForm } from '@/features/plants/form/PlantForm'

interface EnvironmentFormProps {
  form: PlantForm
  logic: Step3EnvironmentLogic
  next(): void
  back(): void
}

const SensorProfileSection = ({ logic }: { logic: Step3EnvironmentLogic }) => (
  <WeedGrowFormSection label="Sensor Profile">
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

const PlantedInSection = ({ logic }: { logic: Step3EnvironmentLogic }) => (
  <WeedGrowFormSection label="Planted In">
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      {['pot', 'ground'].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={{
            flex: 1,
            margin: 4,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor: logic.plantedIn === opt ? '#4CAF50' : '#E0E0E0',
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

const PotSizeSection = ({ form, logic }: { form: PlantForm; logic: Step3EnvironmentLogic }) => (
  <WeedGrowFormSection label="Pot Size">
    <WeedGrowDropdownInput
      icon="flower-pot"
      label="Pot Size"
      value={form.potSize || ''}
      options={logic.potSizeOptions.map((p) => ({ label: p, value: p }))}
      onSelect={(v) => logic.setField('potSize', v)}
      placeholder="Select pot size"
      zIndex={2000}
    />
  </WeedGrowFormSection>
)

const SunlightExposureSection = ({ form, logic }: { form: PlantForm; logic: Step3EnvironmentLogic }) => (
  <WeedGrowFormSection label="Sunlight Exposure">
    <WeedGrowDropdownInput
      icon="white-balance-sunny"
      label="Sunlight Exposure"
      value={form.sunlightExposure || ''}
      options={logic.sunlightOptions.map((opt) => ({ label: opt.label, value: opt.value }))}
      onSelect={(v) => logic.setField('sunlightExposure', v)}
      placeholder="Select sunlight"
      zIndex={1000}
    />
  </WeedGrowFormSection>
)

export function EnvironmentForm({ form, logic, next, back }: EnvironmentFormProps) {
  return (
    <WeedGrowCard style={{ width: '100%', maxWidth: 480 }} entering={FadeIn.duration(500)}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>
          🌿 Where is your plant growing?
        </ThemedText>

        {(logic.environment === 'indoor' || logic.environment === 'greenhouse') && (
          <SensorProfileSection logic={logic} />
        )}

        <PlantedInSection logic={logic} />

        {logic.plantedIn === 'pot' && <PotSizeSection form={form} logic={logic} />}

        {(logic.environment === 'outdoor' || logic.environment === 'greenhouse') && (
          <SunlightExposureSection form={form} logic={logic} />
        )}

        <WeedGrowButtonRow>
          <Button onPress={back} mode="outlined" style={{ flex: 1 }}>
            Back
          </Button>
          <Button onPress={next} mode="contained" style={{ flex: 1 }}>
            Next
          </Button>
        </WeedGrowButtonRow>
      </ScrollView>
    </WeedGrowCard>
  )
}
