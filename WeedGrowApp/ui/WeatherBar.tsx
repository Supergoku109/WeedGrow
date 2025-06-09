// WeatherBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';

interface WeatherBarProps {
  data: Array<{ date: string; temperature?: number; humidity?: number; rainfall?: number; weatherSummary?: string }>;
}

const WeatherBar: React.FC<WeatherBarProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      {data.map((entry) => (
        <View key={entry.date} style={styles.item}>
          <ThemedText style={styles.date}>{entry.date}</ThemedText>
          <ThemedText style={styles.temp}>🌡️ {entry.temperature ?? '-'}°C</ThemedText>
          <ThemedText style={styles.humidity}>💧 {entry.humidity ?? '-'}%</ThemedText>
          <ThemedText style={styles.rain}>☔ {entry.rainfall ?? '-'}mm</ThemedText>
          {entry.weatherSummary && <ThemedText style={styles.summary}>{entry.weatherSummary}</ThemedText>}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  item: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#222',
    borderRadius: 8,
    minWidth: 70,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
  },
  temp: {
    fontWeight: 'bold',
    color: '#fff',
  },
  humidity: {
    color: '#80d0ff',
  },
  rain: {
    color: '#a0e0a0',
  },
  summary: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default WeatherBar;
