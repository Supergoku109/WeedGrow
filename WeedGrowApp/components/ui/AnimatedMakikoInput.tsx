import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, LayoutChangeEvent, Platform, BackHandler, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';
import { Animated as RNAnimated } from 'react-native';

interface AnimatedMakikoInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  label: string;
  iconName: string;
  iconColor?: string;
  value: string;
  onChangeText: (val: string) => void;
  inputStyle?: any;
  style?: any;
  iconClass: any;
  inputPadding?: number;
}

export const AnimatedMakikoInput = ({
  label,
  iconName,
  iconColor = '#8bc34a',
  value,
  onChangeText,
  inputStyle,
  style,
  iconClass: Icon,
  inputPadding = 16,
  ...rest
}: AnimatedMakikoInputProps) => {
  const [focused, setFocused] = useState(false);
  const progress = useSharedValue(0);
  const [inputWidth, setInputWidth] = useState(0);
  const [inputHeight, setInputHeight] = useState(56);
  const inputRef = useRef<TextInput>(null);

  const labelAnim = React.useRef(new RNAnimated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    RNAnimated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  React.useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 350 });
  }, [focused]);

  // Android hardware back button handling for blur
  React.useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!focused) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (inputRef.current && focused) {
        inputRef.current.blur();
        // Do NOT call setFocused(false) here; let onBlur handle it to ensure all blur logic/animations run
        return true; // Prevent default back action so blur happens first
      }
      return false; // Let the default back action occur
    });
    return () => {
      subscription.remove();
    };
  }, [focused]);

  // Animated icon style: scale up to fill input, clipped by border radius
  const iconAnimatedStyle = useAnimatedStyle(() => {
    // Scale from 1 to 4 (400%)
    const scale = interpolate(progress.value, [0, 1], [1, 100]);
    return {
      position: 'absolute',
      left: 8,
      top: 16,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
      transform: [{ scale }],
      color: iconColor,
    };
  });

  // Layout callback to get input width/height
  const onInputLayout = (e: LayoutChangeEvent) => {
    setInputWidth(e.nativeEvent.layout.width);
    setInputHeight(e.nativeEvent.layout.height);
  };

  const labelStyle = [
    {
      position: 'absolute',
      left: 48, // match dropdown
      zIndex: 3,
      backgroundColor: 'transparent',
      fontWeight: '600',
      paddingHorizontal: 2,
    } as const,
    {
      top: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [18, -8] }),
      fontSize: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
      color: labelAnim.interpolate({ inputRange: [0, 1], outputRange: ['#aaa', iconColor] }), // Use grey for placeholder
    },
  ];

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (focused) {
          inputRef.current?.blur();
        }
        Keyboard.dismiss();
      }}
      accessible={false}
    >
      <View style={[{ height: inputHeight, marginBottom: 16, position: 'relative' }, style]}>
        {/* Floating label (outside input box, can float above) */}
        <RNAnimated.Text style={labelStyle}>{label}</RNAnimated.Text>
        <Animated.View
          style={[
            styles.input,
            {
              width: inputWidth || '100%',
              height: inputHeight,
              borderRadius: 12,
              overflow: 'hidden', // keep icon animation clipped
              backgroundColor: '#232a25',
              position: 'relative',
              justifyContent: 'center',
            },
          ]}
          onLayout={onInputLayout}
        >
          {/* Icon scales up and is clipped by border radius */}
          <Animated.View style={[iconAnimatedStyle, { zIndex: 1 }]} pointerEvents="none">
            <Icon name={iconName} size={24} color={iconColor} />
          </Animated.View>
          {/* TextInput overlays the icon and is always on top */}
          <View style={{ flex: 1, zIndex: 2, justifyContent: 'center' }} pointerEvents="box-none">
            <TextInput
              ref={inputRef}
              style={[
                styles.textInput,
                inputStyle,
              ]}
              value={value}
              onChangeText={onChangeText}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={''}
              placeholderTextColor="#8bc34a"
              {...rest}
            />
          </View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#232a25',
    paddingVertical: 0,
    fontWeight: '500',
    overflow: 'visible', // allow label to float outside
  },
  textInput: {
    paddingLeft: 52,
    paddingRight: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    borderRadius: 12,
    backgroundColor: 'transparent',
    margin: 0,
    borderWidth: 0,
  },
});
