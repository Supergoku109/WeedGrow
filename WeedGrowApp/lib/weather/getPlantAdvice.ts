export interface PlantAdviceContext {
  /** Days since the plant was last watered */
  daysSinceWatered: number;
  /** Desired watering frequency in days */
  frequency: number;
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
  /** Probability of precipitation percentage */
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
    daysSinceWatered,
    frequency,
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
  if (rainTomorrow && !rainToday && daysSinceWatered < frequency) {
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

  // 4. Hot & dry conditions (with watering overdue)
  if (daysSinceWatered >= frequency && humidity < 50 && !rainToday) {
    return 'Dry weather – water your plant today.';
  }

  // 5. Mildly dry, but rain might come
  if (daysSinceWatered === frequency && pop > 40) {
    return 'Rain might come – water lightly if soil feels dry.';
  }

  // 7. High wind conditions
  if (windGust > 30) {
    return 'High winds today – check your plant is stable.';
  }

  // 8. Watering overdue but weather not ideal
  if (daysSinceWatered > frequency && (rainTomorrow || humidity > 80)) {
    return "Watering is overdue, but conditions aren’t ideal. Water lightly or wait.";
  }

  // 9. Everything is balanced
  if (daysSinceWatered < frequency) {
    return 'All good – no watering needed today.';
  }

  return 'No specific advice available.';
}
