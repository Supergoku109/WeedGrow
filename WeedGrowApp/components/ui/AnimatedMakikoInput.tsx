import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';

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

  React.useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 350 });
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

  return (
    <View style={[{ height: inputHeight, marginBottom: 16 }, style]}>
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
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 2, justifyContent: 'center' }} pointerEvents="box-none">
          <TextInput
            style={[
              { paddingLeft: 56, paddingRight: 12, color: '#fff', fontSize: 16, fontWeight: '500', borderRadius: 12 },
              inputStyle,
            ]}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={label}
            placeholderTextColor="#8bc34a"
            {...rest}
          />
        </View>
      </Animated.View>
    </View>
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
    overflow: 'hidden',
  },
});
