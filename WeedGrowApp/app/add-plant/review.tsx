import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';

export default function Review() {
  const router = useRouter();
  const form = usePlantForm();

  const save = () => {
    console.log('Plant saved:', { ...form });
    form.reset();
    router.replace('/plants');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <StepIndicatorBar currentPosition={4} />
      <Card style={{ marginTop: 16 }}>
        <Card.Title title="Review Plant" />
        <Card.Content>
          {Object.entries(form).map(([key, value]) => {
            if (typeof value === 'function') return null;
            return (
              <View key={key} style={{ marginBottom: 8 }}>
                <Text variant="labelLarge">{key}</Text>
                <Text>{JSON.stringify(value)}</Text>
              </View>
            );
          })}
        </Card.Content>
      </Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
        <Button mode="outlined" onPress={() => router.back()}>Back</Button>
        <Button mode="contained" onPress={save}>Save Plant</Button>
      </View>
    </ScrollView>
  );
}
