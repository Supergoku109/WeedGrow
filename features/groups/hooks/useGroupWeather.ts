import { useEffect, useState } from 'react';
import { fetchWeather } from '@/lib/weather/fetchWeather';

export interface SimpleWeather {
  temperature: number;
  rain: number; // current hour rain (mm) if available
  humidity: number;
  // New optional fields for daily summary
  dayMax?: number; // today's forecast max temp (°C)
  dayMin?: number; // today's forecast min temp (°C)
  dailyRainMm?: number; // today's total rain (mm)
}

export function useGroupWeather(lat?: number, lng?: number) {
  const [weather, setWeather] = useState<SimpleWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    setLoading(true);
    fetchWeather(lat, lng)
      .then((data) => {
        // OpenWeatherMap OneCall 3.0 API: current weather is in data.current; daily forecast in data.daily[0]
        const current = data?.current ?? {};
        const today = Array.isArray(data?.daily) && data.daily.length > 0 ? data.daily[0] : undefined;
        setWeather({
          temperature: Math.round(current.temp ?? today?.temp?.day ?? 0),
          rain: current.rain?.['1h'] ? Math.round(current.rain['1h']) : 0,
          humidity: Math.round(current.humidity ?? 0),
          dayMax: typeof today?.temp?.max === 'number' ? Math.round(today.temp.max) : undefined,
          dayMin: typeof today?.temp?.min === 'number' ? Math.round(today.temp.min) : undefined,
          dailyRainMm: typeof today?.rain === 'number' ? Math.round(today.rain) : 0,
        });
      })
      .catch((err) => setError(err.message || 'Failed to fetch weather'))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return { weather, loading, error };
}
