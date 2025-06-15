import React from 'react'
import { View, ScrollView } from 'react-native'
import { Button, Chip } from 'react-native-paper'
import { ThemedText } from '@/ui/ThemedText'
import { WeedGrowCard } from '@/ui/WeedGrowCard'
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection'
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput'
import { WeedGrowDropdownInput } from '@/ui/WeedGrowDropdownInput'
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow'
import type { PlantForm } from '@/features/plants/form/PlantForm'
import type { Step4CareLogic } from '../hooks/useStep4Care'

interface CareFormProps {
  form: PlantForm
  logic: Step4CareLogic
  next(): void
  back(): void
}

export function CareForm({ form, logic, next, back }: CareFormProps) {
  return (
    <WeedGrowCard style={{ width: '100%', maxWidth: 480 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>
          💧 Care Details
        </ThemedText>

        <WeedGrowFormSection label="Watering & Fertilizer">
          <WeedGrowDropdownInput
            icon="water"
            label="Watering Frequency"
            value={form.wateringFrequency || ''}
            options={logic.wateringOptions.map(opt => ({ label: opt, value: opt }))}
            onSelect={val => logic.setField('wateringFrequency', val)}
            menuVisible={logic.waterMenu}
            setMenuVisible={logic.setWaterMenu}
            placeholder="Select frequency"
          />
          <WeedGrowTextInput
            label="Fertilizer"
            value={form.fertilizer}
            onChangeText={val => logic.setField('fertilizer', val)}
            icon="leaf"
          />
        </WeedGrowFormSection>

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
  )
}
