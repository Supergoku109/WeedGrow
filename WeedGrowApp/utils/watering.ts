import { Plant } from '@/firestoreModels';

export interface Weather {
  rainToday: boolean;
  rainTomorrow: boolean;
  rainfallYesterday?: number;
  humidity?: number;
}

const DAY_MS = 1000 * 60 * 60 * 24;

function parseFrequencyToDays(freq: unknown): number | null {
  if (!freq) return null;
  if (typeof freq === 'number') return freq;
  const str = String(freq).toLowerCase();
  const match = str.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  if (str.includes('day')) return 1;
  if (str.includes('week')) return 7;
  return null;
}

function estimateLastWatered(createdAt: Date, freqDays: number): Date {
  const daysSinceCreated = Math.floor((Date.now() - createdAt.getTime()) / DAY_MS);
  const cycles = Math.floor(daysSinceCreated / freqDays);
  return new Date(createdAt.getTime() + cycles * freqDays * DAY_MS);
}

export function getWateringSuggestion(plant: Plant, weather: Weather): string {
  const freqDays = parseFrequencyToDays(plant.wateringFrequency);
  if (!freqDays) return 'No Water History';

  let lastWatered: Date | null = null;
  if (plant.lastWateredAt) {
    lastWatered = new Date(plant.lastWateredAt);
  } else if (plant.createdAt) {
    lastWatered = estimateLastWatered(new Date(plant.createdAt), freqDays);
  }

  if (!lastWatered) return 'No Water History';

  const daysSince = Math.floor((Date.now() - lastWatered.getTime()) / DAY_MS);
  const isTimeToWater = daysSince >= freqDays;

  if (weather.rainToday) return 'Rain Incoming';
  if (isTimeToWater && weather.rainTomorrow) return 'Water Lightly';
  if (isTimeToWater) return 'Water Today';
  return 'No Water Needed';
}
