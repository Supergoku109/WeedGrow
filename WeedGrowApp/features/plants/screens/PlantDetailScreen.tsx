import React from 'react';
import { SafeAreaView, Dimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/ui/ThemedText';
import { HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT } from '@/constants/Layout';
import { addPlantLog } from '@/lib/logs/addPlantLog';
import { fetchWateringHistory, DEFAULT_HISTORY_DAYS } from '@/lib/logs/fetchWateringHistory';
import { usePlant } from '../hooks/usePlant';
import { useWateringHistory } from '../hooks/useWateringHistory';
import { useWeeklyData } from '../hooks/useWeeklyData';
import { useDailyLogs } from '../hooks/useDailyLogs';
import { useProgressPics } from '../hooks/useProgressPics';
import { useDeletePlant } from '../hooks/useDeletePlant';
import { useCollapsingHeader } from '../hooks/useCollapsingHeader';
import PlantHeader from '../components/PlantHeader';
import GalleryBar from '../components/GalleryBar';
import WeeklyCalendar from '../components/WeeklyCalendar';
import NotesSection from '../components/NotesSection';
import DeleteButton from '../components/DeleteButton';
import LoadingView from '../components/LoadingView';
import NotFoundView from '../components/NotFoundView';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  const { plant, loading } = usePlant(id);
  const { history } = useWateringHistory(plant, id);
  const { weekData, updateWeekData } = useWeeklyData(plant, history, id);
  const { expandedLogDate, setExpandedLogDate, dailyLogs, loadingLogs } = useDailyLogs(id);
  const { progressPics } = useProgressPics(id);
  const { onDelete } = useDeletePlant(id, router);

  const { onScroll, animatedBgImageStyle, galleryBarAnimatedStyle } = useCollapsingHeader(
    HEADER_MAX_HEIGHT,
    HEADER_MIN_HEIGHT,
    insets.top,
    Colors[theme].background
  );

  const handleLogWater = async (date: string) => {
    if (!plant || !id) return;
    try {
      await addPlantLog(String(id), { type: 'watering', description: 'Watered the plant', updatedBy: 'demoUser' }, date);
      const h = await fetchWateringHistory(String(id), DEFAULT_HISTORY_DAYS);
      updateWeekData(prev => {
        const updated = [...prev];
        const dayIndex = updated.findIndex(d => d.date === date);
        if (dayIndex !== -1) updated[dayIndex].watered = true;
        return updated;
      });
    } catch (err: any) {
      console.error('Failed to log watering', err);
    }
  };

  if (loading) return <LoadingView />;
  if (!plant) return <NotFoundView />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      {/* Collapsing background image */}
      <Animated.View style={[animatedBgImageStyle, { top: insets.top }]}>
        <PlantHeader imageUri={plant.imageUri} height={HEADER_MAX_HEIGHT} />
      </Animated.View>

      {/* Animated Gallery Bar */}
      <Animated.View style={[galleryBarAnimatedStyle, { top: insets.top }]}>
        <GalleryBar plant={plant} progressPics={progressPics} />
      </Animated.View>

      {/* Main content inside SafeAreaView */}
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: HEADER_MIN_HEIGHT + insets.bottom,
            minHeight: Dimensions.get('window').height + HEADER_MAX_HEIGHT,
          }}
          scrollIndicatorInsets={{ top: HEADER_MAX_HEIGHT + insets.top, bottom: insets.bottom }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          bounces={false}
          overScrollMode="never"
        >
          {/* TODO: one day change so it's not hardcoded */}
          <View style={{ height: HEADER_MAX_HEIGHT+55 }} />
          <View style={{ paddingHorizontal: 16 }}>
            <ThemedText type="title">{plant.name}</ThemedText>
            {plant.strain && (
              <ThemedText type="subtitle" style={{ marginBottom: 10 }}>
                {plant.strain}
              </ThemedText>
            )}
          </View>

          {plant.environment === 'outdoor' && (
            <WeeklyCalendar
              weekData={weekData}
              history={history}
              expandedLogDate={expandedLogDate}
              setExpandedLogDate={setExpandedLogDate}
              getLogsForDate={(date: string) => dailyLogs[date] || []}
              loadingLogs={loadingLogs}
              updateWeekData={updateWeekData}
              plantId={id}
            />
          )}

          <NotesSection notes={plant.notes} />
        </Animated.ScrollView>
        <DeleteButton onDelete={onDelete} insets={insets} />
      </SafeAreaView>
    </View>
  );
}
