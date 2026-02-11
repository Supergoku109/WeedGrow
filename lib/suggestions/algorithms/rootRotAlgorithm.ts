import type { SuggestionAlgorithmContext, SuggestionCard, SuggestionConfidence, SuggestionSeverity } from '@/lib/suggestions/types';

const ALGORITHM_VERSION = 'root-rot-v1';
const COOL_TEMP_THRESHOLD_C = 15;
const HUMIDITY_HIGH_THRESHOLD = 75;
const LIGHT_RAIN_THRESHOLD_MM = 3;
const SIGNIFICANT_RAIN_THRESHOLD_MM = 8;
const SATURATING_RAIN_THRESHOLD_MM = 16;
const HIGH_CLOUD_COVERAGE_THRESHOLD = 80;
const LOW_UV_INDEX_THRESHOLD = 2;

function sentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/[.!?]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
}

function resolveSeverityFromScore(score: number): SuggestionSeverity {
  if (score >= 5) return 'critical';
  if (score >= 3) return 'warn';
  if (score >= 2) return 'watch';
  return 'info';
}

function resolveSummary(severity: SuggestionSeverity): string {
  if (severity === 'critical') {
    return 'High root rot risk today. Avoid watering and improve drainage if possible.';
  }
  if (severity === 'warn') {
    return 'Root rot risk is elevated. Let the root zone dry before watering again.';
  }
  if (severity === 'watch') {
    return 'Root rot watch. Be conservative with watering today.';
  }
  return 'No meaningful root rot signal right now.';
}

function resolveTitle(severity: SuggestionSeverity): string {
  if (severity === 'critical') return 'Critical root rot risk';
  if (severity === 'warn') return 'Elevated root rot risk';
  if (severity === 'watch') return 'Root rot watch';
  return 'Root rot low risk';
}

function resolveConfidence(context: SuggestionAlgorithmContext): SuggestionConfidence {
  const { insight } = context;
  const evidenceCount = [
    typeof insight.temperatureMax === 'number',
    typeof insight.humidity === 'number',
    Number.isFinite(insight.todayRainfall),
    Number.isFinite(insight.daysSinceLastWater),
  ].filter(Boolean).length;

  if (evidenceCount >= 4) return 'high';
  if (evidenceCount >= 2) return 'medium';
  return 'low';
}

export function evaluateRootRotAlgorithm(context: SuggestionAlgorithmContext): SuggestionCard {
  const { insight } = context;
  let score = 0;
  const reasons: string[] = [];
  const weatherSummaryLower = (insight.weatherSummary ?? '').toLowerCase();
  const effectiveTodayRainMm = insight.todayRainObserved
    ? insight.todayRainfall
    : (
      insight.forecastedToday
        ? insight.todayRainfall * (
          typeof insight.precipitationProbability === 'number'
            ? Math.max(Math.min(insight.precipitationProbability, 1), 0)
            : 0.35
        )
        : insight.todayRainfall
    );
  const effectiveTomorrowRainMm = insight.forecastedTomorrow
    ? insight.tomorrowRainfall * (
      typeof insight.tomorrowPrecipitationProbability === 'number'
        ? Math.max(Math.min(insight.tomorrowPrecipitationProbability, 1), 0)
        : 0.35
    )
    : insight.tomorrowRainfall;

  if (!insight.needsWater) {
    score += 1;
    reasons.push('Plant is currently within its watering window.');
  }

  if (effectiveTodayRainMm >= LIGHT_RAIN_THRESHOLD_MM) {
    score += 1;
    reasons.push(`Effective rainfall is ~${effectiveTodayRainMm.toFixed(1)}mm today.`);
  }

  if (
    effectiveTodayRainMm >= SIGNIFICANT_RAIN_THRESHOLD_MM
    || effectiveTomorrowRainMm >= SIGNIFICANT_RAIN_THRESHOLD_MM
  ) {
    score += 1;
    reasons.push('Significant rain is present in the 24-48h window.');
  }

  if (effectiveTodayRainMm >= SATURATING_RAIN_THRESHOLD_MM) {
    score += 1;
    reasons.push('Heavy rain likely saturated the root zone.');
  }
  if (
    typeof insight.precipitationProbability === 'number'
    && insight.precipitationProbability >= 0.65
  ) {
    score += 1;
    reasons.push(`Rain probability is high today (${Math.round(insight.precipitationProbability * 100)}%).`);
  }
  if (typeof insight.cloudCoverage === 'number' && insight.cloudCoverage >= HIGH_CLOUD_COVERAGE_THRESHOLD) {
    score += 1;
    reasons.push(`Cloud coverage is high (${Math.round(insight.cloudCoverage)}%), slowing dry-back.`);
  }

  if (typeof insight.humidity === 'number' && insight.humidity >= HUMIDITY_HIGH_THRESHOLD) {
    score += 1;
    reasons.push(`Humidity is high (${Math.round(insight.humidity)}%).`);
  }

  if (typeof insight.temperatureMax === 'number' && insight.temperatureMax < COOL_TEMP_THRESHOLD_C) {
    score += 1;
    reasons.push(`Cool temperature (${Math.round(insight.temperatureMax)}C) slows soil drying.`);
  }
  if (
    typeof insight.dewPoint === 'number'
    && typeof insight.temperatureNight === 'number'
    && Math.abs(insight.temperatureNight - insight.dewPoint) <= 2
  ) {
    score += 1;
    reasons.push('Night dew-point spread suggests condensation and persistent moisture.');
  }
  if (typeof insight.uvIndex === 'number' && insight.uvIndex <= LOW_UV_INDEX_THRESHOLD) {
    score += 1;
    reasons.push(`Low UV index (${insight.uvIndex.toFixed(1)}) means weaker daytime drying.`);
  }
  if (typeof insight.dayLengthHours === 'number' && insight.dayLengthHours <= 10) {
    score += 1;
    reasons.push(`Short daylight (${insight.dayLengthHours.toFixed(1)}h) slows evaporation.`);
  }
  if (typeof insight.windSpeed === 'number' && insight.windSpeed >= 18) {
    score -= 1;
    reasons.push(`Moderate wind (~${Math.round(insight.windSpeed)} km/h) improves dry-back.`);
  }
  if (typeof insight.windGust === 'number' && insight.windGust >= 30) {
    score -= 1;
    reasons.push(`Strong gusts (~${Math.round(insight.windGust)} km/h) increase canopy drying.`);
  }
  if (typeof insight.uvIndex === 'number' && insight.uvIndex >= 8) {
    score -= 1;
    reasons.push(`Higher UV (${insight.uvIndex.toFixed(1)}) supports faster surface drying.`);
  }
  if (typeof insight.dayLengthHours === 'number' && insight.dayLengthHours >= 13) {
    score -= 1;
    reasons.push(`Long daylight (${insight.dayLengthHours.toFixed(1)}h) increases evaporation time.`);
  }
  if (
    weatherSummaryLower.includes('rain')
    || weatherSummaryLower.includes('drizzle')
    || weatherSummaryLower.includes('mist')
    || weatherSummaryLower.includes('fog')
    || weatherSummaryLower.includes('shower')
  ) {
    score += 1;
    reasons.push(`Weather pattern is moisture-heavy (${insight.weatherSummary ?? 'wet conditions'}).`);
  }

  if (insight.lastWaterSource === 'rain' && insight.daysSinceLastWater <= 1.5) {
    score += 1;
    reasons.push('The most recent watering source was rain in the last ~1.5 days.');
  }

  if (/root rot risk/i.test(insight.reason)) {
    score = Math.max(score, 3);
    reasons.push('Cool + wet signal already detected by core watering heuristics.');
  }
  if (insight.hasSaturatingRecentRain) {
    score += 2;
    reasons.push(`Recent cumulative rain is saturating (~${insight.recentRainfallTotalMm.toFixed(1)}mm).`);
  }

  if (score < 0) score = 0;

  const severity = resolveSeverityFromScore(score);
  const shouldShow = !insight.needsWater && severity !== 'info';

  return {
    id: `${insight.plantId}:rootRot`,
    kind: 'rootRot',
    active: shouldShow,
    severity,
    title: resolveTitle(severity),
    summary: resolveSummary(severity),
    reasons: reasons.map((reason) => sentenceCase(reason)).slice(0, 3),
    metrics: {
      todayRainfallMm: insight.todayRainfall,
      tomorrowRainfallMm: insight.tomorrowRainfall,
      effectiveTodayRainMm: Number(effectiveTodayRainMm.toFixed(2)),
      effectiveTomorrowRainMm: Number(effectiveTomorrowRainMm.toFixed(2)),
      todayRainObserved: insight.todayRainObserved,
      recentRainfallTotalMm: insight.recentRainfallTotalMm,
      hasSaturatingRecentRain: insight.hasSaturatingRecentRain,
      humidity: insight.humidity,
      temperatureMaxC: insight.temperatureMax,
      temperatureNightC: insight.temperatureNight,
      dewPointC: insight.dewPoint,
      cloudCoverage: insight.cloudCoverage,
      windSpeedKph: insight.windSpeed,
      windGustKph: insight.windGust,
      uvIndex: insight.uvIndex,
      dayLengthHours: insight.dayLengthHours,
      precipitationProbability: insight.precipitationProbability,
      tomorrowPrecipitationProbability: insight.tomorrowPrecipitationProbability,
      daysSinceLastWater: insight.daysSinceLastWater,
      thresholdDays: insight.thresholdDays,
      lastWaterSource: insight.lastWaterSource,
    },
    confidence: resolveConfidence(context),
    algorithmVersion: ALGORITHM_VERSION,
  };
}
