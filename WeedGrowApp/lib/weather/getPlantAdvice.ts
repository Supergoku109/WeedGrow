export interface PlantAdviceContext {
  /** Will it rain today? */
  rainToday: boolean;
  /** Will it rain tomorrow? */
  rainTomorrow: boolean;
  /** Rainfall yesterday in millimetres */
  rainYesterday?: number;
  /** Current humidity percentage */
  humidity: number;
  /** Current dew point in °C */
  dewPoint: number;
  /** Cloud coverage percentage */
  cloudCoverage: number;
  /** Wind gust speed in km/h */
  windGust: number;
  /** Probability of precipitation (0-1) */
  pop: number;
}

// Thresholds for mildew risk checks
const MILDEW_HUMIDITY_THRESHOLD = 85;
const MILDEW_DEWPOINT_THRESHOLD = 16;
const MILDEW_CLOUD_COVERAGE_THRESHOLD = 70;

/**
 * Return a short piece of advice based on watering history and upcoming weather.
 */
export interface PlantAdviceResult {
  advice: string;
  /** Brief explanation of why this advice was chosen */
  reason: string;
}

export function getPlantAdviceWithReason(ctx: PlantAdviceContext): PlantAdviceResult {
  const {
    rainToday,
    rainTomorrow,
    rainYesterday,
    humidity,
    dewPoint,
    cloudCoverage,
    windGust,
    pop,
  } = ctx;

  // 1. Rain expected today
  if (rainToday) {
    return {
      advice: 'Rain incoming – no need to water.',
      reason: 'Rain is forecast today, so watering isn\'t necessary.',
    };
  }

  // 2. Rain expected tomorrow
  if (rainTomorrow && !rainToday) {
    return {
      advice: 'Rain is expected tomorrow – delay watering unless soil looks dry.',
      reason: 'Rain is expected tomorrow and none today, so you can hold off watering.',
    };
  }

  // 3. It rained yesterday (only if rainYesterday is defined)
  if (typeof rainYesterday === 'number' && rainYesterday > 2) {
    return {
      advice: 'Recent rain – soil may still be moist.',
      reason: 'There was significant rain yesterday which likely left the soil damp.',
    };
  }

  // 6. High humidity + cloud cover = mildew risk
  if (
    humidity > MILDEW_HUMIDITY_THRESHOLD &&
    dewPoint > MILDEW_DEWPOINT_THRESHOLD &&
    cloudCoverage > MILDEW_CLOUD_COVERAGE_THRESHOLD
  ) {
    return {
      advice: 'High mildew risk – avoid watering today.',
      reason: 'Humidity, dew point and cloud cover are high, increasing mildew risk.',
    };
  }

  // 4. Hot & dry conditions
  if (humidity < 50 && !rainToday) {
    return {
      advice: 'Dry weather – water your plant today.',
      reason: 'Low humidity and no rain can dry the soil quickly.',
    };
  }

  // 5. Mildly dry, but rain might come
  if (pop > 0.4) {
    return {
      advice: 'Rain might come – water lightly if soil feels dry.',
      reason: 'There is a moderate chance of precipitation soon.',
    };
  }

  // 7. High wind conditions
  if (windGust > 30) {
    return {
      advice: 'High winds today – check your plant is stable.',
      reason: 'Strong winds can stress or topple plants.',
    };
  }

  // 8. Very humid but no rain
  if (humidity > 80 && !rainToday && !rainTomorrow) {
    return {
      advice: 'Very humid conditions – avoid heavy watering.',
      reason: 'Humidity is high but no rain is expected, which could promote fungus.',
    };
  }

  return {
    advice: 'Your plant might need water – check the soil.',
    reason: 'No specific conditions met, so check the soil for dryness.',
  };
}

/**
 * Backwards-compatible helper that returns only the advice string.
 */
export function getPlantAdvice(ctx: PlantAdviceContext): string {
  return getPlantAdviceWithReason(ctx).advice;
}
