// features/addPlant/screens/Step1BasicInfo.tsx
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StepIndicatorBar } from '../components/StepIndicatorBar'
import { ScreenLayout }      from '../components/ScreenLayout'
import { BasicInfoForm }     from '../components/BasicInfoForm'
import { useStep1BasicInfo } from '../hooks/useStep1BasicInfo'
import type { PlantForm }    from '@/features/plants/form/PlantForm'
import { useRouter } from 'expo-router'

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
  const router = useRouter()

  const navigateToHome = () => {
    router.replace('/')
  }

  return (
<SafeAreaView style={{ flex: 1, backgroundColor: logic.backgroundColor }}>
  <StepIndicatorBar currentPosition={step - 1} />
  <ScreenLayout backgroundColor={logic.backgroundColor} paddingTopIndicator>
    <BasicInfoForm
      form={form}
      logic={logic}
      next={next}
      back={navigateToHome}
    />
  </ScreenLayout>
</SafeAreaView>

  )
}
