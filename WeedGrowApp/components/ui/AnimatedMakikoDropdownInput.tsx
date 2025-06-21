import React, { useRef, useState, useEffect } from 'react';
import { Animated, View, TouchableOpacity, StyleSheet, Text, ScrollView, TextInput, Platform, BackHandler } from 'react-native';
import type { TextStyle } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface Option {
  label: string;
  value: string;
}

interface AnimatedMakikoDropdownInputProps {
  label: string;
  iconName: string;
  iconColor?: string;
  iconClass?: any; // add iconClass prop
  value: string;
  options: Option[];
  onSelect: (val: string) => void;
  placeholder?: string;
  style?: any;
}

export const AnimatedMakikoDropdownInput: React.FC<AnimatedMakikoDropdownInputProps> = ({
  label,
  iconName,
  iconColor = '#4caf50',
  iconClass = FontAwesomeIcon,
  value,
  options,
  onSelect,
  placeholder = '', // default to empty string
  style,
}) => {
  const [focused, setFocused] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  // Animate label up/down
  React.useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || inputValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, inputValue]);

  // Animate dropdown open/close
  React.useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: dropdownVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(arrowAnim, {
      toValue: dropdownVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [dropdownVisible]);

  React.useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Android hardware back button handling for blur/close
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!focused) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setFocused(false);
      // If dropdown is open, close it
      if (dropdownVisible) {
        setDropdownVisible(false);
        return true; // Prevent default back action
      }
      return false; // Let default back action occur
    });
    return () => {
      subscription.remove();
    };
  }, [focused, dropdownVisible]);

  const labelStyle: (TextStyle | object)[] = [
    {
      position: 'absolute',
      left: 48,
      backgroundColor: 'transparent',
      zIndex: 2,
      fontWeight: '600',
      paddingHorizontal: 2,
    },
    {
      top: labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [10, -8], // was [18, -8] for better alignment with Plant Name
      }),
      fontSize: labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
      }),
      color: labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#aaa', iconColor],
      }),
    },
  ];

  // Dropdown animated style
  const dropdownStyle = {
    opacity: dropdownAnim,
    maxHeight: dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 220] }),
    transform: [{ scaleY: dropdownAnim }],
  };

  // Arrow animated style
  const arrowStyle = {
    transform: [
      {
        rotate: arrowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  // Filter options based on input
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Check if inputValue is in options
  const isCustomValue =
    inputValue && !options.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase());

  return (
    <View style={[styles.container, style]}>
      {/* Icon */}
      <View style={styles.iconBg}>
        {iconClass ? (
          React.createElement(iconClass, { name: iconName, size: 24, color: iconColor })
        ) : (
          <FontAwesomeIcon name={iconName} size={24} color={iconColor} />
        )}
      </View>
      {/* Animated Label */}
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      {/* Input with arrow */}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: focused ? iconColor : '#232a25',
              backgroundColor: '#232a25',
              color: '#fff',
              flex: 1,
            },
          ]}
          value={inputValue}
          onFocus={() => {
            setFocused(true);
            setDropdownVisible(true);
          }}
          onBlur={() => {
            setFocused(false);
            setDropdownVisible(false);
          }}
          onChangeText={text => {
            setInputValue(text);
            setDropdownVisible(true);
          }}
          placeholder={''} // remove placeholder text
          placeholderTextColor="#aaa"
          returnKeyType="done"
          onSubmitEditing={() => {
            if (isCustomValue) {
              onSelect(inputValue);
              setDropdownVisible(false);
            }
          }}
        />
        <TouchableOpacity
          style={styles.arrowTouchable}
          onPress={() => setDropdownVisible(v => !v)}
          activeOpacity={0.7}
        >
          <Animated.View style={arrowStyle}>
            <MaterialCommunityIcons name="chevron-down" size={28} color="#aaa" />
          </Animated.View>
        </TouchableOpacity>
      </View>
      {/* Dropdown List (not modal) */}
      {dropdownVisible && (
        <Animated.View style={[styles.dropdownList, dropdownStyle]}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {filteredOptions.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.dropdownItem,
                  value === item.value && { backgroundColor: '#4caf50' },
                ]}
                onPress={() => {
                  onSelect(item.value);
                  setDropdownVisible(false);
                  setInputValue(item.label);
                }}
              >
                <Text style={{ color: value === item.value ? '#fff' : '#fff', fontWeight: '600' }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            {isCustomValue && (
              <TouchableOpacity
                style={[styles.dropdownItem, { backgroundColor: '#232a25' }]}
                onPress={() => {
                  onSelect(inputValue);
                  setDropdownVisible(false);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Use "{inputValue}"</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Remove width, minWidth, alignSelf. Let parent control width.
  },
  iconBg: {
    position: 'absolute',
    left: 7,
    top: 7,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // ensure icon is above input
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 12, // match input
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
    backgroundColor: '#232a25', // match input
    borderColor: '#232a25', // match input
  },
  input: {
    flex: 1,
    paddingLeft: 45, // match Plant Name
    paddingRight: 12, // match Plant Name
    paddingVertical: 0, // match Plant Name
    fontSize: 16,
    borderColor: 'transparent', // match Plant Name
    borderRadius: 12, // match Plant Name
    backgroundColor: 'transparent', // match Plant Name
    color: '#fff', // match Plant Name
    fontWeight: '500', // match Plant Name
    margin: 0, // match Plant Name
    borderWidth: 0, // match Plant Name
  },
  arrowTouchable: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
});
