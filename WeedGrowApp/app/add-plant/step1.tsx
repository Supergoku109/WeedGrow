import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native';
import { TextInput, Button, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';

export default function Step1() {
  const router = useRouter();
  const { name, strain, growthStage, setField } = usePlantForm();

  const isValid = name.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <StepIndicatorBar currentPosition={0} />
        <TextInput
          label="Plant Name"
          value={name}
          onChangeText={(text) => setField('name', text)}
          style={{ marginTop: 16 }}
        />
        <TextInput
          label="Strain"
          value={strain}
          onChangeText={(text) => setField('strain', text)}
          style={{ marginTop: 16 }}
        />
        <RadioButton.Group
          onValueChange={(val) => setField('growthStage', val as any)}
          value={growthStage}
        >
          <RadioButton.Item label="Germination" value="germination" />
          <RadioButton.Item label="Seedling" value="seedling" />
          <RadioButton.Item label="Vegetative" value="vegetative" />
          <RadioButton.Item label="Flowering" value="flowering" />
        </RadioButton.Group>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
          <Button mode="outlined" onPress={() => router.back()}>
            Back
          </Button>
          <Button
            mode="contained"
            disabled={!isValid}
            onPress={() => router.push('/add-plant/step2')}
          >
            Next
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
