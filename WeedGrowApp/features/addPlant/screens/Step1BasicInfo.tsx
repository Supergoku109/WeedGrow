// features/addPlant/screens/Step1BasicInfo.tsx
import React from 'react'
import { StepIndicatorBar } from '../components/StepIndicatorBar'
import { ScreenLayout }      from '../components/ScreenLayout'
import { BasicInfoForm }     from '../components/BasicInfoForm'
import { useStep1BasicInfo } from '../hooks/useStep1BasicInfo'
import type { PlantForm }    from '@/features/plants/form/PlantForm'

interface StepProps {
  form: PlantForm
  setField: (k: keyof PlantForm, v: any) => void
  next(): void
  back(): void
  step: number
}

export default function Step1BasicInfo({
  form, setField, next, back, step
}: StepProps) {
  const logic = useStep1BasicInfo(form, setField)

  return (
    <ScreenLayout
      backgroundColor={logic.backgroundColor}
      paddingTopIndicator
    >
      <StepIndicatorBar currentPosition={step - 1} />
      <BasicInfoForm
        form={form}
        logic={logic}
        next={next}
        back={back}
      />
    </ScreenLayout>
  )
}
