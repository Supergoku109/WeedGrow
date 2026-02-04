import { useState, useEffect } from 'react';
import { Plant } from '@/firestoreModels';
import { fetchLogsAndWeatherForRange } from '@/lib/logs/fetchLogsAndWeatherForRange';
import { WeeklyDayData } from '@/ui/WeeklyPlantCalendarBar';
import { WateringHistoryEntry } from '@/lib/logs/fetchWateringHistory';

export function useWeeklyData(plant: Plant | null, history: WateringHistoryEntry[], id?: string) {
  const [weekData, setWeekData] = useState<WeeklyDayData[]>([]);

  useEffect(() => {
    if (!plant || plant.environment !== 'outdoor' || !id) return;

    const fetchWeekData = async () => {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const startDate = weekStart.toISOString().split('T')[0];
      const endDate = new Date(weekStart);
      endDate.setDate(weekStart.getDate() + 6);
      const endDateStr = endDate.toISOString().split('T')[0];

      const logsAndWeather = await fetchLogsAndWeatherForRange(String(id), startDate, endDateStr);

      const days: WeeklyDayData[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const weather = logsAndWeather[dateStr]?.weather;
        days.push({
          date: dateStr,
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: d.getDate(),
          minTemp: weather?.detailedTemps?.min ?? null,
          maxTemp: weather?.detailedTemps?.max ?? null,
          rain: weather?.rainfall ?? null,
          humidity: weather?.humidity ?? null,
          watered: !!history.find(h => h.date === dateStr),
          isToday: d.toDateString() === today.toDateString(),
          plantId: String(id),
          weatherSummary: weather?.weatherSummary,
          detailedTemps: weather?.detailedTemps ? {
            morn: weather.detailedTemps.morn ?? null,
            day: weather.detailedTemps.day ?? null,
            eve: weather.detailedTemps.eve ?? null,
            night: weather.detailedTemps.night ?? null,
            min: weather.detailedTemps.min ?? null,
            max: weather.detailedTemps.max ?? null,
          } : undefined,
        });
      }
      setWeekData(days);
    };

    fetchWeekData();
  }, [plant, history, id]);

  return { weekData, updateWeekData: setWeekData };
}
