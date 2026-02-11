import type { MildewRiskLevel } from '@/lib/weather/powderyMildewRisk';
import type { SuggestionAlgorithmContext, SuggestionCard, SuggestionConfidence, SuggestionSeverity } from '@/lib/suggestions/types';

const ALGORITHM_VERSION = 'powdery-mildew-v1';

function sentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/[.!?]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
}

function severityToNumber(severity: SuggestionSeverity): number {
  if (severity === 'critical') return 3;
  if (severity === 'warn') return 2;
  if (severity === 'watch') return 1;
  return 0;
}

function numberToSeverity(value: number): SuggestionSeverity {
  if (value >= 3) return 'critical';
  if (value >= 2) return 'warn';
  if (value >= 1) return 'watch';
  return 'info';
}

function severityFromMildewLevel(level: MildewRiskLevel): SuggestionSeverity {
  if (level === 'very_high') return 'critical';
  if (level === 'high') return 'warn';
  if (level === 'watch') return 'watch';
  return 'info';
}

function titleFromSeverity(severity: SuggestionSeverity): string {
  if (severity === 'critical') return 'Very high powdery mildew risk';
  if (severity === 'warn') return 'High powdery mildew risk';
  if (severity === 'watch') return 'Powdery mildew watch';
  return 'Low powdery mildew risk';
}

function summaryFromSeverity(severity: SuggestionSeverity): string {
  if (severity === 'critical') return 'Conditions strongly favor powdery mildew today.';
  if (severity === 'warn') return 'Conditions are favorable for powdery mildew.';
  if (severity === 'watch') return 'Mildew pressure is rising, monitor leaves closely.';
  return 'Powdery mildew pressure is currently low.';
}

function confidenceForMildew(context: SuggestionAlgorithmContext): SuggestionConfidence {
  const { insight } = context;
  const evidenceCount = [
    insight.mildewReasons.length > 0,
    typeof insight.temperatureMax === 'number',
    typeof insight.humidity === 'number',
  ].filter(Boolean).length;

  if (evidenceCount >= 3) return 'high';
  if (evidenceCount >= 2) return 'medium';
  return 'low';
}

export function evaluatePowderyMildewAlgorithm(context: SuggestionAlgorithmContext): SuggestionCard {
  const { insight } = context;
  let severityScore = severityToNumber(severityFromMildewLevel(insight.mildewRiskLevel));
  const summaryLower = (insight.weatherSummary ?? '').toLowerCase();

  if (summaryLower.includes('mist') || summaryLower.includes('fog') || summaryLower.includes('drizzle')) {
    severityScore += 1;
  }
  if (
    typeof insight.tomorrowPrecipitationProbability === 'number'
    && insight.tomorrowPrecipitationProbability >= 0.7
    && typeof insight.humidity === 'number'
    && insight.humidity >= 60
  ) {
    severityScore += 1;
  }
  if (
    typeof insight.dewPoint === 'number'
    && typeof insight.temperatureNight === 'number'
    && Math.abs(insight.temperatureNight - insight.dewPoint) <= 2
  ) {
    severityScore += 1;
  }
  if (
    typeof insight.cloudCoverage === 'number'
    && insight.cloudCoverage >= 80
    && typeof insight.humidity === 'number'
    && insight.humidity >= 65
  ) {
    severityScore += 1;
  }
  if (typeof insight.windSpeed === 'number' && insight.windSpeed <= 5) {
    severityScore += 1;
  }
  if (typeof insight.windSpeed === 'number' && insight.windSpeed >= 20) {
    severityScore -= 1;
  }
  if (typeof insight.windGust === 'number' && insight.windGust >= 30) {
    severityScore -= 1;
  }
  if (typeof insight.uvIndex === 'number' && insight.uvIndex >= 10) {
    severityScore -= 1;
  }
  if (
    insight.forecastedToday
    && typeof insight.precipitationProbability === 'number'
    && insight.precipitationProbability < 0.4
    && !summaryLower.includes('mist')
    && !summaryLower.includes('fog')
    && !summaryLower.includes('drizzle')
  ) {
    severityScore -= 1;
  }
  if (severityScore < 0) severityScore = 0;
  if (severityScore > 3) severityScore = 3;
  const severity = numberToSeverity(severityScore);

  const reasons = insight.mildewReasons
    .map((reason) => sentenceCase(reason))
    .filter((reason) => reason.length > 0)
    .slice(0, 3);
  if (
    typeof insight.dewPoint === 'number'
    && typeof insight.temperatureNight === 'number'
    && Math.abs(insight.temperatureNight - insight.dewPoint) <= 2
  ) {
    reasons.push('Night temperature is close to dew point, so leaf condensation is likely.');
  }
  if (
    typeof insight.tomorrowPrecipitationProbability === 'number'
    && insight.tomorrowPrecipitationProbability >= 0.7
  ) {
    reasons.push(
      `Rain probability tomorrow is high (${Math.round(insight.tomorrowPrecipitationProbability * 100)}%).`,
    );
  }
  if (summaryLower.includes('mist') || summaryLower.includes('fog') || summaryLower.includes('drizzle')) {
    reasons.push(`Weather summary indicates persistent moisture (${insight.weatherSummary ?? 'humid pattern'}).`);
  }
  if (
    typeof insight.cloudCoverage === 'number'
    && insight.cloudCoverage >= 80
    && typeof insight.humidity === 'number'
    && insight.humidity >= 65
  ) {
    reasons.push('Heavy cloud cover with humid air can keep leaf surfaces damp for longer.');
  }
  if (typeof insight.windSpeed === 'number' && insight.windSpeed <= 5) {
    reasons.push(`Low wind (~${Math.round(insight.windSpeed)} km/h) reduces canopy drying.`);
  }
  if (typeof insight.windSpeed === 'number' && insight.windSpeed >= 20) {
    reasons.push(`Steady wind (~${Math.round(insight.windSpeed)} km/h) helps dry leaves and lowers pressure.`);
  }

  return {
    id: `${insight.plantId}:powderyMildew`,
    kind: 'powderyMildew',
    active: severity !== 'info',
    severity,
    title: titleFromSeverity(severity),
    summary: summaryFromSeverity(severity),
    reasons,
    metrics: {
      mildewRiskLevel: insight.mildewRiskLevel,
      mildewShouldWarn: insight.mildewShouldWarn,
      consecutiveVeryHumidWarmDays: insight.mildewConsecutiveVeryHumidWarmDays,
      humidity: insight.humidity,
      temperatureMaxC: insight.temperatureMax,
      temperatureNightC: insight.temperatureNight,
      dewPointC: insight.dewPoint,
      cloudCoverage: insight.cloudCoverage,
      windSpeedKph: insight.windSpeed,
      windGustKph: insight.windGust,
      uvIndex: insight.uvIndex,
      precipitationProbability: insight.precipitationProbability,
      tomorrowPrecipitationProbability: insight.tomorrowPrecipitationProbability,
      weatherSummary: insight.weatherSummary ?? '',
    },
    confidence: confidenceForMildew(context),
    algorithmVersion: ALGORITHM_VERSION,
  };
}
