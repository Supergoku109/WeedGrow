// LocationForm.tsx
// This component renders the Location step of the Add Plant flow.
// It allows the user to set the plant's physical location using a map and nickname, and optionally use device geolocation.

import React from 'react'
import { View, ScrollView } from 'react-native'
import { Button } from 'react-native-paper'
import { ThemedText } from '@/ui/ThemedText'
import { WeedGrowCard } from '@/ui/WeedGrowCard'
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection'
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow'
import { MapPicker } from '@/ui/MapPicker'
import { AnimatedMakikoInput } from '@/components/ui/AnimatedMakikoInput'
import { LinearGradient } from 'expo-linear-gradient'
import { WeedGrowCardBackground } from '@/components/ui/WeedGrowCardBackground'

import type { PlantForm } from '@/features/plants/form/PlantForm'
import type { Step3LocationLogic } from '../hooks/useStep3Location'

// Props for the LocationForm component
interface LocationFormProps {
  form: PlantForm // Form state object
  logic: Step3LocationLogic // Logic handlers for location step
  next(): void // Callback to go to next step
  back(): void // Callback to go to previous step
}

// Main form component for entering plant location
export function LocationForm({ form, logic, next, back }: LocationFormProps) {
  return (
    <WeedGrowCard style={{ width: '100%', maxWidth: 480, overflow: 'hidden', padding: 0 }}>
      <WeedGrowCardBackground>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16, position: 'relative', zIndex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>
            📍 Where is your plant?
          </ThemedText>

          {/* Section: Location Details (nickname and geolocation) */}
          <WeedGrowFormSection>
            {/* Button to use device geolocation */}
            <Button
              icon="crosshairs-gps"
              loading={logic.loading}
              onPress={logic.getLocation}
              style={{ marginBottom: 5, alignSelf: 'center', borderRadius: 8, backgroundColor: logic.tint }}
              labelStyle={{ color: '#fff', fontWeight: '700' }}
              mode="contained"
            >
              Use My Location
            </Button>

            {/* Input for location nickname */}
            <AnimatedMakikoInput
              label="Location Nickname"
              value={form.locationNickname ?? ""}
              onChangeText={(val: string) => logic.setField('locationNickname', val)}
              iconName="map-marker"
              iconColor={logic.tint}
              iconClass={require('react-native-vector-icons/MaterialCommunityIcons').default}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              style={{ marginBottom: 0 }}
            />
          </WeedGrowFormSection>

          {/* Section: Map picker for selecting location */}
          <WeedGrowFormSection label="Map">
            <MapPicker
              location={form.location ?? undefined}
              onLocationChange={(coords) => logic.setField('location', coords)}
            />
            <ThemedText style={{ textAlign: 'center', marginTop: 0, fontSize: 14, marginBottom: 4 }}>
              Tap the map to adjust your plant's location
            </ThemedText>
          </WeedGrowFormSection>

          {/* Navigation buttons: Back and Next */}
          <WeedGrowButtonRow style={{ marginTop: 0 }}>
            <Button mode="outlined" onPress={back} style={{ flex: 1 }}>
              Back
            </Button>
            <Button mode="contained" onPress={next} disabled={!logic.isValid} style={{ flex: 1 }}>
              Next
            </Button>
          </WeedGrowButtonRow>
        </ScrollView>
      </WeedGrowCardBackground>
    </WeedGrowCard>
  )
}
