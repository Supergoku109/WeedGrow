import React from 'react'
import { View, ScrollView } from 'react-native'
import { Button } from 'react-native-paper'
import { ThemedText } from '@/ui/ThemedText'
import { WeedGrowCard } from '@/ui/WeedGrowCard'
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection'
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput'
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow'
import { MapPicker } from '@/ui/MapPicker'

import type { PlantForm } from '@/features/plants/form/PlantForm'
import type { Step3LocationLogic } from '../hooks/useStep3Location'

interface LocationFormProps {
  form: PlantForm
  logic: Step3LocationLogic
  next(): void
  back(): void
}

export function LocationForm({ form, logic, next, back }: LocationFormProps) {
  return (
    <WeedGrowCard style={{ width: '100%', maxWidth: 480 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>
          📍 Where is your plant?
        </ThemedText>

        <WeedGrowFormSection label="Location Details">
          <Button
            icon="crosshairs-gps"
            loading={logic.loading}
            onPress={logic.getLocation}
            style={{ marginBottom: 12, alignSelf: 'center', borderRadius: 8, backgroundColor: logic.tint }}
            labelStyle={{ color: '#fff', fontWeight: '700' }}
            mode="contained"
          >
            Use My Location
          </Button>

          <WeedGrowTextInput
            label="Location Nickname"
            value={form.locationNickname ?? ""}
            onChangeText={(val: string) => logic.setField('locationNickname', val)}
            icon="map-marker"
          />
        </WeedGrowFormSection>

        <WeedGrowFormSection label="Map">
          <MapPicker
            location={form.location ?? undefined}
            onLocationChange={(coords) => logic.setField('location', coords)}
          />
          <ThemedText style={{ textAlign: 'center', marginTop: 8, fontSize: 14 }}>
            Tap the map to adjust your plant's location
          </ThemedText>
        </WeedGrowFormSection>

        <WeedGrowButtonRow>
          <Button mode="outlined" onPress={back} style={{ flex: 1 }}>
            Back
          </Button>
          <Button mode="contained" onPress={next} disabled={!logic.isValid} style={{ flex: 1 }}>
            Next
          </Button>
        </WeedGrowButtonRow>
      </ScrollView>
    </WeedGrowCard>
  )
}
