// features/addPlant/AddPlantFlow.tsx
import React from 'react'
import Step1BasicInfo   from './screens/Step1BasicInfo'
import Step2Environment from './screens/Step2Environment'
import Step3Location    from './screens/Step3Location'
import Step4Care        from './screens/Step4Care'
import Step5Media       from './screens/Step5Media'
import Step6Review      from './screens/Step6Review'

import { useAddPlantForm } from './hooks/useAddPlantForm'

export default function AddPlantFlow() {
  const [step, setStep] = React.useState(1)
  const { form, setField } = useAddPlantForm()

  const goNext = () => setStep(s => Math.min(s + 1, 6))
  const goBack = () => setStep(s => Math.max(s - 1, 1))

  // common props for every step
  const shared = { form, setField, next: goNext, back: goBack, step }

  switch (step) {
    case 1: return <Step1BasicInfo   {...shared} />
    case 2: return <Step2Environment {...shared} />
    case 3: return <Step3Location    {...shared} />
    case 4: return <Step4Care        {...shared} />
    case 5: return <Step5Media       {...shared} />
    case 6: return <Step6Review      {...shared} />
    default: return null
  }
}
