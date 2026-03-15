import React, { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
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

function formatCoordinate(value: number | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

function parseCoordinate(value: string): number | null {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function MapPicker({ location, onLocationChange }: MapPickerProps) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const [latitude, setLatitude] = useState(formatCoordinate(location?.lat));
  const [longitude, setLongitude] = useState(formatCoordinate(location?.lng));

  useEffect(() => {
    setLatitude(formatCoordinate(location?.lat));
    setLongitude(formatCoordinate(location?.lng));
  }, [location?.lat, location?.lng]);

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

  return (
    <View style={[styles.container, { borderColor: Colors[theme].tint }]}>
      <View style={styles.preview}>
        <ThemedText type="defaultSemiBold" style={styles.previewTitle}>
          Map preview is unavailable on web.
        </ThemedText>
        <ThemedText style={styles.previewText}>
          Use your current location or enter coordinates manually so this step still works in the browser.
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
  container: {
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
  preview: {
    alignItems: 'flex-start',
    gap: 10,
  },
  previewButton: {
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
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
