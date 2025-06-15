import React from 'react'
import { StepIndicatorBar } from '../components/StepIndicatorBar'
import { ScreenLayout } from '../components/ScreenLayout'
import { CareForm } from '../components/CareForm'
import { useStep4Care } from '../hooks/useStep4Care'
import type { PlantForm } from '@/features/plants/form/PlantForm'

interface StepProps {
  form: PlantForm
  setField: (k: keyof PlantForm, v: any) => void
  next(): void
  back(): void
  step: number
}

export default function Step4Care({
  form, setField, next, back, step
}: StepProps) {
  const logic = useStep4Care(form, setField)

  return (
    <ScreenLayout backgroundColor={logic.backgroundColor} paddingTopIndicator>
      <StepIndicatorBar currentPosition={step - 1} />
      <CareForm form={form} logic={logic} next={next} back={back} />
    </ScreenLayout>
  )
}
