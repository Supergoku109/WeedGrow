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
export function getPlantAdvice(ctx: PlantAdviceContext): string {
  const {
    rainToday,
    rainTomorrow,
    rainYesterday = 0,
    humidity,
    dewPoint,
    cloudCoverage,
    windGust,
    pop,
  } = ctx;

  // 1. Rain expected today
  if (rainToday) {
    return 'Rain incoming – no need to water.';
  }

  // 2. Rain expected tomorrow
  if (rainTomorrow && !rainToday) {
    return 'Rain is expected tomorrow – delay watering unless soil looks dry.';
  }

  // 3. It rained yesterday
  if (rainYesterday > 2) {
    return 'Recent rain – soil may still be moist.';
  }

  // 6. High humidity + cloud cover = mildew risk
  if (
    humidity > MILDEW_HUMIDITY_THRESHOLD &&
    dewPoint > MILDEW_DEWPOINT_THRESHOLD &&
    cloudCoverage > MILDEW_CLOUD_COVERAGE_THRESHOLD
  ) {
    return 'High mildew risk – avoid watering today.';
  }

  // 4. Hot & dry conditions
  if (humidity < 50 && !rainToday) {
    return 'Dry weather – water your plant today.';
  }

  // 5. Mildly dry, but rain might come
  if (pop > 0.4) {
    return 'Rain might come – water lightly if soil feels dry.';
  }

  // 7. High wind conditions
  if (windGust > 30) {
    return 'High winds today – check your plant is stable.';
  }

  // 8. Very humid but no rain
  if (humidity > 80 && !rainToday && !rainTomorrow) {
    return 'Very humid conditions – avoid heavy watering.';
  }

  return 'Your plant might need water – check the soil.';
}
