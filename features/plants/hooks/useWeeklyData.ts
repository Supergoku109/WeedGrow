import { useState, useEffect } from 'react';
import { Plant } from '@/firestoreModels';
import { fetchLogsAndWeatherForRange } from '@/lib/logs/fetchLogsAndWeatherForRange';
import { WeeklyDayData } from '@/ui/WeeklyPlantCalendarBar';
import { WateringHistoryEntry } from '@/lib/logs/fetchWateringHistory';

const CALENDAR_WINDOW_DAYS = 14;
const CALENDAR_PAST_DAYS = Math.floor(CALENDAR_WINDOW_DAYS / 2);
const CALENDAR_FUTURE_DAYS = CALENDAR_WINDOW_DAYS - CALENDAR_PAST_DAYS - 1;

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useWeeklyData(plant: Plant | null, history: WateringHistoryEntry[], id?: string) {
  const [weekData, setWeekData] = useState<WeeklyDayData[]>([]);

  useEffect(() => {
    if (!plant || plant.environment !== 'outdoor' || !id) return;

    const fetchWeekData = async () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - CALENDAR_PAST_DAYS);
      start.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setDate(today.getDate() + CALENDAR_FUTURE_DAYS);
      end.setHours(23, 59, 59, 999);
      const startDate = toLocalDateKey(start);
      const endDateStr = toLocalDateKey(end);

      const logsAndWeather = await fetchLogsAndWeatherForRange(String(id), startDate, endDateStr);

      const days: WeeklyDayData[] = [];
      for (let i = -CALENDAR_PAST_DAYS; i <= CALENDAR_FUTURE_DAYS; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = toLocalDateKey(d);
        const logsForDay = logsAndWeather[dateStr]?.logs ?? [];
        const weather = logsAndWeather[dateStr]?.weather;
        const wateredFromLogs = logsForDay.some((log) => log.type === 'watering');
        const wateredFromHistory = history.some((entry) => entry.date === dateStr && entry.watered);
        const fedFromLogs = logsForDay.some((log) => log.type === 'fertilizing');

        days.push({
          date: dateStr,
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: d.getDate(),
          minTemp: weather?.detailedTemps?.min ?? null,
          maxTemp: weather?.detailedTemps?.max ?? null,
          rain: weather?.rainfall ?? null,
          humidity: weather?.humidity ?? null,
          watered: wateredFromLogs || wateredFromHistory,
          fed: fedFromLogs,
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
