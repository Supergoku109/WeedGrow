import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { PlantItem } from '../api/fetchPlants';

interface GroupLocationSelectorProps {
  plants: PlantItem[];
  groupLocationPlantId?: string | null;
  onSelectGroupLocationPlantId?: (id: string) => void;
  theme: 'light' | 'dark';
}

const GroupLocationSelector: React.FC<GroupLocationSelectorProps> = ({ plants, groupLocationPlantId, onSelectGroupLocationPlantId, theme }) => {
  if (plants.length === 0) {
    return <Text style={{ color: Colors[theme].gray }}>No selected plant has a location.</Text>;
  }
  return (
    <>
      {plants.map((p, idx) => {
        const nickname = p.locationNickname && p.locationNickname.trim() ? p.locationNickname : 'Unnamed location';
        const isSelected = groupLocationPlantId === p.id;
        return (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.locationRadioRow,
              isSelected && styles.locationRadioRowSelected,
              idx !== plants.length - 1 && { marginBottom: 10 },
            ]}
            activeOpacity={0.7}
            onPress={() => onSelectGroupLocationPlantId && onSelectGroupLocationPlantId(p.id)}
          >
            <View style={[
              styles.radioOuter,
              isSelected && styles.radioOuterSelected,
            ]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.locationRadioText}>{`${p.name} (${nickname})`}</Text>
          </TouchableOpacity>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  locationRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  locationRadioRowSelected: {
    backgroundColor: 'rgba(0,200,83,0.08)',
  },
  locationRadioText: {
    color: '#ECEDEE',
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '500',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
  },
  radioOuterSelected: {
    borderColor: Colors.dark.tint,
    backgroundColor: '#222',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.tint,
  },
});

export default GroupLocationSelector;
