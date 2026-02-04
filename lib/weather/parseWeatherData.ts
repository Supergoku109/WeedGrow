import { Timestamp } from 'firebase/firestore';
import type { WeatherCacheEntry } from '@/firestoreModels';

/**
 * Convert the OpenWeatherMap One Call API response into a map of
 * `WeatherCacheEntry` objects keyed by date (YYYY-MM-DD).
 */
export function parseWeatherData(apiResponse: any): Record<string, WeatherCacheEntry> {
  if (!apiResponse) return {};

  const entries: Record<string, WeatherCacheEntry> = {};
  const fetchedAt = Timestamp.now();
  const tzOffset = apiResponse.timezone_offset ?? 0; // seconds

  const toDateStr = (unix: number) =>
    new Date((unix + tzOffset) * 1000).toISOString().split('T')[0];

  // Aggregate hourly data so we can compute summaries like the peak
  // temperature or number of hours with rain for each day.
  const hourlyMap: Record<string, { peakTemp: number; rainHours: number }> = {};
  if (Array.isArray(apiResponse.hourly)) {
    for (const hour of apiResponse.hourly) {
      const d = toDateStr(hour.dt);
      const existing = hourlyMap[d] || { peakTemp: -Infinity, rainHours: 0 };
      if (hour.temp > existing.peakTemp) existing.peakTemp = hour.temp;
      const rainAmount = hour.rain?.['1h'] ?? hour.snow?.['1h'] ?? 0;
      if (rainAmount > 0) existing.rainHours += 1;
      hourlyMap[d] = existing;
    }
  }

  const addEntry = (
    dateStr: string,
    forecasted: boolean,
    sourceData: any
  ) => {
    const base: WeatherCacheEntry = {
      date: dateStr,
      fetchedAt,
      forecasted,
      source: 'OpenWeatherMap',
      temperature: sourceData.temp?.day ?? sourceData.temp,
      humidity: sourceData.humidity,
      windSpeed: sourceData.wind_speed,
      rainfall: sourceData.rain ?? sourceData.rainfall ?? 0,
      uvIndex: sourceData.uvi,
      weatherSummary: sourceData.weather?.[0]?.description ?? '',
      dewPoint: sourceData.dew_point,
      cloudCoverage: sourceData.clouds,
      windGust: sourceData.wind_gust,
      sunrise: sourceData.sunrise
        ? new Date((sourceData.sunrise + tzOffset) * 1000).toISOString()
        : undefined,
      sunset: sourceData.sunset
        ? new Date((sourceData.sunset + tzOffset) * 1000).toISOString()
        : undefined,
      pop: sourceData.pop,
    };

    // Add detailed temperature segments if available
    if (sourceData.temp && typeof sourceData.temp === 'object') {
      base.detailedTemps = {
        morn: sourceData.temp.morn ?? null,
        day: sourceData.temp.day ?? null,
        eve: sourceData.temp.eve ?? null,
        night: sourceData.temp.night ?? null,
        min: sourceData.temp.min ?? null,
        max: sourceData.temp.max ?? null,
      };
    }

    // Merge in the hourly summaries we computed above if available
    const hourly = hourlyMap[dateStr];
    if (hourly) {
      base.hourlySummary = {
        peakTemp: hourly.peakTemp,
        rainHours: hourly.rainHours,
      };
    }

    entries[dateStr] = base;
  };

  // Today from current conditions
  if (apiResponse.current) {
    const today = toDateStr(apiResponse.current.dt);
    addEntry(today, false, apiResponse.current);
  }

  // Daily forecasts (daily[0] is today)
  if (Array.isArray(apiResponse.daily)) {
    apiResponse.daily.forEach((d: any, idx: number) => {
      const dateStr = toDateStr(d.dt);
      // daily[0] overlaps with the `current` object, so only entries after
      // index 0 are considered "forecast" data
      const forecasted = idx > 0;
      addEntry(dateStr, forecasted, d);
    });
  }

  return entries;
}
