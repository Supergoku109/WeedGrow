import React from 'react';
import { SafeAreaView, Dimensions, View, BackHandler, TouchableOpacity, StyleSheet } from 'react-native';
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
import WeedGrowLogTypeSheet from '@/ui/WeedGrowLogTypeSheet';
import WeedGrowLogForm from '@/ui/WeedGrowLogForm';

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
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(tabs)?tabIndex=1'); // Use replace instead of push to avoid stacking
      return true; // Prevent default back button behavior
    });

    return () => backHandler.remove();
  }, [router]);

  const todayDate = React.useMemo(() => {
    const today = new Date();
    // Format as YYYY-MM-DD to match weekData.date
    return today.toISOString().slice(0, 10);
  }, []);

  // Show current day by default in WeeklyCalendar
  React.useEffect(() => {
    if (
      plant?.environment === 'outdoor' &&
      weekData &&
      weekData.length > 0 &&
      !expandedLogDate
    ) {
      // Find the weekData entry for today
      const todayEntry = weekData.find((d) => d.isToday || d.date === todayDate);
      if (todayEntry) setExpandedLogDate(todayEntry.date);
    }
  }, [plant?.environment, weekData, todayDate, expandedLogDate, setExpandedLogDate]);

  const [logTypeSheetVisible, setLogTypeSheetVisible] = React.useState(false);
  const [logFormVisible, setLogFormVisible] = React.useState(false);
  const [selectedLogType, setSelectedLogType] = React.useState<import('@/ui/WeedGrowLogTypeSheet').LogType | null>(null);

  const handleAddLogPress = () => setLogTypeSheetVisible(true);
  const handleLogTypeSelect = (type: import('@/ui/WeedGrowLogTypeSheet').LogType) => {
    setSelectedLogType(type);
    setLogTypeSheetVisible(false);
    setLogFormVisible(true);
  };
  const handleLogFormCancel = () => {
    setLogFormVisible(false);
    setSelectedLogType(null);
  };
  const handleLogFormSubmit = (fields: { description: string }) => {
    // You may want to call your addPlantLog logic here, or open a date picker, etc.
    setLogFormVisible(false);
    setSelectedLogType(null);
    // Optionally, trigger a refresh or feedback
  };

  if (loading) return <LoadingView />;
  if (!plant) return <NotFoundView />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      {/* Collapsing background image */}
      <Animated.View style={animatedBgImageStyle}>
        <PlantHeader imageUri={plant.imageUri} height={HEADER_MAX_HEIGHT} />
      </Animated.View>

      {/* Animated Gallery Bar */}
      <Animated.View style={galleryBarAnimatedStyle}>
        <GalleryBar plant={plant} progressPics={progressPics} />
      </Animated.View>

      {/* Main content */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT + insets.top,
          minHeight: Dimensions.get('window').height + HEADER_MAX_HEIGHT,
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
      >
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

      {/* Floating Add Log Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: (insets.bottom || 0) + 56 }]} // 56px above nav bar
        onPress={handleAddLogPress}
        accessibilityLabel="Add Log"
      >
        <View style={styles.fabInner}>
          <ThemedText style={styles.fabIcon}>＋</ThemedText>
        </View>
      </TouchableOpacity>

      {/* Floating Add Progress Pic Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: (insets.bottom || 0) + 120 }]}
        onPress={() => {/* TODO: Implement add progress pic logic */}}
        accessibilityLabel="Add Progress Pic"
      >
        <View style={[styles.fabInner, { backgroundColor: '#00c853' }]}> 
          <ThemedText style={styles.fabIcon}>📷</ThemedText>
        </View>
      </TouchableOpacity>

      {/* Log Type Sheet */}
      <WeedGrowLogTypeSheet
        visible={logTypeSheetVisible}
        onSelect={handleLogTypeSelect}
        onClose={() => setLogTypeSheetVisible(false)}
      />
      {/* Log Form Modal */}
      <WeedGrowLogForm
        visible={logFormVisible}
        logType={selectedLogType || 'notes'}
        onSubmit={handleLogFormSubmit}
        onCancel={handleLogFormCancel}
      />

      <DeleteButton onDelete={onDelete} insets={insets} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    // bottom will be set dynamically
    zIndex: 10,
    elevation: 4,
  },
  fabInner: {
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
