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
    };

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
      const forecasted = idx > 0; // index 0 overlaps with today
      addEntry(dateStr, forecasted, d);
    });
  }

  return entries;
}
