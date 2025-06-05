import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';

export default function Step5() {
  const router = useRouter();
  const { notes, imageUri, setField } = usePlantForm();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <StepIndicatorBar currentPosition={4} />
        <TextInput
          label="Image URI"
          value={imageUri}
          onChangeText={(text) => setField('imageUri', text)}
          style={{ marginTop: 16 }}
        />
        <TextInput
          label="Notes"
          value={notes}
          onChangeText={(text) => setField('notes', text)}
          multiline
          style={{ marginTop: 16 }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
          <Button mode="outlined" onPress={() => router.back()}>Back</Button>
          <Button mode="contained" onPress={() => router.push('/add-plant/review')}>
            Next
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
