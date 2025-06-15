// features/addPlant/components/EnvironmentForm.tsx

import React from 'react'
import { View, ScrollView } from 'react-native'
import { SegmentedButtons, Button } from 'react-native-paper'
import { FadeIn } from 'react-native-reanimated'
import { ThemedText } from '@/ui/ThemedText'
import { WeedGrowCard } from '@/ui/WeedGrowCard'
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection'
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow'
import { WeedGrowDropdownInput } from '@/ui/WeedGrowDropdownInput'
import type { Step2EnvironmentLogic } from '../hooks/useStep2Environment'

interface EnvironmentFormProps {
  form: import('@/features/plants/form/PlantForm').PlantForm
  logic: Step2EnvironmentLogic
  next(): void
  back(): void
}

export function EnvironmentForm({ form, logic, next, back }: EnvironmentFormProps) {
  return (
    <WeedGrowCard style={{ width: '100%', maxWidth: 480 }} entering={FadeIn.duration(500)}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>
          🌿 Where is your plant growing?
        </ThemedText>

        {/* Environment */}
        <WeedGrowFormSection label="Environment">
          <SegmentedButtons
            value={logic.environment}
            onValueChange={(v) => logic.setField('environment', v)}
            buttons={[
              { value: 'outdoor', label: 'Outdoor', icon: 'weather-sunny' },
              { value: 'greenhouse', label: 'Greenhouse', icon: 'greenhouse' },
              { value: 'indoor', label: 'Indoor', icon: 'home' }
            ]}
            style={{ borderRadius: 10, backgroundColor: logic.backgroundColor }}
          />
        </WeedGrowFormSection>

        {/* Sensor Profile */}
        {(logic.environment === 'indoor' || logic.environment === 'greenhouse') && (
          <WeedGrowFormSection label="Sensor Profile">
            <WeedGrowDropdownInput
              icon="chip"
              label={logic.loadingProfiles ? 'Loading…' : 'Sensor Profile'}
              value={logic.sensorOptions.find(o => o.value === logic.environment)?.label || ''}
              options={logic.sensorOptions}
              onSelect={v => logic.setField('sensorProfileId', v)}
              placeholder="Select profile"
              zIndex={3000}
            />
          </WeedGrowFormSection>
        )}

        {/* Planted In */}
        <WeedGrowFormSection label="Planted In">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {['pot', 'ground'].map(opt => (
              <Button
                key={opt}
                mode={logic.plantedIn === opt ? 'contained' : 'outlined'}
                onPress={() => logic.setField('plantedIn', opt)}
                style={{ flex: 1, margin: 4 }}
                labelStyle={{ fontWeight: '600' }}
              >
                {opt === 'pot' ? 'Pot' : 'Ground'}
              </Button>
            ))}
          </View>
        </WeedGrowFormSection>

        {/* Pot Size */}
        {logic.plantedIn === 'pot' && (
          <WeedGrowFormSection label="Pot Size">
            <WeedGrowDropdownInput
              icon="flower-pot"
              label="Pot Size"
              value={form.potSize || ''}
              options={logic.potSizeOptions.map(p => ({ label: p, value: p }))}
              onSelect={v => logic.setField('potSize', v)}
              placeholder="Select pot size"
              zIndex={2000}
            />
          </WeedGrowFormSection>
        )}

        {/* Sunlight */}
        {(logic.environment === 'outdoor' || logic.environment === 'greenhouse') && (
          <WeedGrowFormSection label="Sunlight Exposure">
            <WeedGrowDropdownInput
              icon="white-balance-sunny"
              label="Sunlight Exposure"
              value={form.sunlightExposure || ''}
              options={logic.sunlightOptions.map(opt => ({ label: opt.label, value: opt.value }))}
              onSelect={v => logic.setField('sunlightExposure', v)}
              placeholder="Select sunlight"
              zIndex={1000}
            />
          </WeedGrowFormSection>
        )}

        {/* Nav Buttons */}
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
