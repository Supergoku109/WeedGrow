import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';

export default function Step3() {
  const router = useRouter();
  const { location, locationNickname, setField } = usePlantForm();
  const lat = location?.lat?.toString() ?? '';
  const lng = location?.lng?.toString() ?? '';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <StepIndicatorBar currentPosition={2} />
        <TextInput
          label="Latitude"
          value={lat}
          onChangeText={(text) =>
            setField('location', { lat: parseFloat(text) || 0, lng: location?.lng || 0 })
          }
          style={{ marginTop: 16 }}
        />
        <TextInput
          label="Longitude"
          value={lng}
          onChangeText={(text) =>
            setField('location', { lat: location?.lat || 0, lng: parseFloat(text) || 0 })
          }
          style={{ marginTop: 16 }}
        />
        <TextInput
          label="Location Nickname"
          value={locationNickname}
          onChangeText={(text) => setField('locationNickname', text)}
          style={{ marginTop: 16 }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
          <Button mode="outlined" onPress={() => router.back()}>Back</Button>
          <Button mode="contained" onPress={() => router.push('/add-plant/step4')}>
            Next
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
