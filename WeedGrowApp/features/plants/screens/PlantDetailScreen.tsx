import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, Dimensions, View, BackHandler, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import ThemedText from '@/ui/ThemedText';
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
import { evaluateWateringInsights, type PlantSummary, type WateringInsight } from '@/lib/suggestions/wateringSuggestions';
import LoadingView from '../components/LoadingView';
import NotFoundView from '../components/NotFoundView';
import WeedGrowLogTypeSheet from '@/ui/WeedGrowLogTypeSheet';
import WeedGrowLogForm from '@/ui/WeedGrowLogForm';
import logger from '@/lib/logger';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  const { plant, loading } = usePlant(id);
  const { history } = useWateringHistory(plant, id);
  const { weekData, updateWeekData } = useWeeklyData(plant, history, id);
  const [wateringInsight, setWateringInsight] = React.useState<WateringInsight | null>(null);
  const [wateringInsightLoading, setWateringInsightLoading] = React.useState(false);
  const [wateringInsightError, setWateringInsightError] = React.useState<string | null>(null);
  const { expandedLogDate, setExpandedLogDate, dailyLogs, loadingLogs } = useDailyLogs(id);
  const { progressPics } = useProgressPics(id);
  const { onDelete } = useDeletePlant(id, router);

  const { onScroll, animatedBgImageStyle, galleryBarAnimatedStyle } = useCollapsingHeader(
    HEADER_MAX_HEIGHT,
    HEADER_MIN_HEIGHT,
    insets.top,
    Colors[theme].background
  );

  const headerSpacerHeight = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
  const topProtectedPadding = HEADER_MIN_HEIGHT + insets.top;
  const bottomSafePadding = (insets.bottom || 0) + 120;

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
    } catch (err: unknown) {
      logger.error('Failed to log watering', err);
    }
  };
  React.useEffect(() => {
    let cancelled = false;

    if (!plant || !id) {
      setWateringInsight(null);
      setWateringInsightError(null);
      setWateringInsightLoading(false);
      return;
    }

    const hasLocation =
      typeof (plant as any)?.location?.lat === 'number' && typeof (plant as any)?.location?.lng === 'number';
    if (!hasLocation) {
      setWateringInsight(null);
      setWateringInsightError(null);
      setWateringInsightLoading(false);
      return;
    }

    const evaluate = async () => {
      setWateringInsightLoading(true);
      setWateringInsightError(null);
      try {
        const summary: PlantSummary = { ...plant, id: String(id) };
        const [insight] = await evaluateWateringInsights([summary]);
        if (!cancelled) {
          setWateringInsight(insight ?? null);
        }
      } catch (error: unknown) {
        logger.error('Failed to evaluate watering insight', error);
        if (!cancelled) {
          setWateringInsight(null);
          setWateringInsightError('Unable to evaluate watering guidance right now.');
        }
      } finally {
        if (!cancelled) {
          setWateringInsightLoading(false);
        }
      }
    };

    evaluate();

    return () => {
      cancelled = true;
    };
  }, [plant, id]);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(tabs)?tabIndex=1'); // Use replace instead of push to avoid stacking
      return true; // Prevent default back button behavior
    });

    return () => backHandler.remove();
  }, [router]);

  const todayDate = React.useMemo(() => {
    // Use robust local date string for today
    return getLocalDateString();
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

  const locationMissing =
    !(plant as any)?.location ||
    typeof (plant as any).location?.lat !== 'number' ||
    typeof (plant as any).location?.lng !== 'number';

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
          paddingBottom: bottomSafePadding,
          minHeight: Dimensions.get('window').height + HEADER_MAX_HEIGHT,
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
      >
        <View style={{ height: headerSpacerHeight }} />
        <View style={{ paddingTop: topProtectedPadding }}>
          <View style={{ paddingHorizontal: 16 }}>
            <ThemedText type="title">{plant.name}</ThemedText>
            {plant.strain && (
              <ThemedText type="subtitle" style={{ marginBottom: 10 }}>
                {plant.strain}
              </ThemedText>
            )}
          </View>

          <View style={styles.wateringInsightWrapper}>
            {wateringInsightLoading ? (
              <View style={[styles.wateringInsightCard, styles.wateringInsightNeutral]}>
                <MaterialCommunityIcons
                  name="progress-clock"
                  size={20}
                  color="#d0f0ff"
                  style={styles.wateringInsightIcon}
                />
                <View style={styles.wateringInsightTextContainer}>
                  <ThemedText style={styles.wateringInsightHeadline}>Checking watering needs...</ThemedText>
                  <ThemedText style={styles.wateringInsightReason}>Hold on while we analyse the latest weather.</ThemedText>
                </View>
              </View>
            ) : wateringInsight ? (
              <View
                style={[
                  styles.wateringInsightCard,
                  wateringInsight.needsWater
                    ? styles.wateringInsightNeedsWater
                    : styles.wateringInsightAllGood,
                ]}
              >
                <MaterialCommunityIcons
                  name={wateringInsight.needsWater ? 'water-alert' : 'water-check'}
                  size={20}
                  color="#ffffff"
                  style={styles.wateringInsightIcon}
                />
                <View style={styles.wateringInsightTextContainer}>
                  <ThemedText style={styles.wateringInsightHeadline}>
                    {wateringInsight.needsWater
                      ? (wateringInsight.reason.includes("Yesterday's weather data unavailable")
                        ? "Yesterday’s weather data unavailable – assuming no water was received… using current and forecast data only. Watering needed today."
                        : "Watering needed today")
                      : (wateringInsight.reason.includes("Yesterday's weather data unavailable")
                        ? "Yesterday’s weather data unavailable – assuming no water was received… using current and forecast data only. No watering needed today."
                        : "No watering needed today")}
                  </ThemedText>
                  <ThemedText style={styles.wateringInsightReason}>
                    {wateringInsight.reason}
                  </ThemedText>
                </View>
              </View>
            ) : wateringInsightError ? (
              <View style={[styles.wateringInsightCard, styles.wateringInsightError]}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={20}
                  color="#ffd7d7"
                  style={styles.wateringInsightIcon}
                />
                <View style={styles.wateringInsightTextContainer}>
                  <ThemedText style={styles.wateringInsightHeadline}>Couldn&apos;t fetch watering guidance</ThemedText>
                  <ThemedText style={styles.wateringInsightReason}>{wateringInsightError}</ThemedText>
                </View>
              </View>
            ) : (
              <View style={[styles.wateringInsightCard, styles.wateringInsightNeutral]}>
                <MaterialCommunityIcons
                  name={locationMissing ? 'map-marker-alert-outline' : 'information-outline'}
                  size={20}
                  color="#d0f0ff"
                  style={styles.wateringInsightIcon}
                />
                <View style={styles.wateringInsightTextContainer}>
                  <ThemedText style={styles.wateringInsightHeadline}>Watering guidance unavailable</ThemedText>
                  <ThemedText style={styles.wateringInsightReason}>
                    {locationMissing
                      ? 'Add a location to this plant to enable weather-based watering advice.'
                      : 'No weather history yet. We will update this insight once data is available.'}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>

          {plant.environment === 'outdoor' && weekData.length === 7 && (
            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
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
            </View>
          )}

          {plant.notes ? (
            <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
              <NotesSection notes={plant.notes} />
            </View>
          ) : null}
        </View>
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
  wateringInsightWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  wateringInsightCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  wateringInsightIcon: {
    marginTop: 2,
  },
  wateringInsightTextContainer: {
    flex: 1,
    gap: 4,
  },
  wateringInsightHeadline: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  wateringInsightReason: {
    fontSize: 13,
    lineHeight: 18,
    color: '#dce7e1',
  },
  wateringInsightNeedsWater: {
    backgroundColor: '#3a2d2d',
    borderWidth: 1,
    borderColor: '#ffb4a2',
  },
  wateringInsightAllGood: {
    backgroundColor: '#25352c',
    borderWidth: 1,
    borderColor: '#6cd9a7',
  },
  wateringInsightNeutral: {
    backgroundColor: '#2d3432',
    borderWidth: 1,
    borderColor: '#60706a',
  },
  wateringInsightError: {
    backgroundColor: '#402c2c',
    borderWidth: 1,
    borderColor: '#ff8a80',
  },
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

// Utility to get local date string (YYYY-MM-DD)
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
