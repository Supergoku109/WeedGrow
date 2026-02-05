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

  if (props.weekData.length !== 7) return null;

  const selectedDay = props.expandedLogDate
    ? props.weekData.find((d) => d.date === props.expandedLogDate)
    : undefined;

  const logsForDay = props.expandedLogDate ? props.getLogsForDate(props.expandedLogDate) : [];
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
        onAddLog={props.onAddLog}
        onAddPicture={props.onAddPicture}
        locationLabel={props.locationLabel}
      />

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

      {props.expandedLogDate ? (
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
