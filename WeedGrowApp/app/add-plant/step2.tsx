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

import StepIndicatorBar from '@/ui/StepIndicatorBar';
import { usePlantForm } from '@/features/plants/hooks/usePlantForm';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/services/firebase';
import { collection, getDocs } from 'firebase/firestore';

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

  const inputStyle = {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  } as const;

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
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}>
          <StepIndicatorBar currentPosition={1} />

          <SegmentedButtons
            value={environment}
            onValueChange={(val) => setField('environment', val as any)}
            buttons={[
              { value: 'outdoor', label: 'Outdoor' },
              { value: 'greenhouse', label: 'Greenhouse' },
              { value: 'indoor', label: 'Indoor' },
            ]}
          />

          {/* Sensor Profile Dropdown for indoor/greenhouse */}
          {(environment === 'indoor' || environment === 'greenhouse') && (
            <>
              <Menu
                visible={sensorMenu}
                onDismiss={() => setSensorMenu(false)}
                anchor={
                  <TextInput
                    label={loadingProfiles ? 'Loading Sensor Profiles...' : 'Sensor Profile'}
                    value={sensorProfiles.find(p => p.id === sensorProfileId)?.name || ''}
                    style={inputStyle}
                    editable={false}
                    right={<TextInput.Icon icon="menu-down" onPress={() => setSensorMenu(true)} />}
                    placeholder={sensorProfiles.length === 0 ? 'No profiles found' : 'Select a profile'}
                  />
                }
              >
                {sensorProfiles.map((profile) => (
                  <Menu.Item
                    key={profile.id}
                    onPress={() => {
                      setField('sensorProfileId', profile.id);
                      setSensorMenu(false);
                    }}
                    title={profile.name}
                  />
                ))}
                <Menu.Item
                  key="add-new"
                  onPress={() => {
                    setSensorMenu(false);
                    router.push('/add-sensor-profile');
                  }}
                  title="+ Create New Profile"
                />
              </Menu>
            </>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['pot', 'ground'].map((opt) => (
              <Button
                key={opt}
                mode={plantedIn === opt ? 'contained' : 'outlined'}
                onPress={() => setField('plantedIn', opt as any)}
              >
                {opt === 'pot' ? 'Pot' : 'Ground'}
              </Button>
            ))}
          </View>

          {plantedIn === 'pot' && (
            <Menu
              visible={potMenu}
              onDismiss={() => setPotMenu(false)}
              anchor={
                <TextInput
                  label="Pot Size"
                  value={potSize}
                  style={inputStyle}
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" onPress={() => setPotMenu(true)} />}
                />
              }
            >
              {['1L', '5L', '10L', '20L', '50L'].map((size) => (
                <Menu.Item
                  key={size}
                  onPress={() => {
                    setField('potSize', size);
                    setPotMenu(false);
                  }}
                  title={size}
                />
              ))}
            </Menu>
          )}

          {/* Only show Sunlight Exposure for outdoor/greenhouse */}
          {(environment === 'outdoor' || environment === 'greenhouse') && (
            <Menu
              visible={sunMenu}
              onDismiss={() => setSunMenu(false)}
              anchor={
                <TextInput
                  label="Sunlight Exposure"
                  value={sunlightExposure}
                  style={inputStyle}
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" onPress={() => setSunMenu(true)} />}
                />
              }
            >
              {['Full Sun', 'Partial Sun', 'Mostly Shade', 'Not Sure'].map((opt) => (
                <Menu.Item
                  key={opt}
                  onPress={() => {
                    setField('sunlightExposure', opt);
                    setSunMenu(false);
                  }}
                  title={opt}
                />
              ))}
            </Menu>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
            <Button mode="outlined" onPress={() => router.back()}>
              Back
            </Button>
            <Button mode="contained" onPress={() => router.push('/add-plant/step3')}>
              Next
            </Button>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}
