// features/addPlant/components/EnvironmentForm.tsx

import React from 'react';
import {
  ScrollView, KeyboardAvoidingView, Platform,
  View, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { SafeAreaView }         from 'react-native-safe-area-context';
import { SegmentedButtons, Button, Menu } from 'react-native-paper';
import { FadeIn }               from 'react-native-reanimated';
import { StepIndicatorBar }         from './StepIndicatorBar';
import { ThemedText }           from '@/ui/ThemedText';
import { WeedGrowCard }         from '@/ui/WeedGrowCard';
import { WeedGrowFormSection }  from '@/ui/WeedGrowFormSection';
import { WeedGrowButtonRow }    from '@/ui/WeedGrowButtonRow';
import { WeedGrowDropdownInput } from '@/ui/WeedGrowDropdownInput';
import type { Step2EnvironmentLogic } from '../hooks/useStep2Environment';

interface EnvironmentFormProps {
  logic: Step2EnvironmentLogic;
  next(): void;
  back(): void;
}

export function EnvironmentForm({ logic, next, back }: EnvironmentFormProps) {
  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: logic.backgroundColor,
      paddingTop: logic.insetsTop,
    }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS==='ios'?'padding':undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex:1 }}
            contentContainerStyle={{ padding:16, gap:16 }}
          >
            <StepIndicatorBar currentPosition={1} />

            <WeedGrowCard entering={FadeIn.duration(500)}>
              <ThemedText type="title" style={{ textAlign:'center', fontSize:24 }}>
                🌿 Where is your plant growing?
              </ThemedText>

              {/* Environment */}
              <WeedGrowFormSection label="Environment">
                <SegmentedButtons
                  value={logic.environment}
                  onValueChange={(v) => logic.setField('environment', v)}
                  buttons={[
                    { value:'outdoor',   label:'Outdoor',    icon:'weather-sunny' },
                    { value:'greenhouse',label:'Greenhouse', icon:'greenhouse' },
                    { value:'indoor',    label:'Indoor',      icon:'home' }
                  ]}
                  style={{ borderRadius:10, backgroundColor: logic.backgroundColor }}
                />
              </WeedGrowFormSection>

              {/* Sensor Profile */}
              {(logic.environment==='indoor'||logic.environment==='greenhouse') && (
                <WeedGrowFormSection label="Sensor Profile">
                  <WeedGrowDropdownInput
                    icon="chip"
                    label={logic.loadingProfiles?'Loading…':'Sensor Profile'}
                    value={logic.sensorOptions.find(o=>o.value===logic.environment)?.label||''}
                    options={logic.sensorOptions}
                    onSelect={v=>logic.setField('sensorProfileId',v)}
                    menuVisible={logic.sensorMenuVisible}
                    setMenuVisible={logic.openSensorMenu}
                    placeholder="Select profile"
                  />
                </WeedGrowFormSection>
              )}

              {/* Planted In */}
              <WeedGrowFormSection label="Planted In">
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
                  {['pot','ground'].map(opt => (
                    <Button
                      key={opt}
                      mode={logic.plantedIn===opt?'contained':'outlined'}
                      onPress={()=>logic.setField('plantedIn',opt)}
                      style={{ flex:1, margin:4 }}
                      labelStyle={{ fontWeight:'600' }}
                    >
                      {opt==='pot'?'Pot':'Ground'}
                    </Button>
                  ))}
                </View>
              </WeedGrowFormSection>

              {/* Pot Size */}
              {logic.plantedIn==='pot' && (
                <WeedGrowFormSection label="Pot Size">
                  <WeedGrowDropdownInput
                    icon="flower-pot"
                    label="Pot Size"
                    value={logic.environment === 'pot' ? '' : '' /* fallback, or add potSize to logic */}
                    options={logic.potSizeOptions.map(p=>({ label:p, value:p }))}
                    onSelect={v=>logic.setField('potSize',v)}
                    menuVisible={logic.potMenuVisible}
                    setMenuVisible={logic.openPotMenu}
                    placeholder="Select pot size"
                  />
                </WeedGrowFormSection>
              )}

              {/* Sunlight */}
              {(logic.environment==='outdoor'||logic.environment==='greenhouse') && (
                <WeedGrowFormSection label="Sunlight Exposure">
                  <WeedGrowDropdownInput
                    icon="white-balance-sunny"
                    label="Sunlight Exposure"
                    value={'' /* fallback, or add sunlightExposure to logic */}
                    options={logic.sunlightOptions}
                    onSelect={v=>logic.setField('sunlightExposure',v)}
                    menuVisible={logic.sunMenuVisible}
                    setMenuVisible={logic.openSunMenu}
                    placeholder="Select sunlight"
                  />
                </WeedGrowFormSection>
              )}

              {/* Nav Buttons */}
              <WeedGrowButtonRow>
                <Button onPress={back} mode="outlined" style={{flex:1}}>Back</Button>
                <Button onPress={next} mode="contained" style={{flex:1}}>Next</Button>
              </WeedGrowButtonRow>
            </WeedGrowCard>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
