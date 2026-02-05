import { HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT } from '@/constants/Layout';
import { Spacing } from '@/design-system/tokens/spacing';
import logger from '@/lib/logger';
import { evaluateWateringInsights, type PlantSummary, type WateringInsight } from '@/lib/suggestions/wateringSuggestions';
import { ThemedText } from '@/ui/ThemedText';
import WeedGrowLogForm from '@/ui/WeedGrowLogForm';
import WeedGrowLogTypeSheet from '@/ui/WeedGrowLogTypeSheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { BackHandler, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingView from '../components/LoadingView';
import NotesSection from '../components/NotesSection';
import NotFoundView from '../components/NotFoundView';
import PlantHeader from '../components/PlantHeader';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { useCollapsingHeader } from '../hooks/useCollapsingHeader';
import { useDailyLogs } from '../hooks/useDailyLogs';
import { usePlant } from '../hooks/usePlant';
import { useWateringHistory } from '../hooks/useWateringHistory';
import { useWeeklyData } from '../hooks/useWeeklyData';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const router = useRouter();
  const screenBackgroundColor = '#0f1012';

  const { plant, loading } = usePlant(id);
  const { history } = useWateringHistory(plant, id);
  const { weekData, updateWeekData } = useWeeklyData(plant, history, id);
  const [wateringInsight, setWateringInsight] = React.useState<WateringInsight | null>(null);
  const [wateringInsightLoading, setWateringInsightLoading] = React.useState(false);
  const [wateringInsightError, setWateringInsightError] = React.useState<string | null>(null);
  const { expandedLogDate, setExpandedLogDate, dailyLogs, loadingLogs } = useDailyLogs(id);
  const collapsedHeaderHeight = HEADER_MIN_HEIGHT + insets.top;
  const headerCollapseRange = Math.max(0, HEADER_MAX_HEIGHT - collapsedHeaderHeight);
  const { onScroll, animatedBgImageStyle, collapseProgress } = useCollapsingHeader(
    HEADER_MAX_HEIGHT,
    collapsedHeaderHeight
  );

  const fabBottomOffset = insets.bottom + FAB_BOTTOM_MARGIN;
  const scrollContentPaddingBottom = fabBottomOffset + FAB_DIAMETER + FAB_CONTENT_SPACER;
  const scrollContentMinHeight = windowHeight + headerCollapseRange;

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

  const todayLocalDate = React.useMemo(() => {
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
      const todayEntry = weekData.find((d) => d.isToday || d.date === todayLocalDate);
      if (todayEntry) setExpandedLogDate(todayEntry.date);
    }
  }, [plant?.environment, weekData, todayLocalDate, expandedLogDate, setExpandedLogDate]);

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
  const handleAddPicturePress = () => {
    // TODO: Implement add progress pic logic
  };

  const handleEditPlant = React.useCallback(() => {
    if (!id) return;
    router.push({ pathname: '/add-plant', params: { editId: String(id) } });
  }, [id, router]);

  if (loading) return <LoadingView />;
  if (!plant) return <NotFoundView />;

  const locationMissing =
    !(plant as any)?.location ||
    typeof (plant as any).location?.lat !== 'number' ||
    typeof (plant as any).location?.lng !== 'number';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: screenBackgroundColor }} edges={['left', 'right']}>
      {/* Collapsing background image */}
      <Animated.View style={animatedBgImageStyle}>
        <PlantHeader
          imageUri={plant.imageUri}
          height={HEADER_MAX_HEIGHT}
          name={plant.name}
          strain={plant.strain}
          stage={plant.growthStage}
          onEdit={handleEditPlant}
          collapseProgress={collapseProgress}
          topInset={insets.top}
        />
      </Animated.View>

      {/* Main content */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT,
          paddingBottom: scrollContentPaddingBottom,
          paddingHorizontal: SCREEN_SIDE_PADDING,
          minHeight: scrollContentMinHeight,
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
      >
        <View style={styles.wateringInsightWrapper}>
          {wateringInsightLoading ? (
            <View style={[styles.wateringInsightCard, styles.wateringInsightNeutral]}>
              <MaterialCommunityIcons
                name="progress-clock"
                size={22}
                color="#2f6b3b"
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
                size={22}
                color={wateringInsight.needsWater ? '#a4432d' : '#2f6b3b'}
                style={styles.wateringInsightIcon}
              />
              <View style={styles.wateringInsightTextContainer}>
                <ThemedText style={styles.wateringInsightHeadline}>
                  {wateringInsight.needsWater
                    ? (wateringInsight.reason.includes("Yesterday's weather data unavailable")
                      ? "Yesterday's weather data unavailable - assuming no water was received... using current and forecast data only. Watering needed today."
                      : 'Watering needed today')
                    : (wateringInsight.reason.includes("Yesterday's weather data unavailable")
                      ? "Yesterday's weather data unavailable - assuming no water was received... using current and forecast data only. No watering needed today."
                      : 'No watering needed today')}
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
                size={22}
                color="#b9504b"
                style={styles.wateringInsightIcon}
              />
              <View style={styles.wateringInsightTextContainer}>
                <ThemedText style={styles.wateringInsightHeadline}>Couldn't fetch watering guidance</ThemedText>
                <ThemedText style={styles.wateringInsightReason}>{wateringInsightError}</ThemedText>
              </View>
            </View>
          ) : (
            <View style={[styles.wateringInsightCard, styles.wateringInsightNeutral]}>
              <MaterialCommunityIcons
                name={locationMissing ? 'map-marker-alert-outline' : 'information-outline'}
                size={22}
                color="#4f6b5b"
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
          <View style={styles.section}>
            <WeeklyCalendar
              weekData={weekData}
              history={history}
              expandedLogDate={expandedLogDate}
              setExpandedLogDate={setExpandedLogDate}
              getLogsForDate={(date: string) => dailyLogs[date] || []}
              loadingLogs={loadingLogs}
              updateWeekData={updateWeekData}
              plantId={id}
              onAddLog={handleAddLogPress}
              onAddPicture={handleAddPicturePress}
              locationLabel={plant.locationNickname || 'Home'}
            />
          </View>
        )}

        {plant.notes ? (
          <View style={styles.sectionLarge}>
            <NotesSection notes={plant.notes} />
          </View>
        ) : null}
      </Animated.ScrollView>

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

      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottomOffset }]}
        onPress={handleAddLogPress}
        accessibilityLabel="Add log"
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const FAB_DIAMETER = 58;
const FAB_BOTTOM_MARGIN = Spacing.lg;
const FAB_CONTENT_SPACER = Spacing.md;
const SCREEN_SIDE_PADDING = Spacing.md;
const SECTION_TOP_MARGIN = Spacing.sm;
const SECTION_TOP_MARGIN_LARGE = SECTION_TOP_MARGIN;
const INSIGHT_TOP_MARGIN = Spacing.sm;
const INSIGHT_BOTTOM_MARGIN = 0;

const styles = StyleSheet.create({
  wateringInsightWrapper: {
    marginTop: INSIGHT_TOP_MARGIN,
    marginBottom: INSIGHT_BOTTOM_MARGIN,
  },
  wateringInsightCard: {
    borderRadius: 20,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2c24',
  },
  wateringInsightReason: {
    fontSize: 13,
    lineHeight: 18,
    color: '#43514b',
  },
  wateringInsightNeedsWater: {
    backgroundColor: '#f4e4e4',
    borderWidth: 1,
    borderColor: '#e0b0ae',
  },
  wateringInsightAllGood: {
    backgroundColor: '#e7f3ea',
    borderWidth: 1,
    borderColor: '#85c29d',
  },
  wateringInsightNeutral: {
    backgroundColor: '#edf1ee',
    borderWidth: 1,
    borderColor: '#a6b7af',
  },
  wateringInsightError: {
    backgroundColor: '#f2dddd',
    borderWidth: 1,
    borderColor: '#d9a1a1',
  },
  section: {
    marginTop: SECTION_TOP_MARGIN,
  },
  sectionLarge: {
    marginTop: SECTION_TOP_MARGIN_LARGE,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: FAB_DIAMETER,
    height: FAB_DIAMETER,
    borderRadius: FAB_DIAMETER / 2,
    backgroundColor: '#79c79f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

// Utility to get local date string (YYYY-MM-DD)
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
