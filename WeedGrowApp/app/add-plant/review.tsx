import React from 'react';
import { ScrollView, View, Image, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Text, Divider } from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/ui/StepIndicatorBar';
import { usePlantForm } from '@/features/plants/hooks/usePlantForm';
import { Colors } from '@/constants/Colors';
import { MILLISECONDS_PER_DAY } from '@/constants/Time';
import { useColorScheme } from '@/hooks/useColorScheme';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { fetchWeather } from '@/lib/weather/fetchWeather';
import { parseWeatherData } from '@/lib/weather/parseWeatherData';
import { updateWeatherCache } from '@/lib/weather/updateFirestore';

export default function Review() {
  const router = useRouter();
  const form = usePlantForm();
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const ageNum = parseInt(form.ageDays || '0', 10);
      const createdAt = Timestamp.fromMillis(Date.now() - ageNum * MILLISECONDS_PER_DAY);
      const plantRef = await addDoc(collection(db, 'plants'), {
        name: form.name,
        strain: form.strain,
        owners: ['demoUser'],
        growthStage: form.growthStage,
        ageDays: ageNum,
        status: 'active',
        environment: form.environment,
        plantedIn: form.plantedIn,
        potSize: form.potSize ?? null,
        sunlightExposure: form.sunlightExposure ?? null,
        wateringFrequency: form.wateringFrequency ?? null,
        fertilizer: form.fertilizer ?? null,
        pests: form.pests ?? null,
        trainingTags: form.trainingTags ?? null,
        notes: form.notes ?? null,
        imageUri: form.imageUri ?? null,
        location: form.location ?? null,
        locationNickname: form.locationNickname ?? null,
        createdAt,
        updatedAt: serverTimestamp(),
      });
      // Automatically fetch and store weatherCache if location is present
      if (form.location && form.location.lat && form.location.lng) {
        try {
          const weatherApiData = await fetchWeather(form.location.lat, form.location.lng);
          const parsed = parseWeatherData(weatherApiData);
          await updateWeatherCache(plantRef.id, parsed);
        } catch (err) {
          console.warn('Could not fetch weather for new plant:', err);
        }
      }
      form.reset();
      router.replace('/'); // Go to Home tab after saving plant
    } catch (e) {
      console.error('Error saving plant:', e);
    } finally {
      setSaving(false);
    }
  };

  const styles = StyleSheet.create({
    sectionTitle: { fontWeight: 'bold', marginTop: 16, marginBottom: 8, fontSize: 16 },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme as 'light' | 'dark'].background, paddingTop: 8 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}>
      <StepIndicatorBar currentPosition={4} />

      <Card>
        <Card.Title title="Review Plant" />
        <Card.Content>
          <View style={{ gap: 8 }}>
            <ThemedText style={styles.sectionTitle}>Growth Info</ThemedText>
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

            {(form.growthStage === 'vegetative' || form.growthStage === 'flowering') && (
              <>
                <Divider />
                <View>
                  <Text variant="labelLarge">Age (days)</Text>
                  <Text>{form.ageDays}</Text>
                </View>
              </>
            )}

            <Divider />
            <ThemedText style={styles.sectionTitle}>Environment</ThemedText>
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

            <Divider />
            <ThemedText style={styles.sectionTitle}>Care</ThemedText>
            {form.wateringFrequency && (
              <>
                <View>
                  <Text variant="labelLarge">Watering</Text>
                  <Text>{form.wateringFrequency}</Text>
                </View>
                <Divider />
              </>
            )}
            {form.fertilizer && (
              <>
                <View>
                  <Text variant="labelLarge">Fertilizer</Text>
                  <Text>{form.fertilizer}</Text>
                </View>
                <Divider />
              </>
            )}
            {form.pests && form.pests.length > 0 && (
              <>
                <View>
                  <Text variant="labelLarge">Pests</Text>
                  <Text>{form.pests.join(', ')}</Text>
                </View>
                <Divider />
              </>
            )}
            {form.trainingTags && form.trainingTags.length > 0 && (
              <>
                <View>
                  <Text variant="labelLarge">Training</Text>
                  <Text>{form.trainingTags.join(', ')}</Text>
                </View>
                <Divider />
              </>
            )}
            {form.notes && (
              <>
                <View>
                  <Text variant="labelLarge">Notes</Text>
                  <Text>{form.notes}</Text>
                </View>
                <Divider />
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
        <Button mode="contained" onPress={save} disabled={saving} loading={saving}>
          Save Plant
        </Button>
      </View>
    </ScrollView>
  </SafeAreaView>
  );
}
