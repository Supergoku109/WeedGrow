import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TextInput,
  Button,
  Menu,
  SegmentedButtons,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import StepIndicatorBar from '@/ui/StepIndicatorBar';
import { usePlantForm } from '@/features/plants/hooks/usePlantForm';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ThemedText } from '@/ui/ThemedText';
import { useWeedGrowInputStyle } from '@/ui/WeedGrowInputStyle';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { WeedGrowDropdownInput } from '@/ui/WeedGrowDropdownInput';
import { WeedGrowCard } from '@/ui/WeedGrowCard';

export default function Step2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { environment, potSize, sunlightExposure, plantedIn, setField, sensorProfileId } = usePlantForm();
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;
  const insets = useSafeAreaInsets();
  const [potMenu, setPotMenu] = React.useState(false);
  const [sunMenu, setSunMenu] = React.useState(false);
  const [sensorProfiles, setSensorProfiles] = useState<any[]>([]);
  const [sensorMenu, setSensorMenu] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const { inputStyle, menuInputStyle, menuContentStyle, iconStyle } = useWeedGrowInputStyle();

  // Helper for consistent menu TextInput
  const menuInputProps = (extra: any = {}) => ({
    style: [inputStyle, menuInputStyle, extra.style],
    contentStyle: { ...menuContentStyle, ...(extra.contentStyle || {}) },
    ...extra,
  });

  // Helper for dropdown options
  const potSizeOptions = [
    { label: '1L', value: '1L' },
    { label: '5L', value: '5L' },
    { label: '10L', value: '10L' },
    { label: '20L', value: '20L' },
    { label: '50L', value: '50L' },
  ];
  const sunlightOptions = [
    { label: 'Full Sun', value: 'Full Sun', icon: 'white-balance-sunny' },
    { label: 'Partial Sun', value: 'Partial Sun', icon: 'weather-partly-cloudy' },
    { label: 'Mostly Shade', value: 'Mostly Shade', icon: 'weather-cloudy' },
    { label: 'Not Sure', value: 'Not Sure', icon: 'help-circle-outline' },
  ];
  const sensorProfileOptions = sensorProfiles.map((profile) => ({
    label: profile.name,
    value: profile.id,
    icon: 'chip',
  }));

  useEffect(() => {
    if (environment === 'indoor' || environment === 'greenhouse') {
      setLoadingProfiles(true);
      getDocs(collection(db, 'sensorProfiles')).then(snap => {
        setSensorProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadingProfiles(false);
      }).catch(() => setLoadingProfiles(false));
    }
  }, [environment]);

  useEffect(() => {
    if (params?.newSensorProfileId && params.newSensorProfileId !== sensorProfileId) {
      setField('sensorProfileId', params.newSensorProfileId);
      // Remove the param from the URL to prevent repeated updates
      router.replace('/add-plant/step2');
    }
  }, [params?.newSensorProfileId, sensorProfileId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: 8 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}
          >
            <StepIndicatorBar currentPosition={1} />
            <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 8, fontSize: 24 }}>
              🌿 Where is your plant growing?
            </ThemedText>
            <ThemedText style={{ textAlign: 'center', color: Colors[theme].tint, marginBottom: 18, fontSize: 15 }}>
              Select the environment, pot/ground, and any relevant sensor or sunlight details.
            </ThemedText>
            <WeedGrowCard entering={FadeIn.duration(500)} style={{ alignItems: 'stretch', marginTop: 8 }}>
              <SegmentedButtons
                value={environment}
                onValueChange={(val) => setField('environment', val as any)}
                buttons={[
                  { value: 'outdoor', label: 'Outdoor', icon: 'weather-sunny' },
                  { value: 'greenhouse', label: 'Greenhouse', icon: 'greenhouse' },
                  { value: 'indoor', label: 'Indoor', icon: 'home' },
                ]}
                style={{ borderRadius: 10, backgroundColor: Colors[theme].background, borderWidth: 0, marginBottom: 14 }}
              />

              {/* Sensor Profile Dropdown for indoor/greenhouse */}
              {(environment === 'indoor' || environment === 'greenhouse') && (
                <WeedGrowDropdownInput
                  icon="chip"
                  label={loadingProfiles ? 'Loading Sensor Profiles...' : 'Sensor Profile'}
                  value={sensorProfiles.find(p => p.id === sensorProfileId)?.name || ''}
                  options={sensorProfileOptions}
                  onSelect={(val) => setField('sensorProfileId', val)}
                  menuVisible={sensorMenu}
                  setMenuVisible={setSensorMenu}
                  placeholder={sensorProfiles.length === 0 ? 'No profiles found' : 'Select a profile'}
                />
              )}

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14, justifyContent: 'center' }}>
                {['pot', 'ground'].map((opt) => (
                  <Button
                    key={opt}
                    mode={plantedIn === opt ? 'contained' : 'outlined'}
                    onPress={() => setField('plantedIn', opt as any)}
                    style={{ borderRadius: 8, minWidth: 100, marginHorizontal: 4, marginBottom: 4, backgroundColor: plantedIn === opt ? Colors[theme].tint : undefined, borderColor: Colors[theme].tint, borderWidth: 1 }}
                    labelStyle={{ fontWeight: '600', color: plantedIn === opt ? Colors[theme].background : Colors[theme].tint }}
                  >
                    {opt === 'pot' ? 'Pot' : 'Ground'}
                  </Button>
                ))}
              </View>

              {plantedIn === 'pot' && (
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
              )}

              {/* Only show Sunlight Exposure for outdoor/greenhouse */}
              {(environment === 'outdoor' || environment === 'greenhouse') && (
                <WeedGrowDropdownInput
                  icon="white-balance-sunny"
                  label="Sunlight Exposure"
                  value={sunlightExposure || ''}
                  options={sunlightOptions}
                  onSelect={(val) => setField('sunlightExposure', val)}
                  menuVisible={sunMenu}
                  setMenuVisible={setSunMenu}
                  placeholder="Select sunlight exposure"
                />
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 }}>
                <Button
                  mode="outlined"
                  onPress={() => router.back()}
                  style={{ borderRadius: 8, minWidth: 100, borderColor: Colors[theme].tint, borderWidth: 1 }}
                  labelStyle={{ fontWeight: '600' }}
                >
                  Back
                </Button>
                <Button
                  mode="contained"
                  onPress={() => router.push('/add-plant/step3')}
                  style={{ borderRadius: 8, minWidth: 100, backgroundColor: Colors[theme].tint, elevation: 2 }}
                  labelStyle={{ fontWeight: '700', letterSpacing: 1 }}
                  contentStyle={{ height: 48 }}
                >
                  Next
                </Button>
              </View>
            </WeedGrowCard>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
