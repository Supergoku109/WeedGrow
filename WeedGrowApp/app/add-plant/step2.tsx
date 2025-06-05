import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native';
import { TextInput, Button, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';

export default function Step2() {
  const router = useRouter();
  const { environment, potSize, sunlightExposure, plantedIn, setField } = usePlantForm();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <StepIndicatorBar currentPosition={1} />
        <RadioButton.Group
          onValueChange={(val) => setField('environment', val as any)}
          value={environment}
        >
          <RadioButton.Item label="Outdoor" value="outdoor" />
          <RadioButton.Item label="Greenhouse" value="greenhouse" />
          <RadioButton.Item label="Indoor" value="indoor" />
        </RadioButton.Group>
        <RadioButton.Group
          onValueChange={(val) => setField('plantedIn', val as any)}
          value={plantedIn}
        >
          <RadioButton.Item label="Pot" value="pot" />
          <RadioButton.Item label="Ground" value="ground" />
        </RadioButton.Group>
        {plantedIn === 'pot' && (
          <TextInput
            label="Pot Size"
            value={potSize}
            onChangeText={(text) => setField('potSize', text)}
            style={{ marginTop: 16 }}
          />
        )}
        <TextInput
          label="Sunlight Exposure"
          value={sunlightExposure}
          onChangeText={(text) => setField('sunlightExposure', text)}
          style={{ marginTop: 16 }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
          <Button mode="outlined" onPress={() => router.back()}>Back</Button>
          <Button mode="contained" onPress={() => router.push('/add-plant/step3')}>
            Next
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
