import type { Plant, PlantLog, WeatherCacheEntry } from '@/firestoreModels';
import { fetchLogsAndWeatherForRange } from '@/lib/logs/fetchLogsAndWeatherForRange';
import { fetchWeather } from '@/lib/weather/fetchWeather';
import { parseWeatherData } from '@/lib/weather/parseWeatherData';
import { updateWeatherCache } from '@/lib/weather/updateFirestore';
import logger from '@/lib/logger';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_LOOKBACK_DAYS = 6;
const DEFAULT_RAIN_THRESHOLD_MM = 1.5;
const HOT_TEMP_THRESHOLD = 30;
const VERY_HOT_TEMP_THRESHOLD = 33;
const COOL_TEMP_THRESHOLD = 18;
const LOW_HUMIDITY_THRESHOLD = 45;
const CLOUDY_THRESHOLD = 70;

export type PlantSummary = Plant & { id: string };

export interface WateringInsight {
  plantId: string;
  plantName: string;
  needsWater: boolean;
  score: number;
  daysSinceLastWater: number;
  thresholdDays: number;
  lastWaterSource: 'manual' | 'rain' | 'unknown';
  todayRainfall: number;
  tomorrowRainfall: number;
  temperatureMax: number | null;
  humidity: number | null;
  reason: string;
}

interface EvaluateOptions {
  lookbackDays: number;
  rainfallThresholdMm: number;
}

type RangeEntry = {
  logs: PlantLog[];
  weather: WeatherCacheEntry | null;
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Utility to get local date string (YYYY-MM-DD)
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(date: Date): string {
  // Use robust local date string for all keys
  return getLocalDateString(date);
}

function getBaseThreshold(environment: Plant['environment'] | undefined): number {
  if (environment === 'indoor') return 3;
  if (environment === 'greenhouse') return 2.5;
  return 2; // outdoor or unspecified
}

function formatDaysSince(days: number, source: 'manual' | 'rain' | 'unknown'): string {
  if (days < 0.5) return source === 'rain' ? 'watered by rain today' : 'watered today';
  if (days < 1.5) return source === 'rain' ? 'watered by rain yesterday' : 'watered yesterday';
  const rounded = Math.round(days);
  const suffix = rounded === 1 ? 'day' : 'days';
  if (source === 'rain') return `rainfall ${rounded} ${suffix} ago`;
  if (source === 'manual') return `watered ${rounded} ${suffix} ago`;
  return `no watering for ~${rounded} ${suffix}`;
}

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatReason(parts: string[]): string {
  if (!parts.length) return 'Check the soil moisture manually; data was limited.';
  const [first, ...rest] = parts;
  const sentences = [capitalize(first), ...rest];
  return `${sentences.join('; ')}.`;
}
async function refreshWeatherIfMissing(
  plant: PlantSummary,
  range: Record<string, RangeEntry>,
  targetDates: string[]
): Promise<Record<string, RangeEntry>> {
  if (!plant.location?.lat || !plant.location?.lng) {
    return range;
  }

  const missingDates = targetDates.filter((date) => {
    const entry = range[date];
    return !entry || !entry.weather;
  });

  if (missingDates.length === 0) {
    return range;
  }

  try {
    const apiResponse = await fetchWeather(plant.location.lat, plant.location.lng);
    const parsed = parseWeatherData(apiResponse);
    await updateWeatherCache(plant.id, parsed);

    const updatedRange: Record<string, RangeEntry> = { ...range };
    Object.entries(parsed).forEach(([date, weatherEntry]) => {
      const existing = updatedRange[date];
      if (existing) {
        updatedRange[date] = { ...existing, weather: weatherEntry };
      } else {
        updatedRange[date] = { logs: [], weather: weatherEntry };
      }
    });

    return updatedRange;
  } catch (error) {
    logger.error('Failed to refresh weather for plant', { plantId: plant.id, error });
    return range;
  }
}

async function evaluatePlantWatering(
  plant: PlantSummary,
  today: Date,
  options: EvaluateOptions
): Promise<WateringInsight | null> {
  if (plant.status && plant.status !== 'active') return null;

  const startDate = formatDate(addDays(today, -options.lookbackDays));
  const endDate = formatDate(addDays(today, 1));

  let range: Record<string, RangeEntry>;
  try {
    range = await fetchLogsAndWeatherForRange(plant.id, startDate, endDate);
  } catch (error) {
    logger.error('Failed to fetch logs/weather for plant', { plantId: plant.id, error });
    return null;
  }

  const todayKey = formatDate(today);
  const tomorrowKey = formatDate(addDays(today, 1));
  const yesterdayKey = formatDate(addDays(today, -1));
  const targetDates = [todayKey, tomorrowKey];
  let yesterdayWeatherFound = false;

  range = await refreshWeatherIfMissing(plant, range, targetDates);

  let todayEntry = range[todayKey];
  let todayWeather = todayEntry?.weather;

  // If todayEntry exists but todayWeather is missing, try to use weather from cache
  if (!todayWeather && todayEntry && plant.location?.lat && plant.location?.lng) {
    // Try to get weather from todayEntry.weather again
    if (todayEntry.weather) {
      todayWeather = todayEntry.weather;
    }
  }

  // Plan B: yesterday's weather missing, but today's weather present
  if (todayWeather && !range[yesterdayKey]?.weather) {
    // Use today's and tomorrow's weather for the suggestion
    const tomorrowWeather = range[tomorrowKey]?.weather ?? null;
    const todayRainfall = typeof todayWeather.rainfall === 'number' ? todayWeather.rainfall : 0;
    const tomorrowRainfall = typeof tomorrowWeather?.rainfall === 'number' ? tomorrowWeather.rainfall : 0;
    const temperatureMax =
      todayWeather.detailedTemps?.max ??
      (typeof todayWeather.temperature === 'number' ? todayWeather.temperature : null);
    const humidity = typeof todayWeather.humidity === 'number' ? todayWeather.humidity : null;
    let needsWater = true;
    // Simple logic: if today or tomorrow has enough rain, don't water
    if (todayRainfall >= options.rainfallThresholdMm || tomorrowRainfall >= options.rainfallThresholdMm) {
      needsWater = false;
    }
    return {
      plantId: plant.id,
      plantName: plant.name || 'Unnamed plant',
      needsWater,
      score: 0,
      daysSinceLastWater: 1,
      thresholdDays: getBaseThreshold(plant.environment),
      lastWaterSource: 'unknown',
      todayRainfall,
      tomorrowRainfall,
      temperatureMax,
      humidity,
      reason: "Yesterday’s weather data unavailable – assuming no water was received… using current and forecast data only.",
    };
  }

  if (!todayWeather) {
    logger.warn("Missing today's weather data for plant after fallback", { plantId: plant.id, todayKey });
    return {
      plantId: plant.id,
      plantName: plant.name || 'Unnamed plant',
      needsWater: false,
      score: 0,
      daysSinceLastWater: 0,
      thresholdDays: getBaseThreshold(plant.environment),
      lastWaterSource: 'unknown',
      todayRainfall: 0,
      tomorrowRainfall: 0,
      temperatureMax: null,
      humidity: null,
      reason: 'Weather data is still syncing. Check soil moisture manually today.',
    };
  }

  const tomorrowWeather = range[tomorrowKey]?.weather ?? null;
  const todayRainfall = typeof todayWeather.rainfall === 'number' ? todayWeather.rainfall : 0;
  const tomorrowRainfall = typeof tomorrowWeather?.rainfall === 'number' ? tomorrowWeather.rainfall : 0;
  const temperatureMax =
    todayWeather.detailedTemps?.max ??
    (typeof todayWeather.temperature === 'number' ? todayWeather.temperature : null);
  const humidity = typeof todayWeather.humidity === 'number' ? todayWeather.humidity : null;
  const cloudCoverage = typeof todayWeather.cloudCoverage === 'number' ? todayWeather.cloudCoverage : null;

  const endOfToday = addDays(today, 1);
  const startOfToday = startOfDay(today);
  let historicalWeatherCount = 0;
  let historicalLogCount = 0;
  let lastManualWater: Date | null = null;
  let lastRainDate: Date | null = null;

  Object.entries(range).forEach(([dateKey, entry]) => {
    const dayDate = startOfDay(new Date(`${dateKey}T00:00:00`));
    if (dateKey === yesterdayKey && entry.weather) yesterdayWeatherFound = true;
    if (dayDate > endOfToday) return;

    if (dayDate < startOfToday) {
      if (entry.weather) historicalWeatherCount += 1;
      if (Array.isArray(entry.logs) && entry.logs.length > 0) {
        historicalLogCount += entry.logs.length;
      }
    }

    const logs = Array.isArray(entry.logs) ? entry.logs : [];
    logs.forEach((log) => {
      if (log.type !== 'watering') return;
      const ts = typeof log.timestamp?.toDate === 'function' ? log.timestamp.toDate() : dayDate;
      if (ts > endOfToday) return;
      if (!lastManualWater || ts > lastManualWater) {
        lastManualWater = ts;
      }
    });

    const rainfall = typeof entry.weather?.rainfall === 'number' ? entry.weather.rainfall : 0;
    if (rainfall >= options.rainfallThresholdMm) {
      if (!lastRainDate || dayDate > lastRainDate) {
        lastRainDate = dayDate;
      }
    }
  });

  const hasHistoricalWeather = historicalWeatherCount > 0;
  const hasHistoricalLogs = historicalLogCount > 0;
  const noHistoryAvailable = !hasHistoricalWeather && !hasHistoricalLogs;
  const yesterdayMissing = !yesterdayWeatherFound;
  const manualEventDay = lastManualWater ? startOfDay(lastManualWater) : null;
  const rainEventDay = lastRainDate ? startOfDay(lastRainDate) : null;
  let lastWaterSource: 'manual' | 'rain' | 'unknown' = 'unknown';
  let lastWaterDay: Date | null = null;

  if (manualEventDay && (!rainEventDay || manualEventDay >= rainEventDay)) {
    lastWaterDay = manualEventDay;
    lastWaterSource = 'manual';
  } else if (rainEventDay) {
    lastWaterDay = rainEventDay;
    lastWaterSource = 'rain';
  }

  let daysSinceLastWater: number;
  const createdAtTimestamp = (plant as any)?.createdAt;
  const createdAtDate =
    typeof createdAtTimestamp?.toDate === 'function'
      ? createdAtTimestamp.toDate()
      : null;
  let plantAgeDays: number | null = null;
  if (createdAtDate) {
    const createdStart = startOfDay(createdAtDate);
    plantAgeDays = (startOfToday.getTime() - createdStart.getTime()) / MS_PER_DAY;
    if (plantAgeDays < 0) plantAgeDays = 0;
  }

  if (lastWaterDay) {
    daysSinceLastWater = (today.getTime() - lastWaterDay.getTime()) / MS_PER_DAY;
  } else if (noHistoryAvailable) {
    const assumedDays = Math.max(1, plantAgeDays ?? 1);
    daysSinceLastWater = assumedDays;
  } else {
    daysSinceLastWater = options.lookbackDays + 1;
  }
  if (!Number.isFinite(daysSinceLastWater)) {
    daysSinceLastWater = options.lookbackDays + 1;
  }
  if (daysSinceLastWater < 0) daysSinceLastWater = 0;

  let thresholdDays = getBaseThreshold(plant.environment);
  const isVeryHot = typeof temperatureMax === 'number' && temperatureMax >= VERY_HOT_TEMP_THRESHOLD;
  const isHot = typeof temperatureMax === 'number' && temperatureMax >= HOT_TEMP_THRESHOLD;
  const isCoolAndCloudy =
    typeof temperatureMax === 'number' &&
    typeof cloudCoverage === 'number' &&
    temperatureMax <= COOL_TEMP_THRESHOLD &&
    cloudCoverage >= CLOUDY_THRESHOLD;
  const isLowHumidity = typeof humidity === 'number' && humidity <= LOW_HUMIDITY_THRESHOLD;

  if (isVeryHot) thresholdDays -= 0.75;
  else if (isHot) thresholdDays -= 0.5;
  if (isLowHumidity) thresholdDays -= 0.3;
  if (isCoolAndCloudy) thresholdDays += 0.5;
  if (tomorrowRainfall >= options.rainfallThresholdMm) thresholdDays += 0.5;

  if (thresholdDays < 1) thresholdDays = 1;
  if (thresholdDays > 4) thresholdDays = 4;

  const drynessRatio = daysSinceLastWater / thresholdDays;
  let needsWater = drynessRatio >= 1;

  if (todayRainfall >= options.rainfallThresholdMm) {
    needsWater = false;
    lastWaterSource = 'rain';
    daysSinceLastWater = 0;
  }

  if (tomorrowRainfall >= options.rainfallThresholdMm && daysSinceLastWater < thresholdDays + 0.5) {
    needsWater = false;
  }

  const reasonParts: string[] = [];

  if (lastWaterDay) {
    reasonParts.push(
      `${formatDaysSince(daysSinceLastWater, lastWaterSource)}`
    );
  } else if (noHistoryAvailable) {
    if (yesterdayMissing) {
      reasonParts.push('Yesterday\'s weather data unavailable - assuming no water was received.');
    } else {
      reasonParts.push('No prior watering records yet.');
    }
    if (plantAgeDays !== null) {
      const ageRounded = Math.max(0, Math.round(plantAgeDays));
      if (ageRounded === 0) {
        reasonParts.push('Plant created today; starting with current conditions.');
      } else {
        reasonParts.push(`Plant created ${ageRounded} day${ageRounded === 1 ? '' : 's'} ago.`);
      }
    } else {
      reasonParts.push('No weather history yet; using current conditions.');
    }
    reasonParts.push('Using current and forecast data only.');
  } else {
    reasonParts.push('No watering logged in the past week.');
  }

  if (needsWater) {
    if (isVeryHot || isHot) {
      reasonParts.push(`forecast high of ${Math.round(temperatureMax ?? HOT_TEMP_THRESHOLD)} degC`);
    }
    if (isLowHumidity && typeof humidity === 'number') {
      reasonParts.push(`humidity near ${Math.round(humidity)}%`);
    }
    if (!isVeryHot && !isHot && !isLowHumidity) {
      reasonParts.push(`now beyond the ${thresholdDays.toFixed(1)} day watering window`);
    }
  } else {
    if (todayRainfall >= options.rainfallThresholdMm) {
      reasonParts.push(`received about ${todayRainfall.toFixed(1)}mm of rain today`);
    } else if (tomorrowRainfall >= options.rainfallThresholdMm) {
      reasonParts.push(`rain (~${tomorrowRainfall.toFixed(1)}mm) expected tomorrow`);
    } else {
      const remaining = Math.max(thresholdDays - daysSinceLastWater, 0);
      reasonParts.push(`still within the ${thresholdDays.toFixed(1)} day watering window (${remaining.toFixed(1)} days left)`);
    }
  }

  const reason = formatReason(reasonParts);

  return {
    plantId: plant.id,
    plantName: plant.name || 'Unnamed plant',
    needsWater,
    score: Number(drynessRatio.toFixed(2)),
    daysSinceLastWater: Number(daysSinceLastWater.toFixed(2)),
    thresholdDays: Number(thresholdDays.toFixed(2)),
    lastWaterSource,
    todayRainfall: Number(todayRainfall.toFixed(2)),
    tomorrowRainfall: Number(tomorrowRainfall.toFixed(2)),
    temperatureMax: temperatureMax ?? null,
    humidity,
    reason,
  };
}

export async function evaluateWateringInsights(
  plants: PlantSummary[],
  options?: Partial<EvaluateOptions>
): Promise<WateringInsight[]> {
  if (!plants.length) return [];

  const mergedOptions: EvaluateOptions = {
    lookbackDays: options?.lookbackDays ?? DEFAULT_LOOKBACK_DAYS,
    rainfallThresholdMm: options?.rainfallThresholdMm ?? DEFAULT_RAIN_THRESHOLD_MM,
  };

  const today = startOfDay(new Date());
  const insights: WateringInsight[] = [];

  for (const plant of plants) {
    try {
      const insight = await evaluatePlantWatering(plant, today, mergedOptions);
      if (insight) insights.push(insight);
    } catch (error) {
      logger.error('Failed to evaluate watering insight for plant', { plantId: plant.id, error });
    }
  }

  return insights;
}








