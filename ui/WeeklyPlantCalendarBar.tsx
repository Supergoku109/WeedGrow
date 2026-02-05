import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, UIManager, Modal, Pressable, Alert } from 'react-native';
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
  getLogsForDate?: (date: string) => { type: string; description?: string; updatedBy?: string; timestamp?: any }[];
  plantId?: string;
  onViewGallery?: () => void;
  onAddLog?: () => void;
  onAddPicture?: () => void;
  locationLabel?: string;
  uploading?: boolean;
  onUpdateWeekData?: (updater: (prev: WeeklyDayData[]) => WeeklyDayData[]) => void; // <-- Added prop
}

export default function WeeklyPlantCalendarBar({
  weekData,
  expandedLogDate: controlledExpandedLogDate,
  setExpandedLogDate: setControlledExpandedLogDate,
  onUpdateWeekData,
}: WeeklyPlantCalendarBarProps) {
  const [actionBubble, setActionBubble] = useState<{ visible: boolean; x: number; y: number; date: string | null }>({ visible: false, x: 0, y: 0, date: null });
  const [logTypeSheetVisible, setLogTypeSheetVisible] = useState(false);
  const [pendingLogDate, setPendingLogDate] = useState<string | null>(null);
  const [selectedLogType, setSelectedLogType] = useState<LogType | null>(null);
  // If controlled, use props; else local state
  const [uncontrolledExpandedLogDate, setUncontrolledExpandedLogDate] = useState<string | null>(null);
  const expandedLogDate = controlledExpandedLogDate !== undefined ? controlledExpandedLogDate : uncontrolledExpandedLogDate;
  const setExpandedLogDate = setControlledExpandedLogDate || setUncontrolledExpandedLogDate;
  const scrollRef = React.useRef<ScrollView>(null);
  const itemLayouts = React.useRef<Record<string, { x: number; width: number }>>({});
  const didInitDefault = React.useRef(false);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

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
      } catch {
        // Silently ignore any errors
      }
    }
  }, []);

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

  const todayKey = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const centerOnDate = React.useCallback((date: string, animated = true) => {
    const layout = itemLayouts.current[date];
    if (!layout || scrollWidth <= 0) return;
    const targetX = layout.x + layout.width / 2 - scrollWidth / 2;
    const maxX = Math.max(0, contentWidth - scrollWidth);
    const clampedX = Math.max(0, Math.min(targetX, maxX));
    scrollRef.current?.scrollTo({ x: clampedX, animated });
  }, [contentWidth, scrollWidth]);

  React.useEffect(() => {
    if (!expandedLogDate) return;
    centerOnDate(expandedLogDate, true);
  }, [expandedLogDate, centerOnDate]);

  React.useEffect(() => {
    if (didInitDefault.current) return;
    if (!weekData || weekData.length === 0) return;
    if (expandedLogDate) {
      didInitDefault.current = true;
      return;
    }
    const todayEntry = weekData.find((d) => d.isToday || d.date === todayKey);
    if (todayEntry) {
      setExpandedLogDate(todayEntry.date);
      didInitDefault.current = true;
    }
  }, [weekData, expandedLogDate, setExpandedLogDate, todayKey]);

  return (
    <><View style={{ flexDirection: 'column', paddingBottom: 8 }}>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.container}
        onLayout={(event) => setScrollWidth(event.nativeEvent.layout.width)}
        onContentSizeChange={(width) => setContentWidth(width)}
      >
        {weekData.map((d) => {
          const isToday = !!d.isToday;
          const isSelected = expandedLogDate === d.date;
          const baseIconColor = isSelected ? '#24372a' : '#9aa3ab';
          const wateredColor = d.watered ? (isSelected ? '#1f3628' : '#5fa3da') : baseIconColor;
          const fedColor = d.fed ? (isSelected ? '#23412e' : '#6abf7f') : baseIconColor;
          const weatherColor = isSelected ? '#24372a' : '#9aa3ab';
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
                isSelected && styles.selectedCard,
              ]}
              onPress={() => {
                setExpandedLogDate(d.date);
                centerOnDate(d.date, true);
              }}
              onLongPress={(e) => handleLongPress(d.date, e)}
              accessibilityLabel={`Show weather details for ${d.day} ${d.dayNum}`}
              activeOpacity={0.8}
              onLayout={(event) => {
                itemLayouts.current[d.date] = {
                  x: event.nativeEvent.layout.x,
                  width: event.nativeEvent.layout.width,
                };
                if (expandedLogDate === d.date) {
                  centerOnDate(d.date, false);
                }
              }}
            >
              <ThemedText style={[styles.day, isSelected && styles.daySelected]}>{d.day}</ThemedText>
              <ThemedText style={[styles.dayNum, isSelected && styles.dayNumSelected]}>{d.dayNum}</ThemedText>
              <View style={styles.iconRow}>
                <MaterialCommunityIcons
                  name="water"
                  size={14}
                  color={wateredColor}
                />
                <MaterialCommunityIcons
                  name="sprout"
                  size={14}
                  color={fedColor}
                />
                <MaterialCommunityIcons
                  name={weatherIcon}
                  size={14}
                  color={weatherColor}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      </View>
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
              <MaterialCommunityIcons name="flask-outline" color="#2563eb" size={20} />
              <Text style={styles.bubbleActionText}>Log Feed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bubbleAction} onPress={handleLogPestPress}>
              <MaterialCommunityIcons name="bug-outline" color="#2563eb" size={20} />
              <Text style={styles.bubbleActionText}>Log Pest</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bubbleAction} onPress={handleLogHealthPress}>
              <MaterialCommunityIcons name="heart-pulse" color="#2563eb" size={20} />
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
    marginVertical: 6,
  },
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
  },
  card: {
    width: 58,
    height: 90,
    backgroundColor: '#1f2326',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#31383c',
    ...Platform.select({
      ios: { zIndex: 1 },
      android: {},
    }),
  },
  todayCard: {
    backgroundColor: '#232a26',
    borderColor: '#4a5a53',
  },
  selectedCard: {
    borderColor: '#b6d5b7',
    borderWidth: 1,
    backgroundColor: '#9dc79b',
    shadowColor: '#7ea58a',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: Platform.OS === 'android' ? 3 : 1,
  },
  day: {
    fontWeight: '700',
    fontSize: 11,
    color: '#c3c9cf',
    marginBottom: 0,
  },
  daySelected: {
    color: '#1f2d22',
  },
  dayNum: {
    fontWeight: '700',
    fontSize: 17,
    color: '#f0f3f5',
    marginBottom: 2,
  },
  dayNumSelected: {
    color: '#1f2d22',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
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

