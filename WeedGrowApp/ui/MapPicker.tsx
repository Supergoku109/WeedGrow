// ui/MapPicker.tsx

import React from 'react'
import { View, Dimensions } from 'react-native'
import MapView, { Marker, MapPressEvent } from 'react-native-maps'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'

const screen = Dimensions.get('window')

interface MapPickerProps {
  location?: { lat: number, lng: number }
  onLocationChange(coords: { lat: number, lng: number }): void
}

export function MapPicker({ location, onLocationChange }: MapPickerProps) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate
    onLocationChange({ lat: latitude, lng: longitude })
  }

  return (
    <View style={{ height: 300, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: Colors[theme].tint }}>
      <MapView
        style={{ width: screen.width - 56, height: 300 }}
        onPress={handleMapPress}
        initialRegion={{
          latitude: location?.lat ?? -33.9249,
          longitude: location?.lng ?? 18.4241,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
      >
        {location && (
          <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} pinColor="green" />
        )}
      </MapView>
    </View>
  )
}
