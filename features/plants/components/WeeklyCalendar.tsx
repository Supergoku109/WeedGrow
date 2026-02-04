import React from 'react';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import WeeklyPlantCalendarBar, { WeeklyDayData } from '@/ui/WeeklyPlantCalendarBar';
import { PlantLog } from '@/firestoreModels';

interface WeeklyCalendarProps {
  weekData: WeeklyDayData[];
  history: any; // already calculated watering history
  expandedLogDate: string | null;
  setExpandedLogDate: (date: string | null) => void;
  getLogsForDate: (date: string) => PlantLog[];
  loadingLogs: boolean;
  updateWeekData: (updater: (prev: WeeklyDayData[]) => WeeklyDayData[]) => void;
  plantId?: string;
}

export default function WeeklyCalendar(props: WeeklyCalendarProps) {
  const router = useRouter();

  if (props.weekData.length !== 7) return null;

  return (
    <>
      <WeeklyPlantCalendarBar
        weekData={props.weekData}
        onLogWater={() => {}}  // actual handler wired from parent
        expandedLogDate={props.expandedLogDate}
        setExpandedLogDate={props.setExpandedLogDate}
        getLogsForDate={props.getLogsForDate}
        plantId={props.plantId}
        uploading={props.loadingLogs}
        onUpdateWeekData={(updater) => props.updateWeekData((prev) => updater([...prev]))}
      />
      <Button mode="outlined" style={{ marginTop: 10 }}
        onPress={() => router.push({ pathname: '/plant/LogHistoryCalendar', params: { plantId: String(props.plantId) } })}
      >
        View Full Log Calendar
      </Button>
    </>
  );
}
