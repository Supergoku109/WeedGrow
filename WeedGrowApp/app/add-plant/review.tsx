import React from 'react';
import { ScrollView, View, Image } from 'react-native';
import { Button, Card, Text, Divider } from 'react-native-paper';
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
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
      <StepIndicatorBar currentPosition={4} />

      <Card>
        <Card.Title title="Review Plant" />
        <Card.Content>
          <View style={{ gap: 8 }}>
            <View>
              <Text variant="labelLarge">Name</Text>
              <Text>{form.name}</Text>
            </View>
            <Divider />
            <View>
              <Text variant="labelLarge">Strain</Text>
              <Text>{form.strain}</Text>
            </View>
            <Divider />
            <View>
              <Text variant="labelLarge">Growth Stage</Text>
              <Text>{form.growthStage}</Text>
            </View>
            <Divider />
            <View>
              <Text variant="labelLarge">Environment</Text>
              <Text>{form.environment}</Text>
            </View>
            {form.plantedIn && (
              <>
                <Divider />
                <View>
                  <Text variant="labelLarge">Planted In</Text>
                  <Text>{form.plantedIn}</Text>
                </View>
              </>
            )}
            {form.potSize && (
              <>
                <Divider />
                <View>
                  <Text variant="labelLarge">Pot Size</Text>
                  <Text>{form.potSize}</Text>
                </View>
              </>
            )}
            {form.sunlightExposure && (
              <>
                <Divider />
                <View>
                  <Text variant="labelLarge">Sunlight</Text>
                  <Text>{form.sunlightExposure}</Text>
                </View>
              </>
            )}
            {form.location && (
              <>
                <Divider />
                <View>
                  <Text variant="labelLarge">Location</Text>
                  <Text>
                    {form.location.lat}, {form.location.lng}
                  </Text>
                </View>
              </>
            )}
            {form.locationNickname && (
              <>
                <Divider />
                <View>
                  <Text variant="labelLarge">Location Nickname</Text>
                  <Text>{form.locationNickname}</Text>
                </View>
              </>
            )}
            {form.wateringFrequency && (
              <>
                <Divider />
                <View>
                  <Text variant="labelLarge">Watering</Text>
                  <Text>{form.wateringFrequency}</Text>
                </View>
              </>
            )}
            {form.fertilizer && (
              <>
                <Divider />
                <View>
                  <Text variant="labelLarge">Fertilizer</Text>
                  <Text>{form.fertilizer}</Text>
                </View>
              </>
            )}
            {form.pests && form.pests.length > 0 && (
              <>
                <Divider />
                <View>
                  <Text variant="labelLarge">Pests</Text>
                  <Text>{form.pests.join(', ')}</Text>
                </View>
              </>
            )}
            {form.trainingTags && form.trainingTags.length > 0 && (
              <>
                <Divider />
                <View>
                  <Text variant="labelLarge">Training</Text>
                  <Text>{form.trainingTags.join(', ')}</Text>
                </View>
              </>
            )}
            {form.notes && (
              <>
                <Divider />
                <View>
                  <Text variant="labelLarge">Notes</Text>
                  <Text>{form.notes}</Text>
                </View>
              </>
            )}
            {form.imageUri && (
              <>
                <Divider />
                <Image source={{ uri: form.imageUri }} style={{ height: 200, borderRadius: 8 }} />
              </>
            )}
          </View>
        </Card.Content>
      </Card>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
        <Button mode="outlined" onPress={() => router.back()}>
          Back
        </Button>
        <Button mode="contained" onPress={save}>
          Save Plant
        </Button>
      </View>
    </ScrollView>
  );
}
