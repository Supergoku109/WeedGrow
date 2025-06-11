import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, LayoutAnimation, UIManager, Modal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/ui/ThemedText';

export interface WeeklyDayData {
  date: string; // ISO string
  day: string; // e.g. 'Mon'
  dayNum: number; // e.g. 10
  minTemp: number | null;
  maxTemp: number | null;
  rain: number | null; // mm
  humidity: number | null;
  watered: boolean;
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
}

interface WeeklyPlantCalendarBarProps {
  weekData: WeeklyDayData[];
  onLogWater: (date: string) => void;
}

export default function WeeklyPlantCalendarBar({ weekData, onLogWater }: WeeklyPlantCalendarBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [actionBubble, setActionBubble] = useState<{ visible: boolean; x: number; y: number; date: string | null }>({ visible: false, x: 0, y: 0, date: null });

  // Enable LayoutAnimation for Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

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
    if (actionBubble.date) onLogWater(actionBubble.date);
    handleCloseBubble();
  };

  return (
    <>
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
                // expanded && styles.expandedCard, // REMOVE this line so expanded does not affect card color
              ]}
              onPress={handleExpand}
              onLongPress={(e) => handleLongPress(d.date, e)}
              accessibilityLabel={`Show weather details for ${d.day} ${d.dayNum}`}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.day}>{d.day}</ThemedText>
              <ThemedText style={styles.dayNum}>{d.dayNum}</ThemedText>
              <View style={styles.iconRow}>
                <MaterialCommunityIcons name={weatherIcon} color="#2563eb" size={22} />
                <MaterialCommunityIcons
                  name={watered ? 'water' : 'water-outline'}
                  color={watered ? '#2563eb' : '#9ca3af'} // blue if watered, gray if not
                  size={22}
                  accessibilityLabel={watered ? 'Watered' : 'Not watered'}
                  style={watered ? styles.wateredIcon : undefined}
                />
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
            {/* Future actions can be added here */}
          </View>
        </Pressable>
      </Modal>
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
