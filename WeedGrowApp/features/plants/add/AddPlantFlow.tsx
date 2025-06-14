import React, { useState } from 'react';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Environment from './steps/Step2Environment';
import Step3Location from './steps/Step3Location';
import Step4Care from './steps/Step4Care';
import Step5Media from './steps/Step5Media';
import Step6Review from './steps/Step6Review';
import { useAddPlantForm } from './steps/hooks/useAddPlantForm';

export default function AddPlantFlow() {
  const [step, setStep] = useState(1);
  const plantForm = useAddPlantForm();

  const next = () => setStep(prev => prev + 1);
  const back = () => setStep(prev => prev - 1);

  if (step === 1) return <Step1BasicInfo next={next} {...plantForm} />;
  if (step === 2) return <Step2Environment next={next} back={back} {...plantForm} />;
  if (step === 3) return <Step3Location next={next} back={back} {...plantForm} />;
  if (step === 4) return <Step4Care next={next} back={back} {...plantForm} />;
  if (step === 5) return <Step5Media next={next} back={back} {...plantForm} />;
  if (step === 6) return <Step6Review back={back} {...plantForm} />;

  return null;
}
