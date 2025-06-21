// features/addPlant/AddPlantFlow.tsx
import React, { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Animated } from 'react-native';
import Step1BasicInfo   from './screens/Step1BasicInfo';
import Step2Environment from './screens/Step2Environment';
import Step3Location    from './screens/Step3Location';
import Step4Care        from './screens/Step4Care';
import Step5Media       from './screens/Step5Media';
import Step6Review      from './screens/Step6Review';
import { StepIndicatorBar } from './components/StepIndicatorBar';

import { useAddPlantForm } from './hooks/useAddPlantForm';

import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AddPlantFlow() {
  const { tabIndex } = useLocalSearchParams<{ tabIndex: string }>();
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const { form, setField } = useAddPlantForm();
  
  // Animation values for transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  
  // Flag to track if this is the initial mount
  const isInitialMount = useRef(true);
  const goNext = () => {
    // Immediately update the step indicator (no animation)
    setStep(s => Math.min(s + 1, 6));
    
    // Only fade the content area
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };

  const goBack = () => {
    // Immediately update the step indicator (no animation)
    setStep(s => Math.max(s - 1, 1));
    
    // Only fade the content area
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };

  // common props for every step
  const shared = { form, setField, next: goNext, back: goBack, step };
  // Determine the current step component
  let StepComponent;
  switch (step) {
    case 1: StepComponent = Step1BasicInfo; break;
    case 2: StepComponent = Step2Environment; break;
    case 3: StepComponent = Step3Location; break;
    case 4: StepComponent = Step4Care; break;
    case 5: StepComponent = Step5Media; break;
    case 6: StepComponent = Step6Review; break;
    default: return null;
  }  // Use the useStepBackground hook for the proper background color
  const { useStepBackground } = require('./hooks/useStepBackground');
  const backgroundColor = useStepBackground();
  
  // When component mounts, animate the header in first, then the content
  React.useEffect(() => {
    if (isInitialMount.current) {
      // Only animate on initial mount
      Animated.stagger(150, [
        Animated.timing(headerFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      isInitialMount.current = false;
    }
  }, []);
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top']}>
      {/* Step indicator with its own animation */}
      <Animated.View style={{ opacity: headerFadeAnim }}>
        <StepIndicatorBar currentPosition={step - 1} />
      </Animated.View>
      
      {/* Form content with separate animation */}
      <Animated.View style={{ 
        flex: 1, 
        opacity: fadeAnim
      }}>
        <StepComponent {...shared} />
      </Animated.View>
    </SafeAreaView>
  );
}
