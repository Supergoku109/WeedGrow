import type { Plant, PlantLog, WeatherCacheEntry } from '@/firestoreModels';
import { fetchLogsAndWeatherForRange } from '@/lib/logs/fetchLogsAndWeatherForRange';
import { fetchWeather } from '@/lib/weather/fetchWeather';
import { parseWeatherData } from '@/lib/weather/parseWeatherData';
import {
  assessPowderyMildewRisk,
  type MildewDaySample,
  type MildewRiskAssessment,
  type MildewRiskLevel,
} from '@/lib/weather/powderyMildewRisk';
import { updateWeatherCache } from '@/lib/weather/updateFirestore';
import logger from '@/lib/logger';

// Time + tuning constants for the recommendation heuristic.
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_LOOKBACK_DAYS = 6;
const DEFAULT_RAIN_THRESHOLD_MM = 8; // ~0.3in daily rain can often offset irrigation need.
const LIGHT_RAIN_THRESHOLD_MM = 3; // Below this is usually surface wetting only.
const RECENT_RAIN_WINDOW_DAYS = 3;
const RECENT_RAIN_ACCUMULATION_THRESHOLD_MM = 25; // ~1in over 3 days.
const HOT_TEMP_THRESHOLD = 30;
const VERY_HOT_TEMP_THRESHOLD = 33;
const COOL_TEMP_THRESHOLD = 18;
const COLD_TEMP_THRESHOLD = 15;
const HEAT_STRESS_WARNING_TEMP_THRESHOLD = 32;
const LOW_HUMIDITY_THRESHOLD = 45;
const HIGH_HUMIDITY_THRESHOLD = 75;
const HIGH_WIND_DRYING_THRESHOLD_KPH = 22;
const CLOUDY_THRESHOLD = 70;
const MILDEW_SAMPLE_DAYS = 3;

/**
 * Watering algorithm walkthrough
 *
 * Core flow:
 * 1) Load logs + weather for [today - lookbackDays, tomorrow].
 * 2) Refresh missing today/tomorrow weather from API when coordinates exist.
 * 3) If yesterday weather is missing but today exists, run a conservative Plan B.
 * 4) If today weather is still missing, return a neutral "check manually" insight.
 * 5) Find latest water source from manual watering logs and/or rainfall events.
 * 6) Build adaptive thresholdDays from environment + climate modifiers.
 * 7) needsWater = (daysSinceLastWater / thresholdDays) >= 1, with rain overrides.
 * 8) Generate a human-readable reason string for UI cards.
 *
 * Example paths:
 * - Dry + hot: last water 3d ago, outdoor base 2d, hot/low humidity lowers threshold to ~1.2d -> needsWater=true.
 * - Rain override: no recent manual logs, rain today 4.0mm -> needsWater=false, daysSinceLastWater=0, source=rain.
 * - Missing yesterday: yesterday weather missing, today dry, tomorrow rain 2.0mm -> Plan B usually says skip watering.
 */
export type PlantSummary = Plant & { id: string };
type WaterSource = 'manual' | 'rain' | 'unknown';

export interface WateringInsight {
  plantId: string;
  plantName: string;
  needsWater: boolean;
  score: number;
  daysSinceLastWater: number;
  thresholdDays: number;
  lastWaterSource: WaterSource;
  todayRainfall: number;
  tomorrowRainfall: number;
  temperatureMax: number | null;
  humidity: number | null;
  mildewRiskLevel: MildewRiskLevel;
  mildewShouldWarn: boolean;
  mildewConsecutiveVeryHumidWarmDays: number;
  mildewReasons: string[];
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

interface HistoricalSignals {
  historicalWeatherCount: number;
  historicalLogCount: number;
  lastManualWater: Date | null;
  lastRainDate: Date | null;
  yesterdayWeatherFound: boolean;
}

interface ClimateFlags {
  isVeryHot: boolean;
  isHot: boolean;
  isCoolAndCloudy: boolean;
  isLowHumidity: boolean;
  isHighWind: boolean;
}

const LOW_MILDEW_ASSESSMENT: MildewRiskAssessment = {
  level: 'low',
  shouldWarn: false,
  consecutiveVeryHumidWarmDays: 0,
  reasons: [],
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

// Returns local YYYY-MM-DD (not UTC), used for cache keys and comparisons.
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(date: Date): string {
  return getLocalDateString(date);
}

function getBaseThreshold(environment: Plant['environment'] | undefined): number {
  if (environment === 'indoor') return 3;
  if (environment === 'greenhouse') return 2.5;
  return 2; // outdoor or unspecified
}

function formatDaysSince(days: number, source: WaterSource): string {
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

function hasValidCoordinates(plant: PlantSummary): plant is PlantSummary & {
  location: { lat: number; lng: number };
} {
  return typeof plant.location?.lat === 'number' && typeof plant.location?.lng === 'number';
}

function getRainfall(weather: WeatherCacheEntry | null | undefined): number {
  return typeof weather?.rainfall === 'number' ? weather.rainfall : 0;
}

function getRecentRainfallTotal(
  range: Record<string, RangeEntry>,
  today: Date,
  days = RECENT_RAIN_WINDOW_DAYS,
): number {
  let total = 0;
  const safeDays = Math.max(days, 1);

  for (let offset = 0; offset < safeDays; offset += 1) {
    const key = formatDate(addDays(today, -offset));
    total += getRainfall(range[key]?.weather);
  }

  return total;
}

function getTemperatureMax(weather: WeatherCacheEntry | null | undefined): number | null {
  if (!weather) return null;
  if (typeof weather.detailedTemps?.max === 'number') return weather.detailedTemps.max;
  return typeof weather.temperature === 'number' ? weather.temperature : null;
}

function getHumidity(weather: WeatherCacheEntry | null | undefined): number | null {
  return typeof weather?.humidity === 'number' ? weather.humidity : null;
}

function getWindSpeed(weather: WeatherCacheEntry | null | undefined): number | null {
  return typeof weather?.windSpeed === 'number' ? weather.windSpeed : null;
}

function getDewPoint(weather: WeatherCacheEntry | null | undefined): number | null {
  return typeof weather?.dewPoint === 'number' ? weather.dewPoint : null;
}

function getNightTemperature(weather: WeatherCacheEntry | null | undefined): number | undefined {
  return typeof weather?.detailedTemps?.night === 'number' ? weather.detailedTemps.night : undefined;
}

function getCloudCoverage(weather: WeatherCacheEntry | null | undefined): number | null {
  return typeof weather?.cloudCoverage === 'number' ? weather.cloudCoverage : null;
}

function getNightHumidity(weather: WeatherCacheEntry | null | undefined): number | undefined {
  const value = (weather as any)?.nightHumidity;
  return typeof value === 'number' ? value : undefined;
}

function buildMildewSamples(
  range: Record<string, RangeEntry>,
  today: Date,
  sampleDays = MILDEW_SAMPLE_DAYS,
): MildewDaySample[] {
  const safeSampleDays = Math.max(sampleDays, 1);
  const samples: MildewDaySample[] = [];

  for (let dayOffset = safeSampleDays - 1; dayOffset >= 0; dayOffset -= 1) {
    const key = formatDate(addDays(today, -dayOffset));
    const weather = range[key]?.weather;
    const dayHumidity = getHumidity(weather);
    const dayTemperatureC = getTemperatureMax(weather);

    if (dayHumidity === null || dayTemperatureC === null) continue;

    const nightHumidity = getNightHumidity(weather);
    const windSpeedKph = getWindSpeed(weather);
    const dewPointC = getDewPoint(weather);
    const nightTemperatureC = getNightTemperature(weather);
    const sample: MildewDaySample = { dayHumidity, dayTemperatureC };

    if (typeof nightHumidity === 'number') sample.nightHumidity = nightHumidity;
    if (typeof windSpeedKph === 'number') sample.windSpeedKph = windSpeedKph;
    if (typeof dewPointC === 'number') sample.dewPointC = dewPointC;
    if (typeof nightTemperatureC === 'number') sample.nightTemperatureC = nightTemperatureC;

    samples.push(sample);
  }

  return samples;
}

function assessMildewFromRange(range: Record<string, RangeEntry>, today: Date): MildewRiskAssessment {
  const samples = buildMildewSamples(range, today);
  if (!samples.length) return LOW_MILDEW_ASSESSMENT;
  return assessPowderyMildewRisk(samples);
}

function assessMildewFromTodayWeather(
  todayWeather: WeatherCacheEntry | null,
): MildewRiskAssessment {
  if (!todayWeather) return LOW_MILDEW_ASSESSMENT;
  const dayHumidity = getHumidity(todayWeather);
  const dayTemperatureC = getTemperatureMax(todayWeather);

  if (dayHumidity === null || dayTemperatureC === null) {
    return LOW_MILDEW_ASSESSMENT;
  }

  const nightHumidity = getNightHumidity(todayWeather);
  const windSpeedKph = getWindSpeed(todayWeather);
  const dewPointC = getDewPoint(todayWeather);
  const nightTemperatureC = getNightTemperature(todayWeather);
  const sample: MildewDaySample = { dayHumidity, dayTemperatureC };
  if (typeof nightHumidity === 'number') sample.nightHumidity = nightHumidity;
  if (typeof windSpeedKph === 'number') sample.windSpeedKph = windSpeedKph;
  if (typeof dewPointC === 'number') sample.dewPointC = dewPointC;
  if (typeof nightTemperatureC === 'number') sample.nightTemperatureC = nightTemperatureC;
  const samples: MildewDaySample[] = [sample];

  return assessPowderyMildewRisk(samples);
}

function buildMildewReasonSuffix(assessment: MildewRiskAssessment): string | null {
  if (assessment.level === 'low') return null;

  if (assessment.level === 'watch') {
    return 'Mildew watch: humidity is entering the risk range, so monitor leaves closely.';
  }

  const levelLabel = assessment.level === 'very_high' ? 'very high' : 'high';
  const parts = [`Powdery mildew risk is ${levelLabel}`];

  if (assessment.consecutiveVeryHumidWarmDays >= 2) {
    parts.push(
      `${assessment.consecutiveVeryHumidWarmDays} humid warm day(s) in a row are increasing pressure`,
    );
  }

  if (assessment.reasons.some((reason) => reason.includes('Humid nights'))) {
    parts.push('humid nights with warm days are amplifying risk');
  }

  parts.push('avoid wetting leaves and improve airflow');
  return `${parts.join('; ')}.`;
}

function appendMildewReason(baseReason: string, assessment: MildewRiskAssessment): string {
  const mildewSuffix = buildMildewReasonSuffix(assessment);
  if (!mildewSuffix) return baseReason;
  return `${baseReason} ${mildewSuffix}`;
}

function extractLastWaterEvent(
  lastManualWater: Date | null,
  lastRainDate: Date | null,
): { lastWaterDay: Date | null; lastWaterSource: WaterSource } {
  const manualEventDay = lastManualWater ? startOfDay(lastManualWater) : null;
  const rainEventDay = lastRainDate ? startOfDay(lastRainDate) : null;
  let lastWaterSource: WaterSource = 'unknown';
  let lastWaterDay: Date | null = null;

  if (manualEventDay && (!rainEventDay || manualEventDay >= rainEventDay)) {
    lastWaterDay = manualEventDay;
    lastWaterSource = 'manual';
  } else if (rainEventDay) {
    lastWaterDay = rainEventDay;
    lastWaterSource = 'rain';
  }

  return { lastWaterDay, lastWaterSource };
}

function getPlantAgeDays(plant: PlantSummary, startOfToday: Date): number | null {
  const createdAtTimestamp = (plant as any)?.createdAt;
  const createdAtDate =
    typeof createdAtTimestamp?.toDate === 'function' ? createdAtTimestamp.toDate() : null;

  if (!createdAtDate) return null;

  const createdStart = startOfDay(createdAtDate);
  const ageDays = (startOfToday.getTime() - createdStart.getTime()) / MS_PER_DAY;
  return ageDays < 0 ? 0 : ageDays;
}

function resolveDaysSinceLastWater(
  lastWaterDay: Date | null,
  noHistoryAvailable: boolean,
  plantAgeDays: number | null,
  lookbackDays: number,
  today: Date,
): number {
  let daysSinceLastWater: number;

  if (lastWaterDay) {
    daysSinceLastWater = (today.getTime() - lastWaterDay.getTime()) / MS_PER_DAY;
  } else if (noHistoryAvailable) {
    const assumedDays = Math.max(1, plantAgeDays ?? 1);
    daysSinceLastWater = assumedDays;
  } else {
    daysSinceLastWater = lookbackDays + 1;
  }

  if (!Number.isFinite(daysSinceLastWater)) {
    return lookbackDays + 1;
  }
  if (daysSinceLastWater < 0) return 0;
  return daysSinceLastWater;
}

function buildClimateFlags(
  temperatureMax: number | null,
  humidity: number | null,
  cloudCoverage: number | null,
  windSpeed: number | null,
): ClimateFlags {
  const isVeryHot = typeof temperatureMax === 'number' && temperatureMax >= VERY_HOT_TEMP_THRESHOLD;
  const isHot = typeof temperatureMax === 'number' && temperatureMax >= HOT_TEMP_THRESHOLD;
  const isCoolAndCloudy =
    typeof temperatureMax === 'number' &&
    typeof cloudCoverage === 'number' &&
    temperatureMax <= COOL_TEMP_THRESHOLD &&
    cloudCoverage >= CLOUDY_THRESHOLD;
  const isLowHumidity = typeof humidity === 'number' && humidity <= LOW_HUMIDITY_THRESHOLD;
  const isHighWind = typeof windSpeed === 'number' && windSpeed >= HIGH_WIND_DRYING_THRESHOLD_KPH;

  return { isVeryHot, isHot, isCoolAndCloudy, isLowHumidity, isHighWind };
}

function calculateThresholdDays(
  environment: Plant['environment'] | undefined,
  climate: ClimateFlags,
  tomorrowRainfall: number,
  rainfallThresholdMm: number,
): number {
  let thresholdDays = getBaseThreshold(environment);

  if (climate.isVeryHot) thresholdDays -= 0.75;
  else if (climate.isHot) thresholdDays -= 0.5;

  if (climate.isLowHumidity) thresholdDays -= 0.3;
  if (climate.isHighWind) thresholdDays -= 0.2;
  if (climate.isCoolAndCloudy) thresholdDays += 0.5;
  if (tomorrowRainfall >= rainfallThresholdMm) thresholdDays += 0.5;

  if (thresholdDays < 1) return 1;
  if (thresholdDays > 4) return 4;
  return thresholdDays;
}

function collectHistoricalSignals(
  range: Record<string, RangeEntry>,
  yesterdayKey: string,
  startOfToday: Date,
  endOfToday: Date,
  rainfallThresholdMm: number,
): HistoricalSignals {
  let historicalWeatherCount = 0;
  let historicalLogCount = 0;
  let lastManualWater: Date | null = null;
  let lastRainDate: Date | null = null;
  let yesterdayWeatherFound = false;

  Object.entries(range).forEach(([dateKey, entry]) => {
    const dayDate = startOfDay(new Date(`${dateKey}T00:00:00`));
    if (dateKey === yesterdayKey && entry.weather) yesterdayWeatherFound = true;
    if (dayDate >= endOfToday) return;

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
      if (ts >= endOfToday) return;
      if (!lastManualWater || ts > lastManualWater) {
        lastManualWater = ts;
      }
    });

    const rainfall = getRainfall(entry.weather);
    if (rainfall >= rainfallThresholdMm) {
      if (!lastRainDate || dayDate > lastRainDate) {
        lastRainDate = dayDate;
      }
    }
  });

  return {
    historicalWeatherCount,
    historicalLogCount,
    lastManualWater,
    lastRainDate,
    yesterdayWeatherFound,
  };
}

function buildReason(params: {
  lastWaterDay: Date | null;
  daysSinceLastWater: number;
  lastWaterSource: WaterSource;
  noHistoryAvailable: boolean;
  yesterdayMissing: boolean;
  plantAgeDays: number | null;
  needsWater: boolean;
  climate: ClimateFlags;
  humidity: number | null;
  thresholdDays: number;
  todayRainfall: number;
  tomorrowRainfall: number;
  recentRainfallTotalMm: number;
  recentRainfallThresholdMm: number;
  rainfallThresholdMm: number;
  lightRainThresholdMm: number;
  temperatureMax: number | null;
}): string {
  const reasonParts: string[] = [];
  const {
    lastWaterDay,
    daysSinceLastWater,
    lastWaterSource,
    noHistoryAvailable,
    yesterdayMissing,
    plantAgeDays,
    needsWater,
    climate,
    humidity,
    thresholdDays,
    todayRainfall,
    tomorrowRainfall,
    recentRainfallTotalMm,
    recentRainfallThresholdMm,
    rainfallThresholdMm,
    lightRainThresholdMm,
    temperatureMax,
  } = params;

  if (lastWaterDay) {
    reasonParts.push(`${formatDaysSince(daysSinceLastWater, lastWaterSource)}`);
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
    if (todayRainfall >= lightRainThresholdMm && todayRainfall < rainfallThresholdMm) {
      reasonParts.push(`only light rain (${todayRainfall.toFixed(1)}mm) today`);
    }
    if (climate.isVeryHot || climate.isHot) {
      reasonParts.push(`forecast high of ${Math.round(temperatureMax ?? HOT_TEMP_THRESHOLD)} degC`);
    }
    if (climate.isLowHumidity && typeof humidity === 'number') {
      reasonParts.push(`humidity near ${Math.round(humidity)}%`);
    }
    if (climate.isHighWind) {
      reasonParts.push('strong winds are increasing drying');
    }
    if (!climate.isVeryHot && !climate.isHot && !climate.isLowHumidity) {
      reasonParts.push(`now beyond the ${thresholdDays.toFixed(1)} day watering window`);
    }
  } else {
    if (todayRainfall >= rainfallThresholdMm) {
      reasonParts.push(`received about ${todayRainfall.toFixed(1)}mm of rain today`);
      if (todayRainfall >= rainfallThresholdMm * 2) {
        reasonParts.push(
          `heavy rain likely soaked the root zone; skip watering for about ${Math.max(Math.round(thresholdDays), 1)} day(s)`,
        );
      }
    } else if (recentRainfallTotalMm >= recentRainfallThresholdMm) {
      reasonParts.push(
        `recent rainfall totaled ~${recentRainfallTotalMm.toFixed(1)}mm over the last ${RECENT_RAIN_WINDOW_DAYS} days`,
      );
    } else if (tomorrowRainfall >= rainfallThresholdMm) {
      reasonParts.push(`rain (~${tomorrowRainfall.toFixed(1)}mm) expected tomorrow`);
    } else {
      const remaining = Math.max(thresholdDays - daysSinceLastWater, 0);
      reasonParts.push(
        `still within the ${thresholdDays.toFixed(1)} day watering window (${remaining.toFixed(1)} days left)`,
      );
    }
  }

  const isHeatStressDay =
    typeof temperatureMax === 'number' && temperatureMax >= HEAT_STRESS_WARNING_TEMP_THRESHOLD;
  if (isHeatStressDay) {
    if (needsWater) {
      reasonParts.push('heat stress risk today - water early morning and check for wilting');
    } else {
      reasonParts.push('heat stress watch - monitor wilting and consider temporary shade');
    }
  }

  const isCoolDay = typeof temperatureMax === 'number' && temperatureMax < COLD_TEMP_THRESHOLD;
  const isHumidDay = typeof humidity === 'number' && humidity >= HIGH_HUMIDITY_THRESHOLD;
  const hasRecentWetPattern =
    todayRainfall >= lightRainThresholdMm || recentRainfallTotalMm >= rainfallThresholdMm;
  if (isCoolDay && isHumidDay && hasRecentWetPattern && !needsWater) {
    reasonParts.push('cool and wet pattern raises root rot risk; avoid overwatering');
  } else if (isCoolDay && !hasRecentWetPattern && needsWater) {
    reasonParts.push('cool weather caution: water lightly and avoid leaving roots soggy');
  }

  return formatReason(reasonParts);
}

function buildPlanBInsight(
  plant: PlantSummary,
  todayWeather: WeatherCacheEntry,
  tomorrowWeather: WeatherCacheEntry | null,
  options: EvaluateOptions,
): WateringInsight {
  const todayRainfall = getRainfall(todayWeather);
  const tomorrowRainfall = getRainfall(tomorrowWeather);
  const temperatureMax = getTemperatureMax(todayWeather);
  const humidity = getHumidity(todayWeather);
  let needsWater = true;
  const planBReason: string[] = [];
  const hasSignificantRainSoon =
    todayRainfall >= options.rainfallThresholdMm || tomorrowRainfall >= options.rainfallThresholdMm;

  // Plan B is intentionally conservative when yesterday's weather is missing.
  if (hasSignificantRainSoon) {
    needsWater = false;
    if (todayRainfall >= options.rainfallThresholdMm) {
      planBReason.push(`It rained today (${todayRainfall.toFixed(1)}mm)`);
    }
    if (tomorrowRainfall >= options.rainfallThresholdMm) {
      planBReason.push(`Rain expected tomorrow (${tomorrowRainfall.toFixed(1)}mm)`);
    }
    planBReason.push('No watering needed.');
  } else {
    planBReason.push('No significant rain today or tomorrow.');
    if (todayRainfall >= LIGHT_RAIN_THRESHOLD_MM) {
      planBReason.push(`Only light rain fell today (${todayRainfall.toFixed(1)}mm).`);
    }
    if (typeof temperatureMax === 'number') {
      planBReason.push(`Forecast is sunny/hot (high of ${Math.round(temperatureMax)}°C)`);
    }
    planBReason.push('Watering is recommended.');
  }

  if (typeof temperatureMax === 'number' && temperatureMax >= HEAT_STRESS_WARNING_TEMP_THRESHOLD) {
    if (needsWater) {
      planBReason.push('Heat stress risk today: water early and check for wilting.');
    } else {
      planBReason.push('Heat stress watch: monitor wilting and provide temporary shade.');
    }
  }

  if (
    typeof temperatureMax === 'number' &&
    temperatureMax < COLD_TEMP_THRESHOLD &&
    typeof humidity === 'number' &&
    humidity >= HIGH_HUMIDITY_THRESHOLD &&
    (todayRainfall >= LIGHT_RAIN_THRESHOLD_MM || tomorrowRainfall >= options.rainfallThresholdMm) &&
    !needsWater
  ) {
    planBReason.push('Cool wet conditions increase root rot risk - avoid overwatering.');
  }

  const mildew = assessMildewFromTodayWeather(todayWeather);
  const baseReason = `Yesterday’s weather data unavailable – assuming no water was received. ${planBReason.join(' ')} Using current and forecast data only.`;

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
    mildewRiskLevel: mildew.level,
    mildewShouldWarn: mildew.shouldWarn,
    mildewConsecutiveVeryHumidWarmDays: mildew.consecutiveVeryHumidWarmDays,
    mildewReasons: mildew.reasons,
    reason: appendMildewReason(baseReason, mildew),
  };
}

async function refreshWeatherIfMissing(
  plant: PlantSummary,
  range: Record<string, RangeEntry>,
  targetDates: string[]
): Promise<Record<string, RangeEntry>> {
  if (!hasValidCoordinates(plant)) {
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
  // Phase 0: ignore non-active plants.
  // Early exit: archived/harvested/dead plants are not part of daily watering guidance.
  if (plant.status && plant.status !== 'active') return null;

  // Phase 1: load logs + weather window [today - lookback, tomorrow].
  const startDate = formatDate(addDays(today, -options.lookbackDays));
  const endDate = formatDate(addDays(today, 1));

  let range: Record<string, RangeEntry>;
  try {
    range = await fetchLogsAndWeatherForRange(plant.id, startDate, endDate);
  } catch (error) {
    logger.error('Failed to fetch logs/weather for plant', { plantId: plant.id, error });
    // Early exit: without logs/weather we cannot compute a safe recommendation.
    return null;
  }

  const todayKey = formatDate(today);
  const tomorrowKey = formatDate(addDays(today, 1));
  const yesterdayKey = formatDate(addDays(today, -1));
  const targetDates = [todayKey, tomorrowKey];

  // Phase 2: fill missing today/tomorrow weather from API cache refresh.
  range = await refreshWeatherIfMissing(plant, range, targetDates);

  const todayWeather = range[todayKey]?.weather ?? null;
  const tomorrowWeather = range[tomorrowKey]?.weather ?? null;

  // Phase 3: if yesterday is missing but today exists, use a simpler fallback.
  if (todayWeather && !range[yesterdayKey]?.weather) {
    // Early exit: Plan B favors conservative guidance when continuity is broken.
    return buildPlanBInsight(plant, todayWeather, tomorrowWeather, options);
  }

  // Phase 4: if we still do not have today's weather, return a neutral insight.
  if (!todayWeather) {
    logger.warn("Missing today's weather data for plant after fallback", { plantId: plant.id, todayKey });
    // Early exit: neutral/manual-check state avoids false confidence while cache syncs.
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
      mildewRiskLevel: 'low',
      mildewShouldWarn: false,
      mildewConsecutiveVeryHumidWarmDays: 0,
      mildewReasons: [],
      reason: 'Weather data is still syncing. Check soil moisture manually today.',
    };
  }

  const todayRainfall = getRainfall(todayWeather);
  const tomorrowRainfall = getRainfall(tomorrowWeather);
  const recentRainfallTotalMm = getRecentRainfallTotal(range, today, RECENT_RAIN_WINDOW_DAYS);
  const hasSaturatingRecentRain =
    recentRainfallTotalMm >= RECENT_RAIN_ACCUMULATION_THRESHOLD_MM;
  const temperatureMax = getTemperatureMax(todayWeather);
  const humidity = getHumidity(todayWeather);
  const windSpeed = getWindSpeed(todayWeather);
  const cloudCoverage = getCloudCoverage(todayWeather);

  // Phase 5: inspect historical logs/weather to find the latest water source.
  const endOfToday = addDays(today, 1);
  const startOfToday = startOfDay(today);
  const history = collectHistoricalSignals(
    range,
    yesterdayKey,
    startOfToday,
    endOfToday,
    options.rainfallThresholdMm,
  );

  const hasHistoricalWeather = history.historicalWeatherCount > 0;
  const hasHistoricalLogs = history.historicalLogCount > 0;
  const noHistoryAvailable = !hasHistoricalWeather && !hasHistoricalLogs;
  const yesterdayMissing = !history.yesterdayWeatherFound;

  const { lastWaterDay, lastWaterSource: initialWaterSource } = extractLastWaterEvent(
    history.lastManualWater,
    history.lastRainDate,
  );
  let lastWaterSource: WaterSource = initialWaterSource;

  // Phase 6: estimate dryness window and whether watering is due.
  const plantAgeDays = getPlantAgeDays(plant, startOfToday);
  let daysSinceLastWater = resolveDaysSinceLastWater(
    lastWaterDay,
    noHistoryAvailable,
    plantAgeDays,
    options.lookbackDays,
    today,
  );

  const climate = buildClimateFlags(temperatureMax, humidity, cloudCoverage, windSpeed);
  const thresholdDays = calculateThresholdDays(
    plant.environment,
    climate,
    tomorrowRainfall,
    options.rainfallThresholdMm,
  );

  const drynessRatio = daysSinceLastWater / thresholdDays;
  let needsWater = drynessRatio >= 1;

  // Rain today/tomorrow can suppress manual watering need.
  if (todayRainfall >= options.rainfallThresholdMm || hasSaturatingRecentRain) {
    needsWater = false;
    lastWaterSource = 'rain';
    daysSinceLastWater = 0;
  } else if (todayRainfall >= LIGHT_RAIN_THRESHOLD_MM) {
    // Light rain can slightly delay dryness but does not fully replace watering.
    daysSinceLastWater = Math.max(daysSinceLastWater - 0.35, 0);
    needsWater = daysSinceLastWater / thresholdDays >= 1;
  }

  if (tomorrowRainfall >= options.rainfallThresholdMm && daysSinceLastWater < thresholdDays + 0.5) {
    needsWater = false;
  }

  // Phase 7: produce a human-readable explanation.
  const reason = buildReason({
    lastWaterDay,
    daysSinceLastWater,
    lastWaterSource,
    noHistoryAvailable,
    yesterdayMissing,
    plantAgeDays,
    needsWater,
    climate,
    humidity,
    thresholdDays,
    todayRainfall,
    tomorrowRainfall,
    recentRainfallTotalMm,
    recentRainfallThresholdMm: RECENT_RAIN_ACCUMULATION_THRESHOLD_MM,
    rainfallThresholdMm: options.rainfallThresholdMm,
    lightRainThresholdMm: LIGHT_RAIN_THRESHOLD_MM,
    temperatureMax,
  });
  const mildew = assessMildewFromRange(range, today);
  const reasonWithMildew = appendMildewReason(reason, mildew);

  // Final return: fully evaluated insight using historical logs, weather, and modifiers.
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
    mildewRiskLevel: mildew.level,
    mildewShouldWarn: mildew.shouldWarn,
    mildewConsecutiveVeryHumidWarmDays: mildew.consecutiveVeryHumidWarmDays,
    mildewReasons: mildew.reasons,
    reason: reasonWithMildew,
  };
}

/**
 * Evaluates watering insight for each plant.
 * Runs sequentially to avoid flooding the weather/cache services.
 */
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
