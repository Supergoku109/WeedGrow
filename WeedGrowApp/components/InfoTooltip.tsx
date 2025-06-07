import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
        style={styles.button}
      >
        <ThemedText style={styles.buttonText}>Why?</ThemedText>
      </TouchableOpacity>
      {visible && (
        <ThemedView style={styles.messageBox}>
          <ThemedText style={styles.messageText}>{message}</ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  button: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: '#ea580c',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
  messageBox: {
    marginTop: 4,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#ea580c',
  },
  messageText: {
    color: 'white',
    fontSize: 12,
  },
});
