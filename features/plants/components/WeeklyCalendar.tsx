import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import WeeklyPlantCalendarBar, { WeeklyDayData } from '@/ui/WeeklyPlantCalendarBar';
import { PlantLog } from '@/firestoreModels';
import { ThemedText } from '@/ui/ThemedText';
import { Spacing } from '@/design-system/tokens/spacing';

interface WeeklyCalendarProps {
  weekData: WeeklyDayData[];
  history: any; // already calculated watering history
  expandedLogDate: string | null;
  setExpandedLogDate: (date: string | null) => void;
  getLogsForDate: (date: string) => PlantLog[];
  loadingLogs: boolean;
  updateWeekData: (updater: (prev: WeeklyDayData[]) => WeeklyDayData[]) => void;
  plantId?: string;
  onAddLog?: () => void;
  onAddPicture?: () => void;
  locationLabel?: string;
  detailCardTopMargin?: number;
}

export default function WeeklyCalendar(props: WeeklyCalendarProps) {
  const router = useRouter();
  const detailCardTopMargin = props.detailCardTopMargin ?? Spacing.sm;
  const [rangeDays, setRangeDays] = React.useState<7 | 14>(7);
  const expandedLogDate = props.expandedLogDate;
  const setExpandedLogDate = props.setExpandedLogDate;
  const getLogsForDate = props.getLogsForDate;
  const todayDateKey = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const hasFourteenDays = props.weekData.length >= 14;
  const effectiveRangeDays = rangeDays === 14 && hasFourteenDays ? 14 : 7;
  const todayIndex = React.useMemo(() => {
    const index = props.weekData.findIndex(
      (day) => day.isToday || day.date === todayDateKey,
    );
    if (index >= 0) return index;
    return Math.max(0, props.weekData.length - 1);
  }, [props.weekData, todayDateKey]);
  const visibleDays = React.useMemo(() => {
    if (props.weekData.length === 0) return [];

    const targetLength = Math.min(effectiveRangeDays, props.weekData.length);
    const beforeCount = Math.floor(targetLength / 2);
    const afterCount = targetLength - beforeCount - 1;
    let startIndex = todayIndex - beforeCount;
    let endIndex = todayIndex + afterCount;

    if (startIndex < 0) {
      endIndex = Math.min(props.weekData.length - 1, endIndex - startIndex);
      startIndex = 0;
    }

    if (endIndex > props.weekData.length - 1) {
      const overshoot = endIndex - (props.weekData.length - 1);
      startIndex = Math.max(0, startIndex - overshoot);
      endIndex = props.weekData.length - 1;
    }

    return props.weekData.slice(startIndex, endIndex + 1);
  }, [props.weekData, effectiveRangeDays, todayIndex]);

  React.useEffect(() => {
    if (rangeDays === 14 && !hasFourteenDays) {
      setRangeDays(7);
    }
  }, [rangeDays, hasFourteenDays]);

  React.useEffect(() => {
    if (!expandedLogDate) return;
    if (visibleDays.some((d) => d.date === expandedLogDate)) return;
    const fallback =
      visibleDays.find((day) => day.isToday || day.date === todayDateKey)
      ?? visibleDays[visibleDays.length - 1];
    if (fallback) {
      setExpandedLogDate(fallback.date);
    }
  }, [visibleDays, expandedLogDate, setExpandedLogDate, todayDateKey]);

  const selectedDay = expandedLogDate
    ? visibleDays.find((d) => d.date === expandedLogDate)
    : undefined;

  const logsForDay = expandedLogDate ? getLogsForDate(expandedLogDate) : [];
  const safeLogs = props.loadingLogs ? [] : logsForDay;
  const logCount = safeLogs.length;

  const formatNumber = (value: number | null | undefined, decimals = 1) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '--';
    return value.toFixed(decimals);
  };

  const formatLogTime = (timestamp?: PlantLog['timestamp']) => {
    if (!timestamp) return '';
    const date = typeof (timestamp as any)?.toDate === 'function'
      ? (timestamp as any).toDate()
      : new Date(timestamp as any);
    if (Number.isNaN(date.getTime())) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const logMeta = (log: PlantLog) => {
    switch (log.type) {
      case 'watering':
        return { label: 'Watered', icon: 'water', color: '#6aa9da' };
      case 'fertilizing':
        return { label: 'Fertilized', icon: 'flask-outline', color: '#6abf7f' };
      case 'training':
        return { label: 'Training', icon: 'sprout', color: '#6abf7f' };
      case 'stage_change':
        return { label: 'Stage Change', icon: 'leaf', color: '#a7b6ad' };
      case 'harvest':
        return { label: 'Harvest', icon: 'leaf-maple', color: '#d9b27c' };
      case 'photo':
        return { label: 'Photo', icon: 'camera', color: '#8ea9d6' };
      default:
        return { label: 'Note', icon: 'note-text-outline', color: '#b8c0c7' };
    }
  };

  if (props.weekData.length < 7) return null;

  return (
    <>
      <WeeklyPlantCalendarBar
        weekData={visibleDays}
        onLogWater={() => {}}  // actual handler wired from parent
        expandedLogDate={expandedLogDate}
        setExpandedLogDate={setExpandedLogDate}
        getLogsForDate={getLogsForDate}
        plantId={props.plantId}
        uploading={props.loadingLogs}
        onUpdateWeekData={(updater) => props.updateWeekData((prev) => updater([...prev]))}
        onAddLog={props.onAddLog}
        onAddPicture={props.onAddPicture}
        locationLabel={props.locationLabel}
      />
      <View style={styles.rangeToggleRow}>
        <TouchableOpacity
          style={[styles.rangeToggleButton, effectiveRangeDays === 7 && styles.rangeToggleButtonActive]}
          onPress={() => setRangeDays(7)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Show last 7 days"
        >
          <ThemedText style={[styles.rangeToggleLabel, effectiveRangeDays === 7 && styles.rangeToggleLabelActive]}>
            7D
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.rangeToggleButton,
            effectiveRangeDays === 14 && styles.rangeToggleButtonActive,
            !hasFourteenDays && styles.rangeToggleButtonDisabled,
          ]}
          onPress={() => {
            if (hasFourteenDays) setRangeDays(14);
          }}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Show last 14 days"
          accessibilityState={{ disabled: !hasFourteenDays }}
        >
          <ThemedText
            style={[
              styles.rangeToggleLabel,
              effectiveRangeDays === 14 && styles.rangeToggleLabelActive,
              !hasFourteenDays && styles.rangeToggleLabelDisabled,
            ]}
          >
            14D
          </ThemedText>
        </TouchableOpacity>
      </View>

      {selectedDay ? (
        <View style={[styles.detailCard, { marginTop: detailCardTopMargin }]}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="thermometer" size={18} color="#9aa3ab" />
            <ThemedText style={styles.detailText}>
              {selectedDay.maxTemp != null && selectedDay.minTemp != null
                ? `${formatNumber(selectedDay.maxTemp, 1)}\u00b0 / ${formatNumber(selectedDay.minTemp, 1)}\u00b0`
                : 'Temperature unavailable'}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="water-percent" size={18} color="#6aa9da" />
            <ThemedText style={[styles.detailText, styles.detailAccent]}>
              {selectedDay.humidity != null ? `${Math.round(selectedDay.humidity)}% humidity` : 'Humidity unavailable'}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="weather-rainy" size={18} color="#6aa9da" />
            <ThemedText style={[styles.detailText, styles.detailAccent]}>
              {selectedDay.rain != null ? `${formatNumber(selectedDay.rain, 2)}mm rainfall` : 'Rainfall unavailable'}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="water" size={18} color="#8a948f" />
            <ThemedText style={styles.detailText}>
              Group watering: {props.locationLabel || 'Home'}
            </ThemedText>
          </View>
        </View>
      ) : null}

      {expandedLogDate ? (
        <View style={styles.logsCard}>
          <View style={styles.logsHeader}>
            <ThemedText style={styles.logsTitle}>Logs ({logCount})</ThemedText>
          </View>
          {props.loadingLogs ? (
            <ThemedText style={styles.logsEmpty}>Loading logs...</ThemedText>
          ) : logCount === 0 ? (
            <ThemedText style={styles.logsEmpty}>Nothing logged yet.</ThemedText>
          ) : (
            <View style={styles.logsList}>
              {safeLogs.map((log, index) => {
                const meta = logMeta(log);
                const timeLabel = formatLogTime(log.timestamp);
                return (
                  <View key={`${log.type}-${index}`} style={styles.logRow}>
                    <View style={styles.logIconWrap}>
                      <MaterialCommunityIcons name={meta.icon as any} size={18} color={meta.color} />
                    </View>
                    <View style={styles.logBody}>
                      <View style={styles.logHeaderRow}>
                        <ThemedText style={styles.logTitle}>{meta.label}</ThemedText>
                        {timeLabel ? <ThemedText style={styles.logTime}>- {timeLabel}</ThemedText> : null}
                      </View>
                      {log.description ? (
                        <ThemedText style={styles.logDescription}>{log.description}</ThemedText>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      ) : null}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.fullLogButton}
          onPress={() => router.push({ pathname: '/plant/LogHistoryCalendar', params: { plantId: String(props.plantId) } })}
          accessibilityLabel="View Full Log Calendar"
          activeOpacity={0.85}
        >
          <Text style={styles.fullLogButtonText}>View Full Log Calendar</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  rangeToggleRow: {
    marginTop: 2,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rangeToggleButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2d3538',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#171b1e',
  },
  rangeToggleButtonActive: {
    borderColor: '#84b895',
    backgroundColor: '#264030',
  },
  rangeToggleButtonDisabled: {
    opacity: 0.5,
  },
  rangeToggleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca5ab',
    letterSpacing: 0.4,
  },
  rangeToggleLabelActive: {
    color: '#d6efe0',
  },
  rangeToggleLabelDisabled: {
    color: '#7f878c',
  },
  detailCard: {
    marginBottom: 10,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#1b1f22',
    borderWidth: 1,
    borderColor: '#2d3438',
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#d8dde2',
  },
  detailAccent: {
    color: '#aac7da',
  },
  logsCard: {
    marginTop: 8,
    marginBottom: 6,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#16191c',
    borderWidth: 1,
    borderColor: '#262c30',
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e5eaee',
  },
  logsEmpty: {
    fontSize: 14,
    color: '#9aa3ab',
  },
  logsList: {
    gap: 12,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  logIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBody: {
    flex: 1,
    gap: 4,
  },
  logHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dfe5ea',
  },
  logTime: {
    fontSize: 12,
    color: '#9aa3ab',
  },
  logDescription: {
    fontSize: 13,
    color: '#b7c0c7',
  },
  footer: {
    marginTop: 12,
  },
  fullLogButton: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#2f3537',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#1a1c1e',
  },
  fullLogButtonText: {
    color: '#76c48f',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
