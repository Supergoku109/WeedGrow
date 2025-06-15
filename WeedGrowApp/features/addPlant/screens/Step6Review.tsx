import React from 'react'
import { StepIndicatorBar } from '../components/StepIndicatorBar'
import { ScreenLayout } from '../components/ScreenLayout'
import { ReviewForm } from '../components/ReviewForm'
import { useStep6Review } from '../hooks/useStep6Review'
import type { PlantForm } from '@/features/plants/form/PlantForm'

interface StepProps {
  form: PlantForm
  setField: (k: keyof PlantForm, v: any) => void
  next(): void
  back(): void
  step: number
}

export default function Step6Review({
  form, setField, next, back, step
}: StepProps) {
  const logic = useStep6Review(form)

  return (
    <ScreenLayout backgroundColor={logic.backgroundColor} paddingTopIndicator>
      <StepIndicatorBar currentPosition={step - 1} />
      <ReviewForm form={form} logic={logic} back={back} />
    </ScreenLayout>
  )
}
