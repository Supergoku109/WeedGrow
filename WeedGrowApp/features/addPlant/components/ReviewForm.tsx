import React from 'react'
import { View, ScrollView, Image } from 'react-native'
import { Button } from 'react-native-paper'
import { ThemedText } from '@/ui/ThemedText'
import { WeedGrowCard } from '@/ui/WeedGrowCard'
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow'
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection'
import type { PlantForm } from '@/features/plants/form/PlantForm'
import { useStep6Review } from '../hooks/useStep6Review'
import type { Step6ReviewLogic } from '../hooks/useStep6Review'

interface ReviewFormProps {
  form: PlantForm
  logic: Step6ReviewLogic
  back(): void
}

export function ReviewForm({ form, logic, back }: ReviewFormProps) {
  return (
    <WeedGrowCard style={{ width: '100%', maxWidth: 480 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>
          🌱 Review Your Plant
        </ThemedText>

        {form.imageUri && (
          <Image
            source={{ uri: form.imageUri }}
            style={{ height: 180, width: '100%', borderRadius: 16, borderWidth: 2, borderColor: logic.tint }}
            resizeMode="cover"
          />
        )}

        <WeedGrowFormSection label="Summary">
          <View style={{ gap: 8 }}>
            <TextRow label="Name" value={form.name} />
            <TextRow label="Strain" value={form.strain} />
            <TextRow label="Growth Stage" value={form.growthStage} />
            <TextRow label="Environment" value={form.environment} />
          </View>
        </WeedGrowFormSection>

        <WeedGrowButtonRow>
          <Button mode="outlined" onPress={back} style={{ flex: 1 }}>
            Back
          </Button>
          <Button mode="contained" onPress={logic.handleSave} loading={logic.saving} style={{ flex: 1 }}>
            Save Plant
          </Button>
        </WeedGrowButtonRow>
      </ScrollView>
    </WeedGrowCard>
  )
}

function TextRow({ label, value }: { label: string; value: any }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <ThemedText style={{ fontWeight: '600' }}>{label}</ThemedText>
      <ThemedText>{value || 'Not set'}</ThemedText>
    </View>
  )
}
