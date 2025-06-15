import React from 'react'
import { View, ScrollView, Image } from 'react-native'
import { Button, Snackbar } from 'react-native-paper'
import { ThemedText } from '@/ui/ThemedText'
import { WeedGrowCard } from '@/ui/WeedGrowCard'
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection'
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput'
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow'
import type { PlantForm } from '@/features/plants/form/PlantForm'
import type { Step5MediaLogic } from '../hooks/useStep5Media'

interface MediaFormProps {
  form: PlantForm
  logic: Step5MediaLogic
  next(): void
  back(): void
}

export function MediaForm({ form, logic, next, back }: MediaFormProps) {
  return (
    <WeedGrowCard style={{ width: '100%', maxWidth: 480 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={{ textAlign: 'center', fontSize: 24 }}>
          📝 Final Touches
        </ThemedText>

        <ThemedText style={{ textAlign: 'center', marginBottom: 10, fontSize: 15 }}>
          Add a photo and any final notes for your plant.
        </ThemedText>

        <WeedGrowFormSection label="Photo">
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18, justifyContent: 'center' }}>
            <Button mode="outlined" icon="camera" onPress={() => logic.pickImage(true)}>
              Take Photo
            </Button>
            <Button mode="outlined" icon="image" onPress={() => logic.pickImage(false)}>
              Choose from Gallery
            </Button>
          </View>

          {form.imageUri && (
            <Image
              source={{ uri: form.imageUri }}
              style={{ height: 200, width: '100%', borderRadius: 16, borderWidth: 2, borderColor: logic.tint }}
              resizeMode="cover"
            />
          )}
        </WeedGrowFormSection>

        <WeedGrowFormSection label="Notes">
          <WeedGrowTextInput
            label="Observations (optional)"
            value={form.notes}
            onChangeText={val => logic.setField('notes', val)}
            multiline
            placeholder="Add any observations here..."
            icon="note-text"
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
        </WeedGrowFormSection>

        <Snackbar visible={logic.snackVisible} onDismiss={() => logic.setSnackVisible(false)}>
          Photo selected
        </Snackbar>

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
