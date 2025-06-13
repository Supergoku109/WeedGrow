import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ThemedText } from '@/ui/ThemedText';
import ExpandedLogPanel from '@/ui/ExpandedLogPanel';
import WeedGrowLogTypeSheet, { LogType } from '@/ui/WeedGrowLogTypeSheet';
import WeedGrowLogForm from '@/ui/WeedGrowLogForm';
import { addPlantLog } from '@/lib/logs/addPlantLog';
import type { PlantLog } from '@/firestoreModels';

export default function LogHistoryCalendar() {
  const { plantId } = useLocalSearchParams<{ plantId: string }>();
  const [logsByDate, setLogsByDate] = useState<Record<string, PlantLog[]>>({});
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [logTypeSheetVisible, setLogTypeSheetVisible] = useState(false);
  const [logFormVisible, setLogFormVisible] = useState(false);
  const [selectedLogType, setSelectedLogType] = useState<LogType | null>(null);
  const [pendingLogDate, setPendingLogDate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!plantId) return;
    (async () => {
      const snap = await getDocs(collection(db, 'plants', String(plantId), 'logs'));
      const logs: PlantLog[] = snap.docs.map((d) => d.data() as PlantLog);
      const byDate: Record<string, PlantLog[]> = {};
      logs.forEach(log => {
        const date = log.timestamp?.toDate?.().toISOString().split('T')[0];
        if (date) {
          if (!byDate[date]) byDate[date] = [];
          byDate[date].push(log);
        }
      });
      setLogsByDate(byDate);
      // Mark dates with logs
      const marks: any = {};
      Object.keys(byDate).forEach(date => {
        marks[date] = { marked: true, dotColor: '#2563eb' };
      });
      setMarkedDates(marks);
    })();
  }, [plantId]);

  // Reset form and sheet visibility on mount
  useEffect(() => {
    setLogFormVisible(false);
    setSelectedLogType(null);
    setLogTypeSheetVisible(false);
    setPendingLogDate(null);
  }, []);

  // Handler to open log type sheet
  const handleAddLog = (date: string) => {
    setPendingLogDate(date);
    setLogTypeSheetVisible(true);
    setLogFormVisible(false); // Always hide form when opening type sheet
    setSelectedLogType(null); // Always reset type
  };

  // Handler for log type selection
  const handleSelectLogType = (type: LogType) => {
    setSelectedLogType(type);
    setLogTypeSheetVisible(false);
    // Delay showing the form until after the sheet closes (prevents double modal bug)
    setTimeout(() => setLogFormVisible(true), 100);
  };

  // Handler for log form submit
  const handleSubmitLog = async ({ description }: { description: string }) => {
    if (!plantId || !pendingLogDate || !selectedLogType) return;
    setSubmitting(true);
    try {
      // Map LogType to Firestore PlantLog['type']
      const logTypeMap: Record<LogType, PlantLog['type']> = {
        watering: 'watering',
        feeding: 'fertilizing',
        pests: 'note',
        training: 'training',
        health: 'note',
        notes: 'note',
      };
      await addPlantLog(String(plantId), {
        type: logTypeMap[selectedLogType],
        description,
        updatedBy: 'demoUser', // TODO: Replace with real user
      }, pendingLogDate);
      // Refresh logs
      const snap = await getDocs(collection(db, 'plants', String(plantId), 'logs'));
      const logs: PlantLog[] = snap.docs.map((d) => d.data() as PlantLog);
      const byDate: Record<string, PlantLog[]> = {};
      logs.forEach(log => {
        const date = log.timestamp?.toDate?.().toISOString().split('T')[0];
        if (date) {
          if (!byDate[date]) byDate[date] = [];
          byDate[date].push(log);
        }
      });
      setLogsByDate(byDate);
      // Mark dates with logs
      const marks: any = {};
      Object.keys(byDate).forEach(date => {
        marks[date] = { marked: true, dotColor: '#2563eb' };
      });
      setMarkedDates(marks);
      setLogFormVisible(false);
      setSelectedLogType(null);
      setPendingLogDate(null);
    } catch (e: any) {
      alert(e.message || 'Failed to save log.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ThemedText style={{ fontWeight: 'bold', fontSize: 20, margin: 12 }}>Log History</ThemedText>
      <Calendar
        markedDates={{
          ...markedDates,
          ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#2563eb', marked: markedDates[selectedDate]?.marked, dotColor: '#2563eb' } } : {})
        }}
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        style={{ margin: 8, borderRadius: 12, elevation: 2 }}
        theme={{
          todayTextColor: '#2563eb',
          selectedDayBackgroundColor: '#2563eb',
          dotColor: '#2563eb',
        }}
      />
      {selectedDate && (
        <View style={{ margin: 12 }}>
          <ThemedText style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Logs for {selectedDate}</ThemedText>
          <ExpandedLogPanel
            date={selectedDate}
            weather={undefined}
            logs={logsByDate[selectedDate] || []}
            onAddLog={() => handleAddLog(selectedDate)}
            onAddPic={() => {}}
          />
        </View>
      )}
      <WeedGrowLogTypeSheet
        visible={logTypeSheetVisible}
        onSelect={handleSelectLogType}
        onClose={() => {
          setLogTypeSheetVisible(false);
          setSelectedLogType(null);
          setLogFormVisible(false);
        }}
      />
      {logFormVisible && selectedLogType && (
        <WeedGrowLogForm
          visible={true}
          logType={selectedLogType}
          onSubmit={handleSubmitLog}
          onCancel={() => {
            setLogFormVisible(false);
            setSelectedLogType(null);
            setPendingLogDate(null);
          }}
        />
      )}
    </ScrollView>
  );
}
