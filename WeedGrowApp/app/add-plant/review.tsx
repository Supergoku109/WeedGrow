import React from 'react';
import { ScrollView, View, Image, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

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
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowDivider } from '@/ui/WeedGrowDivider';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';

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
        sensorProfileId: form.sensorProfileId ?? null,
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 0, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <StepIndicatorBar currentPosition={4} />
        <WeedGrowCard entering={FadeIn.duration(500)} style={{ alignItems: 'stretch', marginTop: 8 }}>
          <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 10, fontSize: 22, color: Colors[theme].tint }}>
            🌱 Review Your Plant
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', color: Colors[theme].label, marginBottom: 22, fontSize: 15 }}>
            Double-check your details before saving!
          </ThemedText>
          {form.imageUri && (
            <Image
              source={{ uri: form.imageUri }}
              style={{
                height: 180,
                width: '100%',
                maxWidth: 320,
                borderRadius: 16,
                marginBottom: 18,
                borderWidth: 2,
                borderColor: Colors[theme].tint,
                alignSelf: 'center',
              }}
              resizeMode="cover"
            />
          )}

          <WeedGrowFormSection label="Growth Info" divider>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Name</ThemedText>
              <ThemedText>{form.name}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Strain</ThemedText>
              <ThemedText>{form.strain}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Growth Stage</ThemedText>
              <ThemedText>{form.growthStage}</ThemedText>
            </View>
            {(form.growthStage === 'vegetative' || form.growthStage === 'flowering') && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Age (days)</ThemedText>
                <ThemedText>{form.ageDays}</ThemedText>
              </View>
            )}
          </WeedGrowFormSection>

          <WeedGrowFormSection label="Environment" divider style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Environment</ThemedText>
              <ThemedText>{form.environment}</ThemedText>
            </View>
            {form.plantedIn && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Planted In</ThemedText>
                <ThemedText>{form.plantedIn}</ThemedText>
              </View>
            )}
            {form.potSize && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Pot Size</ThemedText>
                <ThemedText>{form.potSize}</ThemedText>
              </View>
            )}
            {form.sunlightExposure && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Sunlight</ThemedText>
                <ThemedText>{form.sunlightExposure}</ThemedText>
              </View>
            )}
            {form.locationNickname ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Location</ThemedText>
                <ThemedText>{form.locationNickname}</ThemedText>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Location</ThemedText>
                <ThemedText>not defined</ThemedText>
              </View>
            )}
            {(form.environment === 'indoor' || form.environment === 'greenhouse') ? (
              form.sensorProfileId ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Sensor Profile</ThemedText>
                  <ThemedText>{form.sensorProfileId}</ThemedText>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Sensor Profile</ThemedText>
                  <ThemedText>not defined</ThemedText>
                </View>
              )
            ) : null}
          </WeedGrowFormSection>

          <WeedGrowFormSection label="Care" divider style={{ marginTop: 10 }}>
            {form.wateringFrequency ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Watering</ThemedText>
                <ThemedText>{form.wateringFrequency}</ThemedText>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Watering</ThemedText>
                <ThemedText>not defined</ThemedText>
              </View>
            )}
            {form.fertilizer ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Fertilizer</ThemedText>
                <ThemedText>{form.fertilizer}</ThemedText>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Fertilizer</ThemedText>
                <ThemedText>not defined</ThemedText>
              </View>
            )}
            {form.pests && form.pests.length > 0 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Pests</ThemedText>
                <ThemedText>{form.pests.join(', ')}</ThemedText>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Pests</ThemedText>
                <ThemedText>not defined</ThemedText>
              </View>
            )}
            {form.trainingTags && form.trainingTags.length > 0 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Training</ThemedText>
                <ThemedText>{form.trainingTags.join(', ')}</ThemedText>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Training</ThemedText>
                <ThemedText>not defined</ThemedText>
              </View>
            )}
          </WeedGrowFormSection>

          <WeedGrowFormSection label="Notes" style={{ marginTop: 10 }}>
            {form.notes ? (
              <View style={{ marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Notes</ThemedText>
                <ThemedText>{form.notes}</ThemedText>
              </View>
            ) : (
              <View style={{ marginBottom: 6 }}>
                <ThemedText style={{ fontWeight: '600', color: Colors[theme].label }}>Notes</ThemedText>
                <ThemedText>not defined</ThemedText>
              </View>
            )}
          </WeedGrowFormSection>

          <WeedGrowButtonRow>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={{ borderRadius: 8, minWidth: 120, borderColor: Colors[theme].tint, borderWidth: 1, flex: 1, marginRight: 4 }}
              labelStyle={{ fontWeight: '600' }}
              contentStyle={{ height: 48 }}
            >
              Back
            </Button>
            <Button
              mode="contained"
              onPress={save}
              disabled={saving}
              loading={saving}
              style={{ borderRadius: 8, minWidth: 120, backgroundColor: Colors[theme].tint, elevation: 2, flex: 1, marginLeft: 4 }}
              labelStyle={{ fontWeight: '700', letterSpacing: 1 }}
              contentStyle={{ height: 48 }}
            >
              Save Plant
            </Button>
          </WeedGrowButtonRow>
        </WeedGrowCard>
      </ScrollView>
    </SafeAreaView>
  );
}
