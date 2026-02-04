// features/plants/components/LogCalendar.tsx

import React from 'react';
import { View, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { ThemedText } from '@/ui/ThemedText';
import ExpandedLogPanel from '@/ui/ExpandedLogPanel';

import type { PlantLog } from '@/firestoreModels';

interface LogCalendarProps {
  markedDates: any;
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  logsByDate: Record<string, PlantLog[]>;
  onAddLog: (date: string) => void;
}

export default function LogCalendar({
  markedDates,
  selectedDate,
  setSelectedDate,
  logsByDate,
  onAddLog
}: LogCalendarProps) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ThemedText style={{ fontWeight: 'bold', fontSize: 20, margin: 12 }}>Log History</ThemedText>

      <Calendar
        markedDates={{
          ...markedDates,
          ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#2563eb', marked: markedDates[selectedDate]?.marked, dotColor: '#2563eb' } } : {})
        }}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        style={{ margin: 8, borderRadius: 12, elevation: 2 }}
        theme={{
          todayTextColor: '#2563eb',
          selectedDayBackgroundColor: '#2563eb',
          dotColor: '#2563eb',
        }}
      />

      {selectedDate && (
        <View style={{ margin: 12 }}>
          <ThemedText style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>
            Logs for {selectedDate}
          </ThemedText>

          <ExpandedLogPanel
            date={selectedDate}
            weather={undefined}
            logs={logsByDate[selectedDate] || []}
            onAddLog={() => onAddLog(selectedDate)}
            onAddPic={() => {}}
          />
        </View>
      )}
    </ScrollView>
  );
}
