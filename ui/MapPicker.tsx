import React, { useEffect, useMemo, useRef, useState } from 'react';
import Constants from 'expo-constants';
import { Linking, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/ui/ThemedText';

interface MapPickerProps {
  location?: { lat: number; lng: number };
  onLocationChange(coords: { lat: number; lng: number }): void;
}

const DEFAULT_LOCATION = {
  lat: -33.9249,
  lng: 18.4241,
};

type MapPressEvent = {
  nativeEvent: {
    coordinate: {
      latitude: number;
      longitude: number;
    };
  };
};

function formatCoordinate(value: number | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

function parseCoordinate(value: string): number | null {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function hasGoogleMapsApiKey() {
  const expoConfig: any = (Constants.manifest as any) || Constants.expoConfig;
  const apiKey =
    expoConfig?.android?.config?.googleMaps?.apiKey ??
    expoConfig?.extra?.GOOGLE_MAPS_ANDROID_API_KEY ??
    expoConfig?.extra?.GOOGLE_MAPS_API_KEY ??
    expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  return typeof apiKey === 'string' && apiKey.trim().length > 0;
}

export function MapPicker({ location, onLocationChange }: MapPickerProps) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const mapRef = useRef<any>(null);
  const [latitude, setLatitude] = useState(formatCoordinate(location?.lat));
  const [longitude, setLongitude] = useState(formatCoordinate(location?.lng));
  const [nativeMapModule, setNativeMapModule] = useState<null | typeof import('react-native-maps')>(
    null,
  );

  const shouldUseManualFallback = useMemo(
    () => Platform.OS === 'android' && (__DEV__ || !hasGoogleMapsApiKey()),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    if (shouldUseManualFallback) {
      setNativeMapModule(null);
      return () => {
        cancelled = true;
      };
    }

    import('react-native-maps').then((module) => {
      if (!cancelled) {
        setNativeMapModule(module);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [shouldUseManualFallback]);

  useEffect(() => {
    setLatitude(formatCoordinate(location?.lat));
    setLongitude(formatCoordinate(location?.lng));
  }, [location?.lat, location?.lng]);

  useEffect(() => {
    if (shouldUseManualFallback) return;
    if (!location || !mapRef.current) return;

    mapRef.current.animateToRegion({
      latitude: location.lat,
      longitude: location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, [location, shouldUseManualFallback]);

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude: nextLat, longitude: nextLng } = event.nativeEvent.coordinate;
    onLocationChange({ lat: nextLat, lng: nextLng });
  };

  const applyCoordinates = () => {
    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);

    if (lat === null || lng === null) {
      return;
    }

    onLocationChange({ lat, lng });
  };

  const previewLat = parseCoordinate(latitude) ?? location?.lat ?? DEFAULT_LOCATION.lat;
  const previewLng = parseCoordinate(longitude) ?? location?.lng ?? DEFAULT_LOCATION.lng;

  const openPreviewMap = async () => {
    const url = `https://www.openstreetmap.org/?mlat=${previewLat}&mlon=${previewLng}#map=15/${previewLat}/${previewLng}`;
    await Linking.openURL(url);
  };

  if (shouldUseManualFallback) {
    return (
      <View style={[styles.fallbackContainer, { borderColor: Colors[theme].tint }]}>
        <View style={styles.preview}>
          <ThemedText type="defaultSemiBold" style={styles.previewTitle}>
            Interactive map is unavailable in this Android build.
          </ThemedText>
          <ThemedText style={styles.previewText}>
            Use your current location or enter coordinates manually so plant editing still works.
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={openPreviewMap}
            style={[styles.previewButton, { backgroundColor: Colors[theme].tint }]}
          >
            <ThemedText style={styles.previewButtonText}>Open in OpenStreetMap</ThemedText>
          </Pressable>
        </View>

        <View style={styles.fields}>
          <View style={styles.field}>
            <ThemedText style={styles.label}>Latitude</ThemedText>
            <TextInput
              keyboardType="decimal-pad"
              onBlur={applyCoordinates}
              onChangeText={setLatitude}
              placeholder="-33.9249"
              style={[
                styles.input,
                {
                  borderColor: Colors[theme].label,
                  color: Colors[theme].text,
                },
              ]}
              value={latitude}
            />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Longitude</ThemedText>
            <TextInput
              keyboardType="decimal-pad"
              onBlur={applyCoordinates}
              onChangeText={setLongitude}
              placeholder="18.4241"
              style={[
                styles.input,
                {
                  borderColor: Colors[theme].label,
                  color: Colors[theme].text,
                },
              ]}
              value={longitude}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={applyCoordinates}
            style={[styles.applyButton, { borderColor: Colors[theme].tint }]}
          >
            <ThemedText style={[styles.applyButtonText, { color: Colors[theme].tint }]}>
              Apply Coordinates
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  const MapView = nativeMapModule?.default;
  const Marker = nativeMapModule?.Marker;

  if (!MapView || !Marker) {
    return <View style={[styles.mapContainer, { borderColor: Colors[theme].tint }]} />;
  }

  return (
    <View style={[styles.mapContainer, { borderColor: Colors[theme].tint }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        onPress={handleMapPress}
        initialRegion={{
          latitude: location?.lat ?? DEFAULT_LOCATION.lat,
          longitude: location?.lng ?? DEFAULT_LOCATION.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {location ? (
          <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} pinColor="green" />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  applyButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  fallbackContainer: {
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
    maxWidth: 480,
    overflow: 'hidden',
    padding: 16,
    width: '100%',
  },
  field: {
    gap: 6,
  },
  fields: {
    gap: 12,
  },
  input: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    fontSize: 13,
    opacity: 0.85,
  },
  map: {
    height: 300,
    width: '100%',
  },
  mapContainer: {
    borderRadius: 16,
    borderWidth: 2,
    height: 300,
    maxWidth: 480,
    overflow: 'hidden',
    width: '100%',
  },
  preview: {
    alignItems: 'flex-start',
    gap: 10,
  },
  previewButton: {
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  previewButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
  },
  previewTitle: {
    fontSize: 16,
  },
});
