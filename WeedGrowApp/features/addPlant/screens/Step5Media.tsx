import React from 'react'
import { StepIndicatorBar } from '../components/StepIndicatorBar'
import { ScreenLayout } from '../components/ScreenLayout'
import { MediaForm } from '../components/MediaForm'
import { useStep5Media } from '../hooks/useStep5Media'
import type { PlantForm } from '@/features/plants/form/PlantForm'

interface StepProps {
  form: PlantForm
  setField: (k: keyof PlantForm, v: any) => void
  next(): void
  back(): void
  step: number
}

export default function Step5Media({
  form, setField, next, back, step
}: StepProps) {
  const logic = useStep5Media(form, setField)

  return (
    <ScreenLayout backgroundColor={logic.backgroundColor} paddingTopIndicator>
      <StepIndicatorBar currentPosition={step - 1} />
      <MediaForm form={form} logic={logic} next={next} back={back} />
    </ScreenLayout>
  )
}
