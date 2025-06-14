import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, LayoutAnimation, UIManager, Modal, Pressable, Alert, Animated as RNAnimated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/ui/ThemedText';
import WeedGrowLogTypeSheet, { LogType } from './WeedGrowLogTypeSheet';
import WeedGrowLogForm from './WeedGrowLogForm';
import { addPlantLog } from '@/lib/logs/addPlantLog';
import type { PlantLog } from '@/firestoreModels';

export interface WeeklyDayData {
  date: string; // ISO string
  day: string; // e.g. 'Mon'
  dayNum: number; // e.g. 10
  minTemp: number | null;
  maxTemp: number | null;
  rain: number | null; // mm
  humidity: number | null;
  watered: boolean;
  fed?: boolean;
  pest?: boolean;
  health?: boolean;
  isToday?: boolean;
  detailedTemps?: {
    morn: number | null;
    day: number | null;
    eve: number | null;
    night: number | null;
    min: number | null;
    max: number | null;
  };
  weatherSummary?: string;
  plantId?: string; // <-- Added for log creation
  latestPicUri?: string | null;
}

interface WeeklyPlantCalendarBarProps {
  weekData: WeeklyDayData[];
  onLogWater: (date: string) => void;
  expandedLogDate?: string | null;
  setExpandedLogDate?: (date: string | null) => void;
  getLogsForDate?: (date: string) => Array<{ type: string; description?: string; updatedBy?: string; timestamp?: any }>;
  plantId?: string;
  onViewGallery?: () => void;
  onAddPicture?: () => void;
  uploading?: boolean;
  onUpdateWeekData?: (updater: (prev: WeeklyDayData[]) => WeeklyDayData[]) => void; // <-- Added prop
}

export default function WeeklyPlantCalendarBar({ weekData, onLogWater, expandedLogDate: controlledExpandedLogDate, setExpandedLogDate: setControlledExpandedLogDate, getLogsForDate, plantId, onViewGallery, onAddPicture, uploading, onUpdateWeekData }: WeeklyPlantCalendarBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [actionBubble, setActionBubble] = useState<{ visible: boolean; x: number; y: number; date: string | null }>({ visible: false, x: 0, y: 0, date: null });
  const [logTypeSheetVisible, setLogTypeSheetVisible] = useState(false);
  const [pendingLogDate, setPendingLogDate] = useState<string | null>(null);
  const [selectedLogType, setSelectedLogType] = useState<LogType | null>(null);
  // If controlled, use props; else local state
  const [uncontrolledExpandedLogDate, setUncontrolledExpandedLogDate] = useState<string | null>(null);
  const expandedLogDate = controlledExpandedLogDate !== undefined ? controlledExpandedLogDate : uncontrolledExpandedLogDate;
  const setExpandedLogDate = setControlledExpandedLogDate || setUncontrolledExpandedLogDate;

  // Enable LayoutAnimation for Android (suppress warning in Fabric)
  React.useEffect(() => {
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      try {
        // Only call if not running in Fabric (new arch)
        if (!(global as any).nativeFabricUIManager) {
          UIManager.setLayoutAnimationEnabledExperimental(true);
        }
      } catch (e) {
        // Silently ignore any errors
      }
    }
  }, []);

  const handleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const handleLongPress = (date: string, event: any) => {
    // Get position for bubble
    const { pageX, pageY } = event.nativeEvent;
    setActionBubble({ visible: true, x: pageX, y: pageY, date });
  };

  const handleCloseBubble = () => setActionBubble({ visible: false, x: 0, y: 0, date: null });

  const handleLogWaterPress = () => {
    if (actionBubble.date) {
      setPendingLogDate(actionBubble.date);
      setSelectedLogType('watering');
      // Directly show the log form, skip log type sheet
      setLogTypeSheetVisible(false);
    }
    handleCloseBubble();
  };

  const handleLogFeedPress = () => {
    if (actionBubble.date) {
      setPendingLogDate(actionBubble.date);
      setSelectedLogType('feeding');
      setLogTypeSheetVisible(false);
    }
    handleCloseBubble();
  };
  const handleLogPestPress = () => {
    if (actionBubble.date) {
      setPendingLogDate(actionBubble.date);
      setSelectedLogType('pests');
      setLogTypeSheetVisible(false);
    }
    handleCloseBubble();
  };
  const handleLogHealthPress = () => {
    if (actionBubble.date) {
      setPendingLogDate(actionBubble.date);
      setSelectedLogType('health');
      setLogTypeSheetVisible(false);
    }
    handleCloseBubble();
  };

  // Animated transition for log card
  const [logCardKey, setLogCardKey] = useState<string>('');
  React.useEffect(() => {
    if (expandedLogDate) setLogCardKey(expandedLogDate + '-' + ((getLogsForDate && expandedLogDate) ? (getLogsForDate(expandedLogDate)?.length || 0) : 0));
  }, [expandedLogDate, getLogsForDate && expandedLogDate ? getLogsForDate(expandedLogDate)?.length : 0]);

  // Animated fade for log card
  const [fadeAnim] = useState(new RNAnimated.Value(1));
  React.useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      fadeAnim.setValue(1);
    });
  }, [expandedLogDate]);

  // Modern Log Summary Card (redesigned)
  function ModernLogCard({ date, weather, logs, onAddLog, onAddPic }: {
    date: string;
    weather?: WeeklyDayData;
    logs: Array<{ type: string; description?: string; updatedBy?: string; timestamp?: any }>;

    onAddLog: () => void;
    onAddPic: () => void;
  }) {
    return (
      <RNAnimated.View
        key={logCardKey}
        style={{
          borderRadius: 20,
          backgroundColor: '#fff',
          marginHorizontal: 0, // Make card wider than content
          marginTop: 8,
          marginBottom: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOpacity: 0.13,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 5,
          minHeight: 120,
          position: 'relative',
          overflow: 'visible',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          alignSelf: 'stretch', // Make card as wide as possible
        }}
      >
        {/* Weather Row - always show if any weather data */}
        {(weather && (weather.minTemp != null || weather.maxTemp != null || weather.humidity != null || weather.rain != null)) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, gap: 12, flexWrap: 'wrap' }}>
            {(weather.minTemp != null && weather.maxTemp != null) && (
              <Text style={{ fontSize: 16, marginRight: 4, color: '#222' }}>🌡 {weather.maxTemp}° / {weather.minTemp}°</Text>
            )}
            {(weather.humidity != null) && (
              <Text style={{ fontSize: 16, color: '#2563eb' }}>💧 {weather.humidity}%</Text>
            )}
            {(weather.rain != null) && (
              <Text style={{ fontSize: 15, color: '#2563eb', marginLeft: 8 }}>☔ {weather.rain}mm rainfall</Text>
            )}
          </View>
        )}
        {/* Log List or Empty State */}
        <View style={{ minHeight: 36, marginTop: 6, marginBottom: 8 }}>
          {logs.length === 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.7, justifyContent: 'center' }}>
              <Text style={{ fontSize: 18 }}>📒</Text>
              <Text style={{ fontSize: 15, color: '#888' }}>No logs for this day.</Text>
            </View>
          ) : (
            logs.map((log, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, gap: 6 }}>
                <Text style={{ fontSize: 16 }}>
                  {log.type === 'watering' ? '💧' : log.type === 'fertilizing' ? '🧪' : log.type === 'pest' ? '🪲' : log.type === 'health' ? '❤️' : '📝'}
                </Text>
                <Text style={{ color: '#444', fontSize: 15 }}>{log.description || log.type}</Text>
                {log.updatedBy && <Text style={{ color: '#aaa', fontSize: 12 }}>by {log.updatedBy}</Text>}
              </View>
            ))
          )}
        </View>
        {/* FAB-style action buttons, bottom right inside card */}
        <View style={{ position: 'absolute', right: 18, bottom: 14, flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={onAddLog}
            style={{ backgroundColor: '#2563eb', borderRadius: 24, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', shadowColor: '#2563eb', shadowOpacity: 0.18, shadowRadius: 6, elevation: 3, marginLeft: 2 }}
            accessibilityLabel="Add Log"
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="plus" size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAddPic}
            style={{ backgroundColor: '#00c853', borderRadius: 24, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', shadowColor: '#00c853', shadowOpacity: 0.18, shadowRadius: 6, elevation: 3 }}
            accessibilityLabel="Add Progress Pic"
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </RNAnimated.View>
    );
  }

  // When a log is submitted, update the local weekData to reflect watering/fed/pest/health immediately
  React.useEffect(() => {
    if (!pendingLogDate || !selectedLogType) return;
    // Only update if the log form just closed (i.e., selectedLogType was just set to null)
    if (selectedLogType === null) {
      // setWeekData is not defined; this block should be removed or replaced with onUpdateWeekData if needed
      // If you want to update weekData, use onUpdateWeekData prop as done elsewhere
    }
  }, [selectedLogType]);

  // Track the last log type for immediate update
  const lastLoggedTypeRef = React.useRef<LogType | null>(null);
  React.useEffect(() => {
    if (selectedLogType) lastLoggedTypeRef.current = selectedLogType;
  }, [selectedLogType]);

  return (
    <><View style={{ flexDirection: 'column', paddingBottom: 8 }}>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.container}>
        {weekData.map((d, idx) => {
          const isToday = !!d.isToday;
          const watered = d.watered;
          // Pick weather icon based on summary (simple mapping)
          let weatherIcon: any = 'weather-partly-cloudy';
          if (d.weatherSummary) {
            const sum = d.weatherSummary.toLowerCase();
            if (sum.includes('rain')) weatherIcon = 'weather-rainy';
            else if (sum.includes('cloud')) weatherIcon = 'weather-cloudy';
            else if (sum.includes('sun')) weatherIcon = 'weather-sunny';
            else if (sum.includes('storm')) weatherIcon = 'weather-lightning';
            else if (sum.includes('snow')) weatherIcon = 'weather-snowy';
          }
          return (
            <TouchableOpacity
              key={d.date}
              style={[
                styles.card,
                isToday && styles.todayCard,
              ]}
              onPress={() => setExpandedLogDate(d.date === expandedLogDate ? null : d.date)}
              onLongPress={(e) => handleLongPress(d.date, e)}
              accessibilityLabel={`Show weather details for ${d.day} ${d.dayNum}`}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.day}>{d.day}</ThemedText>
              <ThemedText style={styles.dayNum}>{d.dayNum}</ThemedText>
              <View style={styles.iconRow}>
                <MaterialCommunityIcons name={weatherIcon} color="#2563eb" size={22} />
                {/* Log indicators row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 2 }}>
                  <Text style={{ fontSize: 15, opacity: d.watered ? 1 : 0.25 }}>💧</Text>
                  <Text style={{ fontSize: 15, opacity: d.fed ? 1 : 0.25 }}>🧪</Text>
                  <Text style={{ fontSize: 15, opacity: d.pest ? 1 : 0.25 }}>🪲</Text>
                  <Text style={{ fontSize: 15, opacity: d.health ? 1 : 0.25 }}>❤️</Text>
                </View>
              </View>
              {expanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.tempCol}>
                    <View style={styles.tempRow}>
                      <MaterialCommunityIcons name="arrow-up" color="#ef4444" size={14} accessibilityLabel="Max temp" />
                      <Text style={[styles.tempText, { color: '#ef4444' }]}> {
                        d.detailedTemps && d.detailedTemps.max !== null && d.detailedTemps.max !== undefined
                          ? `${d.detailedTemps.max.toFixed(1)}°`
                          : d.maxTemp !== null
                            ? `${d.maxTemp.toFixed(1)}°`
                            : '--'
                      }</Text>
                    </View>
                    <View style={styles.tempRow}>
                      <MaterialCommunityIcons name="arrow-down" color="#3b82f6" size={14} accessibilityLabel="Min temp" />
                      <Text style={[styles.tempText, { color: '#3b82f6' }]}> {
                        d.detailedTemps && d.detailedTemps.min !== null && d.detailedTemps.min !== undefined
                          ? `${d.detailedTemps.min.toFixed(1)}°`
                          : d.minTemp !== null
                            ? `${d.minTemp.toFixed(1)}°`
                            : '--'
                      }</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="weather-rainy" color="#38bdf8" size={14} accessibilityLabel="Rainfall" />
                    <Text style={styles.infoText}>{d.rain !== null ? `${d.rain}mm` : '--'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="water-percent" color="#06b6d4" size={14} accessibilityLabel="Humidity" />
                    <Text style={styles.infoText}>{d.humidity !== null ? `${d.humidity}%` : '--'}</Text>
                  </View>
                  {/* Add more details if desired */}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      </View>

      {/* Modern Log Card with animation */}
      {expandedLogDate && (
        <ModernLogCard
          date={expandedLogDate}
          weather={weekData.find(d => d.date === expandedLogDate)}
          logs={uploading ? [] : (getLogsForDate ? getLogsForDate(expandedLogDate) : [])}
          onAddLog={() => { setPendingLogDate(expandedLogDate); setLogTypeSheetVisible(true); setSelectedLogType(null); }}
          onAddPic={onAddPicture || (() => {})}
        />
      )}
      <Modal
        visible={actionBubble.visible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseBubble}
      >
        <Pressable style={styles.bubbleOverlay} onPress={handleCloseBubble}>
          <View style={[styles.bubble, { top: actionBubble.y + 8, left: actionBubble.x - 60 }]}> 
            <TouchableOpacity style={styles.bubbleAction} onPress={handleLogWaterPress}>
              <MaterialCommunityIcons name="water" color="#2563eb" size={20} />
              <Text style={styles.bubbleActionText}>Log Watering</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bubbleAction} onPress={handleLogFeedPress}>
              <Text style={{ fontSize: 20, marginRight: 4 }}>🧪</Text>
              <Text style={styles.bubbleActionText}>Log Feed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bubbleAction} onPress={handleLogPestPress}>
              <Text style={{ fontSize: 20, marginRight: 4 }}>🪲</Text>
              <Text style={styles.bubbleActionText}>Log Pest</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bubbleAction} onPress={handleLogHealthPress}>
              <Text style={{ fontSize: 20, marginRight: 4 }}>❤️</Text>
              <Text style={styles.bubbleActionText}>Log Health</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <WeedGrowLogTypeSheet
        visible={logTypeSheetVisible}
        onSelect={(type) => {
          setSelectedLogType(type);
          setLogTypeSheetVisible(false);
        }}
        onClose={() => setLogTypeSheetVisible(false)}
      />
      <WeedGrowLogForm
        visible={!!selectedLogType}
        logType={selectedLogType || 'watering'}
        onSubmit={async ({ description }) => {
          if (pendingLogDate && selectedLogType) {
            try {
              // Map LogType to Firestore PlantLog['type']
              const logTypeMap: Record<LogType, PlantLog['type']> = {
                watering: 'watering',
                feeding: 'fertilizing',
                pests: 'note', // or 'note' if you want to store pest logs as notes, otherwise add 'pest' to PlantLog type
                training: 'training',
                health: 'note', // or 'note', adjust as needed
                notes: 'note',
              };
              const firestoreType = logTypeMap[selectedLogType];
              const plantId = weekData[0]?.plantId;
              if (!plantId || typeof plantId !== 'string') {
                Alert.alert('Error', 'Cannot save log: plantId missing.');
              } else {
                await addPlantLog(plantId, {
                  type: firestoreType,
                  description,
                  updatedBy: 'demoUser', // TODO: Replace with real user
                }, pendingLogDate);
                // Update weekData in parent if onUpdateWeekData prop is provided
                if (onUpdateWeekData) {
                  onUpdateWeekData((prev: WeeklyDayData[]) => prev.map((d) => {
                    if (d.date !== pendingLogDate) return d;
                    if (selectedLogType === 'watering') return { ...d, watered: true };
                    if (selectedLogType === 'feeding') return { ...d, fed: true };
                    if (selectedLogType === 'pests') return { ...d, pest: true };
                    if (selectedLogType === 'health') return { ...d, health: true };
                    return d;
                  }));
                }
              }
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to save log.');
            }
            setSelectedLogType(null);
            setPendingLogDate(null);
          }
        }}
        onCancel={() => {
          setSelectedLogType(null);
          setPendingLogDate(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginVertical: 8,
  },
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 2,
  },
  card: {
    width: 60,
    height: 100, // <-- Add this!
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 2,
    elevation: Platform.OS === 'android' ? 3 : 1,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      ios: { zIndex: 1 },
      android: {},
    }),
  },

  todayCard: {
    borderColor: '#2563eb',
    borderWidth: 2,
    backgroundColor: '#e0e7ff',
    zIndex: 2,
  },
  day: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#334155',
    marginBottom: 0,
  },
  dayNum: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#0f172a',
    marginBottom: 2,
  },
  tempCol: {
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 2,
    gap: 1,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 0,
  },
  tempText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
    gap: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#334155',
    marginLeft: 2,
  },
  waterRow: {
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wateredIcon: {
    // Animate or scale if desired
    transform: [{ scale: 1.15 }],
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
  },
  expandedCard: {
    minWidth: 90,
    maxWidth: 110,
    // backgroundColor: '#e0e7ff', // REMOVE background color so expanded state does not affect card color
    zIndex: 3,
    elevation: 4,
  },
  expandedContent: {
    marginTop: 4,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  bubbleOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  bubble: {
    position: 'absolute',
    minWidth: 120,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    flexDirection: 'column',
    alignItems: 'flex-start',
    zIndex: 100,
  },
  bubbleAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  bubbleActionText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
});
