import React from 'react'
import { StepIndicatorBar } from '../components/StepIndicatorBar'
import { ScreenLayout } from '../components/ScreenLayout'
import { LocationForm } from '../components/LocationForm'
import { useStep3Location } from '../hooks/useStep3Location'
import type { PlantForm } from '@/features/plants/form/PlantForm'

interface StepProps {
  form: PlantForm
  setField: (k: keyof PlantForm, v: any) => void
  next(): void
  back(): void
  step: number
}

export default function Step3Location({
  form, setField, next, back, step
}: StepProps) {
  const logic = useStep3Location(form, setField)

  return (
    <ScreenLayout backgroundColor={logic.backgroundColor} paddingTopIndicator>
      <StepIndicatorBar currentPosition={step - 1} />
      <LocationForm form={form} logic={logic} next={next} back={back} />
    </ScreenLayout>
  )
}
