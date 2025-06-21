import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function HomeBackground() {
  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 0 }]} pointerEvents="none">
      <Svg height={height} width={width} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <RadialGradient id="grad1" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
            <Stop offset="60%" stopColor="#22c55e" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad2" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#22c55e" stopOpacity="0.13" />
            <Stop offset="70%" stopColor="#22c55e" stopOpacity="0.05" />
            <Stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad3" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#22c55e" stopOpacity="0.10" />
            <Stop offset="70%" stopColor="#22c55e" stopOpacity="0.03" />
            <Stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={width * 0.25} cy={height * 0.22} r={180} fill="url(#grad1)" />
        <Circle cx={width * 0.8} cy={height * 0.45} r={120} fill="url(#grad2)" />
        <Circle cx={width * 0.4} cy={height * 0.85} r={160} fill="url(#grad3)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({});
