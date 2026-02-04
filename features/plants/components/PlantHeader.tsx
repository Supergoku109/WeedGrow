import React from 'react';
import { View, Image } from 'react-native';

interface PlantHeaderProps {
  imageUri?: string;
  height: number;
}

export default function PlantHeader({ imageUri, height }: PlantHeaderProps) {
  return (
    imageUri ? (
      <Image 
        source={{ uri: imageUri }} 
        style={{ width: '100%', height, resizeMode: 'cover' }} 
      />
    ) : (
      <View style={{ width: '100%', height, backgroundColor: '#e5e7eb' }} />
    )
  );
}
