import { HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT } from '@/constants/Layout';
import { Spacing } from '@/design-system/tokens/spacing';
import logger from '@/lib/logger';
import {
  evaluateSuggestionCardsForPlant,
  type SuggestionCard,
} from '@/lib/suggestions/suggestionCards';
import { type PlantSummary } from '@/lib/suggestions/wateringSuggestions';
import { ThemedText } from '@/ui/ThemedText';
import WeedGrowLogForm from '@/ui/WeedGrowLogForm';
import WeedGrowLogTypeSheet from '@/ui/WeedGrowLogTypeSheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  BackHandler,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EditPlantModal from '../components/EditPlantModal';
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

type MaterialIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
type InsightCardTone =
  | 'needsWater'
  | 'allGood'
  | 'neutral'
  | 'error'
  | 'mildewWatch'
  | 'mildewWarn';

interface InsightCardData {
  key: string;
  headline: string;
  reason: string;
  iconName: MaterialIconName;
  iconColor: string;
  tone: InsightCardTone;
}

type WateringInsightSectionProps = {
  isLoading: boolean;
  cards: SuggestionCard[];
  error: string | null;
  isLocationMissing: boolean;
  cardWidth: number;
};

function buildFallbackCards(params: {
  isLoading: boolean;
  error: string | null;
  isLocationMissing: boolean;
}): InsightCardData[] {
  const { isLoading, error, isLocationMissing } = params;
  if (isLoading) {
    return [
      {
        key: 'loading',
        iconName: 'progress-clock',
        iconColor: '#2f6b3b',
        headline: 'Checking watering needs...',
        reason: 'Hold on while we analyse the latest weather.',
        tone: 'neutral',
      },
    ];
  }

  if (error) {
    return [
      {
        key: 'error',
        iconName: 'alert-circle-outline',
        iconColor: '#b9504b',
        headline: "Couldn't fetch suggestions",
        reason: error,
        tone: 'error',
      },
    ];
  }

  return [
    {
      key: 'unavailable',
      iconName: isLocationMissing ? 'map-marker-alert-outline' : 'information-outline',
      iconColor: '#4f6b5b',
      headline: 'Suggestions unavailable',
      reason: isLocationMissing
        ? 'Add a location to this plant to enable weather-based suggestions.'
        : 'No weather history yet. Suggestions will appear once data is available.',
      tone: 'neutral',
    },
  ];
}

function mapSuggestionCardToUiCard(card: SuggestionCard): InsightCardData {
  const detailText = card.reasons.slice(0, 2).join(' ');
  const reasonText = detailText ? `${card.summary} ${detailText}` : card.summary;

  if (card.kind === 'watering') {
    const needsWater = card.metrics.needsWater === true;
    return {
      key: card.id,
      headline: card.title,
      reason: reasonText,
      iconName: needsWater ? 'water-alert' : 'water-check',
      iconColor: needsWater ? '#a4432d' : '#2f6b3b',
      tone: needsWater ? 'needsWater' : 'allGood',
    };
  }

  if (card.kind === 'powderyMildew') {
    const isWarn = card.severity === 'warn' || card.severity === 'critical';
    return {
      key: card.id,
      headline: card.title,
      reason: reasonText,
      iconName: 'leaf',
      iconColor: isWarn ? '#9f3a33' : '#876415',
      tone: isWarn ? 'mildewWarn' : 'mildewWatch',
    };
  }

  const isWarn = card.severity === 'warn' || card.severity === 'critical';
  return {
    key: card.id,
    headline: card.title,
    reason: reasonText,
    iconName: 'weather-pouring',
    iconColor: isWarn ? '#9f3a33' : '#876415',
    tone: isWarn ? 'mildewWarn' : 'mildewWatch',
  };
}

function getCardToneStyle(tone: InsightCardTone): StyleProp<ViewStyle> {
  switch (tone) {
    case 'needsWater':
      return styles.wateringInsightNeedsWater;
    case 'allGood':
      return styles.wateringInsightAllGood;
    case 'error':
      return styles.wateringInsightError;
    case 'mildewWatch':
      return styles.wateringInsightMildewWatch;
    case 'mildewWarn':
      return styles.wateringInsightMildewWarn;
    default:
      return styles.wateringInsightNeutral;
  }
}

function InsightCard({
  card,
  style,
}: {
  card: InsightCardData;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wateringInsightCard, getCardToneStyle(card.tone), style]}>
      <MaterialCommunityIcons
        name={card.iconName}
        size={22}
        color={card.iconColor}
        style={styles.wateringInsightIcon}
      />
      <View style={styles.wateringInsightTextContainer}>
        <ThemedText style={styles.wateringInsightHeadline}>{card.headline}</ThemedText>
        <ThemedText style={styles.wateringInsightReason}>{card.reason}</ThemedText>
      </View>
    </View>
  );
}

function WateringInsightSection({
  isLoading,
  cards,
  error,
  isLocationMissing,
  cardWidth,
}: WateringInsightSectionProps) {
  const uiCards = React.useMemo(() => {
    if (cards.length > 0) {
      return cards.map((card) => mapSuggestionCardToUiCard(card));
    }
    return buildFallbackCards({ isLoading, error, isLocationMissing });
  }, [cards, isLoading, error, isLocationMissing]);
  const [activeCardIndex, setActiveCardIndex] = React.useState(0);
  const cardsSignature = React.useMemo(
    () => uiCards.map((card) => `${card.key}:${card.headline}`).join('|'),
    [uiCards],
  );
  const pageSize = cardWidth + INSIGHT_CARD_GAP;

  React.useEffect(() => {
    setActiveCardIndex(0);
  }, [cardsSignature]);

  const handleMomentumEnd = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (uiCards.length <= 1) return;
      if (pageSize <= 0) return;

      const offsetX = event.nativeEvent.contentOffset.x;
      const rawIndex = Math.round(offsetX / pageSize);
      const nextIndex = Math.max(0, Math.min(uiCards.length - 1, rawIndex));
      setActiveCardIndex(nextIndex);
    },
    [uiCards.length, pageSize],
  );

  const suggestionCountText = `${uiCards.length} suggestion${uiCards.length === 1 ? '' : 's'}`;
  const positionText = uiCards.length > 1 ? ` (${activeCardIndex + 1}/${uiCards.length})` : '';

  return (
    <View style={styles.wateringInsightSection}>
      <View style={styles.wateringInsightMetaRow}>
        <ThemedText style={styles.wateringInsightMetaLabel}>Suggestions</ThemedText>
        <ThemedText style={styles.wateringInsightMetaCount}>
          {`${suggestionCountText}${positionText}`}
        </ThemedText>
      </View>

      {uiCards.length > 1 ? (
        <>
          <FlatList
            data={uiCards}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={pageSize}
            decelerationRate="fast"
            disableIntervalMomentum
            contentContainerStyle={styles.wateringInsightCarouselContent}
            ItemSeparatorComponent={() => <View style={styles.wateringInsightCardSpacer} />}
            onMomentumScrollEnd={handleMomentumEnd}
            renderItem={({ item }) => (
              <InsightCard
                card={item}
                style={{ width: cardWidth }}
              />
            )}
          />
          <View style={styles.wateringInsightPaginationRow}>
            {uiCards.map((card, index) => (
              <View
                key={`${card.key}-dot`}
                style={[
                  styles.wateringInsightPaginationDot,
                  index === activeCardIndex
                    ? styles.wateringInsightPaginationDotActive
                    : styles.wateringInsightPaginationDotInactive,
                ]}
              />
            ))}
          </View>
        </>
      ) : (
        <InsightCard card={uiCards[0]} style={styles.wateringInsightSingleCard} />
      )}
    </View>
  );
}

export default function PlantDetailScreen() {
  const { id, fromGroupId } = useLocalSearchParams<{ id: string; fromGroupId?: string }>();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const router = useRouter();
  const screenBackgroundColor = '#0f1012';
  const normalizedFromGroupId = React.useMemo(
    () => (Array.isArray(fromGroupId) ? fromGroupId[0] : fromGroupId),
    [fromGroupId]
  );

  const { plant, loading } = usePlant(id);
  const { history } = useWateringHistory(plant, id);
  const { weekData, updateWeekData } = useWeeklyData(plant, history, id);
  const [suggestionCards, setSuggestionCards] = React.useState<SuggestionCard[]>([]);
  const [isWateringInsightLoading, setIsWateringInsightLoading] = React.useState(false);
  const [wateringInsightError, setWateringInsightError] = React.useState<string | null>(null);
  const [insightRefreshToken, setInsightRefreshToken] = React.useState(0);
  const [insightDayKey, setInsightDayKey] = React.useState(() => getLocalDateString());
  const [isEditVisible, setEditVisible] = React.useState(false);
  const { expandedLogDate, setExpandedLogDate, dailyLogs, loadingLogs } = useDailyLogs(id);
  const isLocationAvailable =
    typeof plant?.location?.lat === 'number' && typeof plant?.location?.lng === 'number';
  const expandedHeaderHeight = HEADER_MAX_HEIGHT + insets.top;
  const collapsedHeaderHeight = HEADER_MIN_HEIGHT + insets.top;
  const headerCollapseRange = Math.max(0, expandedHeaderHeight - collapsedHeaderHeight);
  const { onScroll, animatedBgImageStyle, collapseProgress } = useCollapsingHeader(
    expandedHeaderHeight,
    collapsedHeaderHeight
  );

  const fabBottomOffset = insets.bottom + FAB_BOTTOM_MARGIN;
  const scrollContentPaddingBottom = fabBottomOffset + FAB_DIAMETER + FAB_CONTENT_SPACER;
  const scrollContentMinHeight = windowHeight + headerCollapseRange;
  const insightCardWidth = React.useMemo(
    () => Math.max(260, windowWidth - (SCREEN_SIDE_PADDING * 2)),
    [windowWidth],
  );
  const bumpInsightRefresh = React.useCallback(() => {
    setInsightRefreshToken((previous) => previous + 1);
  }, []);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      const nextDayKey = getLocalDateString();
      setInsightDayKey((previousDayKey) => (
        previousDayKey === nextDayKey ? previousDayKey : nextDayKey
      ));
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    if (!plant || !id) {
      setSuggestionCards([]);
      setWateringInsightError(null);
      setIsWateringInsightLoading(false);
      return;
    }

    if (!isLocationAvailable) {
      setSuggestionCards([]);
      setWateringInsightError(null);
      setIsWateringInsightLoading(false);
      return;
    }

    const evaluate = async () => {
      setIsWateringInsightLoading(true);
      setWateringInsightError(null);
      try {
        const summary: PlantSummary = { ...plant, id: String(id) };
        const result = await evaluateSuggestionCardsForPlant(summary);
        if (!cancelled) {
          setSuggestionCards(result?.cards ?? []);
        }
      } catch (error: unknown) {
        logger.error('Failed to evaluate plant suggestion cards', error);
        if (!cancelled) {
          setSuggestionCards([]);
          setWateringInsightError('Unable to evaluate suggestions right now.');
        }
      } finally {
        if (!cancelled) {
          setIsWateringInsightLoading(false);
        }
      }
    };

    evaluate();

    return () => {
      cancelled = true;
    };
  }, [plant, id, isLocationAvailable, weekData, insightRefreshToken, insightDayKey]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (normalizedFromGroupId) {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace({ pathname: '/group/[id]', params: { id: normalizedFromGroupId } });
          }
          return true;
        }
        router.replace('/(tabs)?tabIndex=1'); // Use replace instead of push to avoid stacking
        return true; // Prevent default back button behavior
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router, normalizedFromGroupId])
  );

  useFocusEffect(
    React.useCallback(() => {
      bumpInsightRefresh();
      return undefined;
    }, [bumpInsightRefresh])
  );

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

  const [isLogTypeSheetVisible, setIsLogTypeSheetVisible] = React.useState(false);
  const [isLogFormVisible, setIsLogFormVisible] = React.useState(false);
  const [selectedLogType, setSelectedLogType] = React.useState<import('@/ui/WeedGrowLogTypeSheet').LogType | null>(null);

  const handleAddLogPress = () => setIsLogTypeSheetVisible(true);
  const handleLogTypeSelect = (type: import('@/ui/WeedGrowLogTypeSheet').LogType) => {
    setSelectedLogType(type);
    setIsLogTypeSheetVisible(false);
    setIsLogFormVisible(true);
  };
  const handleLogFormCancel = () => {
    setIsLogFormVisible(false);
    setSelectedLogType(null);
  };
  const handleLogFormSubmit = (_fields: { description: string }) => {
    // You may want to call your addPlantLog logic here, or open a date picker, etc.
    setIsLogFormVisible(false);
    setSelectedLogType(null);
    // Optionally, trigger a refresh or feedback
  };
  const handleAddPicturePress = () => {
    // TODO: Implement add progress pic logic
  };

  const handleEditPlant = React.useCallback(() => {
    if (!id) return;
    setEditVisible(true);
  }, [id]);

  if (loading) return <LoadingView />;
  if (!plant) return <NotFoundView />;

  const isLocationMissing = !isLocationAvailable;
  const shouldShowWeeklyCalendar = plant.environment === 'outdoor' && weekData.length >= 7;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: screenBackgroundColor }} edges={['left', 'right']}>
      {/* Collapsing background image */}
      <Animated.View style={[animatedBgImageStyle, styles.headerOverlay]} pointerEvents="box-none">
        <PlantHeader
          imageUri={plant.imageUri}
          height={expandedHeaderHeight}
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
        style={styles.scroll}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        contentContainerStyle={{
          paddingTop: expandedHeaderHeight,
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
          <WateringInsightSection
            isLoading={isWateringInsightLoading}
            cards={suggestionCards}
            error={wateringInsightError}
            isLocationMissing={isLocationMissing}
            cardWidth={insightCardWidth}
          />
        </View>

        {shouldShowWeeklyCalendar && (
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
              detailCardTopMargin={0}
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
        visible={isLogTypeSheetVisible}
        onSelect={handleLogTypeSelect}
        onClose={() => setIsLogTypeSheetVisible(false)}
      />
      {/* Log Form Modal */}
      <WeedGrowLogForm
        visible={isLogFormVisible}
        logType={selectedLogType || 'notes'}
        onSubmit={handleLogFormSubmit}
        onCancel={handleLogFormCancel}
      />

      <EditPlantModal
        visible={isEditVisible}
        plant={plant}
        plantId={String(id)}
        onClose={() => setEditVisible(false)}
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
const INSIGHT_CARD_GAP = Spacing.sm;

const styles = StyleSheet.create({
  wateringInsightWrapper: {
    marginTop: INSIGHT_TOP_MARGIN,
    marginBottom: INSIGHT_BOTTOM_MARGIN,
  },
  wateringInsightSection: {
    gap: Spacing.xs,
  },
  wateringInsightMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    paddingHorizontal: 2,
  },
  wateringInsightMetaLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#9eb1a8',
    letterSpacing: 0.6,
  },
  wateringInsightMetaCount: {
    fontSize: 12,
    color: '#c8d6d0',
    fontWeight: '600',
  },
  wateringInsightCarouselContent: {
    paddingRight: INSIGHT_CARD_GAP,
  },
  wateringInsightCardSpacer: {
    width: INSIGHT_CARD_GAP,
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
  wateringInsightMildewWatch: {
    backgroundColor: '#f7efde',
    borderWidth: 1,
    borderColor: '#d8bf79',
  },
  wateringInsightMildewWarn: {
    backgroundColor: '#f3e1df',
    borderWidth: 1,
    borderColor: '#d79d9b',
  },
  wateringInsightSingleCard: {
    width: '100%',
  },
  wateringInsightPaginationRow: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  wateringInsightPaginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  wateringInsightPaginationDotActive: {
    backgroundColor: '#8cc09d',
  },
  wateringInsightPaginationDotInactive: {
    backgroundColor: '#56645d',
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
  headerOverlay: {
    zIndex: 10,
    elevation: 10,
  },
  scroll: {
    flex: 1,
    position: 'relative',
    zIndex: 0,
  },
});

// Utility to get local date string (YYYY-MM-DD)
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
