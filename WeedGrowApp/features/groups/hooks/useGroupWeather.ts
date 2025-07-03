import { useEffect, useState } from 'react';
import { fetchWeather } from '@/lib/weather/fetchWeather';

export interface SimpleWeather {
  temperature: number;
  rain: number;
  humidity: number;
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
        // OpenWeatherMap OneCall 3.0 API: current weather is in data.current
        setWeather({
          temperature: Math.round(data.current.temp),
          rain: data.current.rain?.['1h'] ? Math.round(data.current.rain['1h']) : 0,
          humidity: Math.round(data.current.humidity),
        });
      })
      .catch((err) => setError(err.message || 'Failed to fetch weather'))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return { weather, loading, error };
}
