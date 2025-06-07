import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export function InfoTooltip({ message }: { message: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={(ev) => {
          ev.stopPropagation();
          setVisible((v) => !v);
        }}
        accessibilityLabel="Show advice reason"
      >
        <MaterialCommunityIcons
          name="information"
          size={16}
          color="#ea580c"
        />
      </TouchableOpacity>
      {visible && (
        <ThemedView style={styles.tooltip}>
          <ThemedText style={styles.tooltipText}>{message}</ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    top: -4,
    left: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#ea580c',
    zIndex: 20,
    maxWidth: 200,
  },
  tooltipText: {
    color: 'white',
    fontSize: 12,
  },
});
