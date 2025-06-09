// InfoTooltip.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';

interface InfoTooltipProps {
  message: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ message }) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setVisible((v) => !v)}>
        <MaterialCommunityIcons name="information-outline" size={18} color="#aaa" />
      </TouchableOpacity>
      {visible && (
        <View style={styles.tooltip}>
          <ThemedText style={styles.text}>{message}</ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginLeft: 4,
  },
  tooltip: {
    position: 'absolute',
    top: 22,
    left: 0,
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 8,
    zIndex: 10,
    minWidth: 120,
    maxWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: '#fff',
    fontSize: 12,
  },
});

export { InfoTooltip };
export default InfoTooltip;
