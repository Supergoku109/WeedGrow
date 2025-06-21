// features/addPlant/AddPlantFlow.tsx
import React, { useRef } from 'react';
import { Animated, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Step2BasicInfo   from './screens/Step2BasicInfo';
import Step3Environment from './screens/Step3Environment';
import Step3Location    from './screens/Step3Location';
import Step4Care        from './screens/Step4Care';
import Step5Media       from './screens/Step5Media';
import Step6Review      from './screens/Step6Review';
import { StepIndicatorBar } from './components/StepIndicatorBar';
import Step1SelectStage from './screens/Step1SelectStage';

import { useAddPlantForm } from './hooks/useAddPlantForm';

import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

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
    setStep(s => Math.min(s + 1, 7));
    
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
    if (step === 1) {
      // Go back to home and select the plant tab
      router.replace({ pathname: '/(tabs)', params: { tabIndex: '1' } });
    } else {
      setStep(s => Math.max(s - 1, 1));
    }
  };
  // common props for every step
  const shared = { form, setField, next: goNext, back: goBack, step };
  // Determine the current step component
  let StepComponent;
  switch (step) {
    case 1: StepComponent = Step1SelectStage; break;
    case 2: StepComponent = Step2BasicInfo; break;
    case 3: StepComponent = Step3Environment; break;
    case 4: StepComponent = Step3Location; break;
    case 5: StepComponent = Step4Care; break;
    case 6: StepComponent = Step5Media; break;
    case 7: StepComponent = Step6Review; break;
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
  
  // Handle hardware back button for step navigation
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (step > 1) {
          setStep(s => Math.max(s - 1, 1));
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [step])
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1SelectStage
            selectedStage={form.growthStage || null}
            onSelectStage={(stage) => setField('growthStage', stage)}
            next={goNext}
            back={goBack}
          />
        );
      case 2:
        return <Step2BasicInfo form={form} setField={setField} next={goNext} back={goBack} step={2} />;
      case 3:
        return <Step3Environment form={form} setField={setField} next={goNext} back={goBack} step={3} />;
      case 4:
        return <Step3Location form={form} setField={setField} next={goNext} back={goBack} step={4} />;
      case 5:
        return <Step4Care form={form} setField={setField} next={goNext} back={goBack} step={5} />;
      case 6:
        return <Step5Media form={form} setField={setField} next={goNext} back={goBack} step={6} />;
      case 7:
        return <Step6Review form={form} setField={setField} next={goNext} back={goBack} step={7} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top']}>
      {/* Step indicator with its own animation */}
      {step > 1 && (
        <Animated.View style={{ opacity: headerFadeAnim }}>
          <StepIndicatorBar currentPosition={step - 2} />
        </Animated.View>
      )}
      {/* Form content with separate animation */}
      <Animated.View style={{ 
        flex: 1, 
        opacity: fadeAnim
      }}>
        {renderStep()}
      </Animated.View>
    </SafeAreaView>
  );
}
