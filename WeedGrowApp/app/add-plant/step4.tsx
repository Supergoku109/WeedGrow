import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';

export default function Step4() {
  const router = useRouter();
  const { wateringFrequency, fertilizer, pests, trainingTags, setField } = usePlantForm();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <StepIndicatorBar currentPosition={3} />
        <TextInput
          label="Watering Frequency"
          value={wateringFrequency}
          onChangeText={(text) => setField('wateringFrequency', text)}
          style={{ marginTop: 16 }}
        />
        <TextInput
          label="Fertilizer"
          value={fertilizer}
          onChangeText={(text) => setField('fertilizer', text)}
          style={{ marginTop: 16 }}
        />
        <TextInput
          label="Pest History"
          value={pests ? pests.join(', ') : ''}
          onChangeText={(text) => setField('pests', text.split(',').map((s) => s.trim()))}
          style={{ marginTop: 16 }}
        />
        <TextInput
          label="Training Tags"
          value={trainingTags ? trainingTags.join(', ') : ''}
          onChangeText={(text) => setField('trainingTags', text.split(',').map((s) => s.trim()))}
          style={{ marginTop: 16 }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
          <Button mode="outlined" onPress={() => router.back()}>Back</Button>
          <Button mode="contained" onPress={() => router.push('/add-plant/step5')}>
            Next
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
