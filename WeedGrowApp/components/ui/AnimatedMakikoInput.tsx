import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, LayoutChangeEvent, Platform, BackHandler, Keyboard } from 'react-native';
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
  iconZoom?: number; // NEW: controls max zoom/scale of icon
}

export const AnimatedMakikoInput = forwardRef<TextInput, AnimatedMakikoInputProps>(({
  label,
  iconName,
  iconColor = '#8bc34a',
  value,
  onChangeText,
  inputStyle,
  style,
  iconClass: Icon,
  inputPadding = 16,
  iconZoom = 100, // NEW: default to 100
  ...rest
}, ref) => {
  const [focused, setFocused] = useState(false);
  const progress = useSharedValue(0);
  const [inputWidth, setInputWidth] = useState(0);
  const [inputHeight, setInputHeight] = useState(56);
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => inputRef.current as TextInput);

  const labelAnim = useRef(new RNAnimated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    RNAnimated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 350 });
  }, [focused]);

  // Android hardware back button handling for blur
  useEffect(() => {
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
    const scale = interpolate(progress.value, [0, 1], [1, iconZoom]); // use iconZoom
    return {
      position: 'absolute' as const,
      left: 8,
      top: 12,
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

  // Animated label style
  const labelStyle = {
    position: 'absolute' as const,
    left: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [48, 16] }),
    backgroundColor: 'transparent',
    zIndex: 3,
    fontWeight: '600' as const,
    paddingHorizontal: 2,
    top: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [12, -24] }),
    fontSize: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    color: labelAnim.interpolate({ inputRange: [0, 1], outputRange: ['#aaa', iconColor] }),
  };

  return (
    <View style={{ position: 'relative' }}>
      <View
        style={[{ height: inputHeight, marginBottom: 16, position: 'relative' }, style]}
        onTouchEnd={() => {
          inputRef.current?.focus();
        }}
        pointerEvents="box-none"
      >
        {/* Floating label (outside input box, can float above) */}
        <RNAnimated.Text style={labelStyle} pointerEvents="none">{label}</RNAnimated.Text>
        <Animated.View
          style={[
            styles.input,
            {
              width: inputWidth || '100%',
              height: inputHeight,
              borderRadius: 12,
              overflow: 'hidden',
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
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#232a25',
    paddingVertical: 0,
    fontWeight: '500',
    overflow: 'visible',
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
    paddingTop: 0,
    paddingBottom: 0,
  },
});
