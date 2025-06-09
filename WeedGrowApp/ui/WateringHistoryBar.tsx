// WateringHistoryBar.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';

interface WateringHistoryEntry {
  date: string;
  watered: boolean;
}

interface WateringHistoryBarProps {
  history: WateringHistoryEntry[];
}

const WateringHistoryBar: React.FC<WateringHistoryBarProps> = ({ history }) => {
  return (
    <View style={styles.container}>
      {history.map((entry) => (
        <View
          key={entry.date}
          style={[styles.dot, { backgroundColor: entry.watered ? '#00c853' : '#aaa' }]}
        >
          {/* Optionally show date or tooltip */}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginTop: 4,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 2,
  },
});

export default WateringHistoryBar;
