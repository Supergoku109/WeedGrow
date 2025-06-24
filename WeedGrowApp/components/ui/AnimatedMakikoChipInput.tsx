import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Animated, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface AnimatedMakikoChipInputProps {
  label: string;
  iconName: string;
  iconClass: any;
  iconColor: string;
  value: string[];
  onChange: (chips: string[]) => void;
  suggestions: string[];
  style?: any;
}

export const AnimatedMakikoChipInput: React.FC<AnimatedMakikoChipInputProps> = ({
  label,
  iconName,
  iconClass: Icon,
  iconColor,
  value,
  onChange,
  suggestions,
  style,
}) => {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value.length > 0 || input ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || input || value.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, input, value.length]);

  const filtered = input
    ? suggestions.filter(
        (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
      )
    : suggestions.filter((s) => !value.includes(s));

  const showAdd = input && !suggestions.some(s => s.toLowerCase() === input.toLowerCase()) && !value.includes(input);

  const handleAdd = (chip: string) => {
    if (!value.includes(chip)) {
      onChange([...value, chip]);
      setInput('');
    }
  };

  const handleRemove = (chip: string) => {
    onChange(value.filter((c) => c !== chip));
  };

  const labelStyle = {
    position: 'absolute' as const,
    left: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [48, 16] }),
    backgroundColor: 'transparent',
    zIndex: 2,
    fontWeight: '600' as const,
    paddingHorizontal: 2,
    top: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [10, -24] }),
    fontSize: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    color: labelAnim.interpolate({ inputRange: [0, 1], outputRange: ['#aaa', iconColor] }),
  };

  return (
    <View style={[styles.container, style]}>
      {/* Icon */}
      <View style={styles.iconBg} pointerEvents="none">
        <Icon name={iconName} size={24} color={iconColor} />
      </View>
      {/* Animated Label */}
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              borderColor: focused ? iconColor : '#232a25',
              backgroundColor: '#232a25',
              color: '#fff',
              flex: 1,
            },
          ]}
          value={input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeText={setInput}
          placeholder={''}
          placeholderTextColor="#aaa"
          returnKeyType="done"
          onSubmitEditing={() => {
            if (showAdd) handleAdd(input.trim());
          }}
        />
        {(focused || input.length > 0) && (
          <TouchableOpacity
            style={styles.arrowTouchable}
            onPress={() => {
              setFocused(false);
              inputRef.current?.blur();
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-up" size={28} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>
      {/* Dropdown List */}
      {(focused || input.length > 0) && (filtered.length > 0 || showAdd) && (
        <View style={styles.dropdownList}>
          {filtered.map((s) => (
            <TouchableOpacity key={s} style={styles.dropdownItem} onPress={() => handleAdd(s)}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>{s}</Text>
            </TouchableOpacity>
          ))}
          {showAdd && (
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleAdd(input.trim())}>
              <Text style={{ fontWeight: '600', color: iconColor }}>Add '{input.trim()}'</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* Chips */}
      <View style={styles.chipRow}>
        {value.map((chip) => (
          <TouchableOpacity
            key={chip}
            style={styles.chip}
            onPress={() => handleRemove(chip)}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>🌿 {chip}  ✕</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  iconBg: {
    position: 'absolute',
    left: 7,
    top: 7,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
    backgroundColor: '#232a25',
    borderColor: '#232a25',
  },
  input: {
    flex: 1,
    paddingLeft: 45,
    paddingRight: 12,
    paddingVertical: 0,
    fontSize: 16,
    borderColor: 'transparent',
    borderRadius: 12,
    backgroundColor: 'transparent',
    color: '#fff',
    fontWeight: '500',
    margin: 0,
    borderWidth: 0,
  },
  dropdownList: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: '#232a25',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    elevation: 2,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#4caf50',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 2,
  },
  arrowTouchable: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
