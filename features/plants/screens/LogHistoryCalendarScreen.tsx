// features/plants/screens/LogHistoryCalendarScreen.tsx

import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import LogCalendar from '../components/LogCalendar';
import WeedGrowLogTypeSheet from '@/ui/WeedGrowLogTypeSheet';
import WeedGrowLogForm from '@/ui/WeedGrowLogForm';
import { useLogHistoryCalendar } from '../hooks/useLogHistoryCalendar';

export default function LogHistoryCalendarScreen() {
  const { plantId } = useLocalSearchParams<{ plantId: string }>();
  const calendar = useLogHistoryCalendar(plantId);

  return (
    <>
      <LogCalendar
        markedDates={calendar.getMarkedDates()}
        selectedDate={calendar.selectedDate}
        setSelectedDate={calendar.setSelectedDate}
        logsByDate={calendar.logsByDate}
        onAddLog={calendar.handleAddLog}
      />

      <WeedGrowLogTypeSheet
        visible={calendar.logTypeSheetVisible}
        onSelect={calendar.handleSelectLogType}
        onClose={calendar.closeTypeSheet}
      />

      {calendar.logFormVisible && calendar.selectedLogType && (
        <WeedGrowLogForm
          visible={true}
          logType={calendar.selectedLogType}
          onSubmit={calendar.handleSubmitLog}
          onCancel={calendar.cancelLogForm}
        />
      )}
    </>
  );
}
