// features/plants/add-plant/screens/Step2Environment.tsx

import React, { useEffect, useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput, Button, Menu, SegmentedButtons } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { collection, getDocs } from 'firebase/firestore';

import { StepIndicatorBar } from '../components/StepIndicatorBar';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/services/firebase';
import { ThemedText } from '@/ui/ThemedText';
import { useWeedGrowInputStyle } from '@/ui/WeedGrowInputStyle';
import { WeedGrowDropdownInput } from '@/ui/WeedGrowDropdownInput';
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';
import type { PlantForm } from '@/features/plants/form/PlantForm';

interface AddPlantStepProps {
  form: PlantForm;
  setField: (field: keyof PlantForm, value: any) => void;
  next?: () => void;
  back?: () => void;
}

export default function Step2Environment({ form, setField, next, back }: AddPlantStepProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { environment, potSize, sunlightExposure, plantedIn, sensorProfileId } = form;
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const insets = useSafeAreaInsets();

  const [potMenu, setPotMenu] = useState(false);
  const [sunMenu, setSunMenu] = useState(false);
  const [sensorProfiles, setSensorProfiles] = useState<any[]>([]);
  const [sensorMenu, setSensorMenu] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const { inputStyle, menuInputStyle, menuContentStyle } = useWeedGrowInputStyle();

  const potSizeOptions = ['1L', '5L', '10L', '20L', '50L'].map(p => ({ label: p, value: p }));
  const sunlightOptions = [
    { label: 'Full Sun', value: 'Full Sun', icon: 'white-balance-sunny' },
    { label: 'Partial Sun', value: 'Partial Sun', icon: 'weather-partly-cloudy' },
    { label: 'Mostly Shade', value: 'Mostly Shade', icon: 'weather-cloudy' },
    { label: 'Not Sure', value: 'Not Sure', icon: 'help-circle-outline' },
  ];
  const sensorProfileOptions = sensorProfiles.map(p => ({ label: p.name, value: p.id, icon: 'chip' }));

  useEffect(() => {
    if (environment === 'indoor' || environment === 'greenhouse') {
      setLoadingProfiles(true);
      getDocs(collection(db, 'sensorProfiles'))
        .then(snap => {
          setSensorProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoadingProfiles(false);
        })
        .catch(() => setLoadingProfiles(false));
    }
  }, [environment]);

  useEffect(() => {
    if (params?.newSensorProfileId && params.newSensorProfileId !== sensorProfileId) {
      setField('sensorProfileId', params.newSensorProfileId);
    }
  }, [params?.newSensorProfileId, sensorProfileId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: 8 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}>
            <StepIndicatorBar currentPosition={1} />
            <WeedGrowCard entering={FadeIn.duration(500)} style={{ marginTop: 8 }}>
              <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 8, fontSize: 24 }}>
                🌿 Where is your plant growing?
              </ThemedText>

              <WeedGrowFormSection label="Environment">
                <SegmentedButtons
                  value={environment}
                  onValueChange={(val) => setField('environment', val as any)}
                  buttons={[
                    { value: 'outdoor', label: 'Outdoor', icon: 'weather-sunny' },
                    { value: 'greenhouse', label: 'Greenhouse', icon: 'greenhouse' },
                    { value: 'indoor', label: 'Indoor', icon: 'home' },
                  ]}
                  style={{ borderRadius: 10, backgroundColor: Colors[theme].background, borderWidth: 0 }}
                />
              </WeedGrowFormSection>

              {(environment === 'indoor' || environment === 'greenhouse') && (
                <WeedGrowFormSection label="Sensor Profile" style={{ marginTop: 12 }}>
                  <WeedGrowDropdownInput
                    icon="chip"
                    label={loadingProfiles ? 'Loading...' : 'Sensor Profile'}
                    value={sensorProfiles.find(p => p.id === sensorProfileId)?.name || ''}
                    options={sensorProfileOptions}
                    onSelect={(val) => setField('sensorProfileId', val)}
                    menuVisible={sensorMenu}
                    setMenuVisible={setSensorMenu}
                    placeholder="Select profile"
                  />
                </WeedGrowFormSection>
              )}

              <WeedGrowFormSection label="Planted In" style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {['pot', 'ground'].map((opt) => (
                    <Button
                      key={opt}
                      mode={plantedIn === opt ? 'contained' : 'outlined'}
                      onPress={() => setField('plantedIn', opt as any)}
                      style={{
                        borderRadius: 8,
                        minWidth: 100,
                        marginHorizontal: 4,
                        marginBottom: 4,
                        backgroundColor: plantedIn === opt ? Colors[theme].tint : undefined,
                        borderColor: Colors[theme].tint,
                        borderWidth: 1,
                      }}
                      labelStyle={{ fontWeight: '600', color: plantedIn === opt ? Colors[theme].background : Colors[theme].tint }}
                    >
                      {opt === 'pot' ? 'Pot' : 'Ground'}
                    </Button>
                  ))}
                </View>
              </WeedGrowFormSection>

              {plantedIn === 'pot' && (
                <WeedGrowFormSection label="Pot Size" style={{ marginTop: 12 }}>
                  <WeedGrowDropdownInput
                    icon="flower-pot"
                    label="Pot Size"
                    value={potSize || ''}
                    options={potSizeOptions}
                    onSelect={(val) => setField('potSize', val)}
                    menuVisible={potMenu}
                    setMenuVisible={setPotMenu}
                    placeholder="Select pot size"
                  />
                </WeedGrowFormSection>
              )}

              {(environment === 'outdoor' || environment === 'greenhouse') && (
                <WeedGrowFormSection label="Sunlight Exposure" style={{ marginTop: 12 }}>
                  <WeedGrowDropdownInput
                    icon="white-balance-sunny"
                    label="Sunlight Exposure"
                    value={sunlightExposure || ''}
                    options={sunlightOptions}
                    onSelect={(val) => setField('sunlightExposure', val)}
                    menuVisible={sunMenu}
                    setMenuVisible={setSunMenu}
                    placeholder="Select sunlight"
                  />
                </WeedGrowFormSection>
              )}

              <WeedGrowButtonRow style={{ marginTop: 22 }}>
                <Button
                  mode="outlined"
                  onPress={back}
                  style={{ flex: 1, borderRadius: 8, borderColor: Colors[theme].tint }}
                  labelStyle={{ fontWeight: '600', color: Colors[theme].tint }}
                >
                  Back
                </Button>
                <Button
                  mode="contained"
                  onPress={next}
                  style={{ flex: 1, borderRadius: 8, backgroundColor: Colors[theme].tint }}
                  labelStyle={{ fontWeight: '600', color: Colors[theme].background }}
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
