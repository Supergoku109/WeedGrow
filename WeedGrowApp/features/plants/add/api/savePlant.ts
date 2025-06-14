// /features/plants/add/api/savePlant.ts

import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { MILLISECONDS_PER_DAY } from '@/constants/Time';
import { fetchWeather } from '@/lib/weather/fetchWeather';
import { parseWeatherData } from '@/lib/weather/parseWeatherData';
import { updateWeatherCache } from '@/lib/weather/updateFirestore';
import type { PlantForm } from '@/features/plants/form/PlantForm';

export async function savePlantToFirestore(form: PlantForm) {
  const ageNum = parseInt(form.ageDays || '0', 10);
  const createdAt = Timestamp.fromMillis(Date.now() - ageNum * MILLISECONDS_PER_DAY);

  const plantRef = await addDoc(collection(db, 'plants'), {
    name: form.name,
    strain: form.strain,
    owners: ['demoUser'],  // to be updated later for user IDs
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

  if (form.location?.lat && form.location?.lng) {
    try {
      const weatherApiData = await fetchWeather(form.location.lat, form.location.lng);
      const parsed = parseWeatherData(weatherApiData);
      await updateWeatherCache(plantRef.id, parsed);
    } catch (err) {
      console.warn('Could not fetch weather for new plant:', err);
    }
  }
}
