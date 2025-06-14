// features/plants/add-plant/screens/Step4Care.tsx

import React, { useState } from 'react';
import {
  ScrollView, KeyboardAvoidingView, Platform, View, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { FadeIn } from 'react-native-reanimated';

import StepIndicatorBar from '@/ui/StepIndicatorBar';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { WeedGrowDropdownInput } from '@/ui/WeedGrowDropdownInput';
import { useWeedGrowInputStyle } from '@/ui/WeedGrowInputStyle';
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';
import { ThemedText } from '@/ui/ThemedText';
import type { PlantForm } from '@/features/plants/form/PlantForm';

interface AddPlantStepProps {
  form: PlantForm;
  setField: (field: keyof PlantForm, value: any) => void;
  next?: () => void;
  back?: () => void;
}

export default function Step4Care({ form, setField, next, back }: AddPlantStepProps) {
  const router = useRouter();
  const { wateringFrequency, fertilizer, pests, trainingTags } = form;
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  const [waterMenu, setWaterMenu] = useState(false);
  const pestOptions = ['Spider Mites', 'Powdery Mildew', 'Aphids'];
  const trainingOptions = ['LST', 'Topping', 'SCROG'];
  const { inputStyle } = useWeedGrowInputStyle();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: 8 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 16, flexGrow: 1 }}
          >
            <StepIndicatorBar currentPosition={3} />

            <WeedGrowCard entering={FadeIn.duration(500)} style={{ marginTop: 8 }}>
              <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 8, fontSize: 22, color: Colors[theme].tint }}>
                💧 Care Details
              </ThemedText>

              <WeedGrowFormSection label="Watering & Fertilizer">
                <WeedGrowDropdownInput
                  icon="water"
                  label="Watering Frequency"
                  value={wateringFrequency || ''}
                  options={['Every day', 'Every 2 days', 'Every 3 days', 'Weekly'].map((opt) => ({ label: opt, value: opt }))}
                  onSelect={(val) => setField('wateringFrequency', val)}
                  menuVisible={waterMenu}
                  setMenuVisible={setWaterMenu}
                  placeholder="Select frequency"
                />
                <WeedGrowTextInput
                  label="Fertilizer"
                  value={fertilizer}
                  onChangeText={(text: string) => setField('fertilizer', text)}
                  icon="leaf"
                />
              </WeedGrowFormSection>

              <WeedGrowFormSection label="Pest History" style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {pestOptions.map((p) => (
                    <Chip
                      key={p}
                      selected={pests?.includes(p)}
                      onPress={() => {
                        const arr = pests || [];
                        setField('pests', arr.includes(p) ? arr.filter((x) => x !== p) : [...arr, p]);
                      }}
                      style={{ backgroundColor: pests?.includes(p) ? Colors[theme].tint : '#223c2b', borderRadius: 8 }}
                      textStyle={{ color: pests?.includes(p) ? '#fff' : Colors[theme].text, fontWeight: '600' }}
                    >
                      {p}
                    </Chip>
                  ))}
                </View>
              </WeedGrowFormSection>

              <WeedGrowFormSection label="Training Techniques" style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {trainingOptions.map((t) => (
                    <Chip
                      key={t}
                      selected={trainingTags?.includes(t)}
                      onPress={() => {
                        const arr = trainingTags || [];
                        setField('trainingTags', arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]);
                      }}
                      style={{ backgroundColor: trainingTags?.includes(t) ? Colors[theme].tint : '#223c2b', borderRadius: 8 }}
                      textStyle={{ color: trainingTags?.includes(t) ? '#fff' : Colors[theme].text, fontWeight: '600' }}
                    >
                      {t}
                    </Chip>
                  ))}
                </View>
              </WeedGrowFormSection>

              <WeedGrowButtonRow>
                <Button mode="outlined" onPress={() => router.back()} style={{ flex: 1, borderRadius: 8, borderColor: Colors[theme].tint }}>
                  Back
                </Button>
                <Button
                  mode="contained"
                  onPress={() => router.push('/add-plant/step5')}
                  style={{ flex: 1, borderRadius: 8, backgroundColor: Colors[theme].tint }}
                >
                  Next
                </Button>
              </WeedGrowButtonRow>
            </WeedGrowCard>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
