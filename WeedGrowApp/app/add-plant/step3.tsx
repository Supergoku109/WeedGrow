import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Alert,
  Text,
} from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { FadeIn } from 'react-native-reanimated';

import StepIndicatorBar from '@/ui/StepIndicatorBar';
import { usePlantForm } from '@/features/plants/hooks/usePlantForm';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/ui/ThemedText';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { useWeedGrowInputStyle } from '@/ui/WeedGrowInputStyle';
import { WeedGrowCard } from '@/ui/WeedGrowCard';

const screen = Dimensions.get('window');

export default function Step3() {
  const router = useRouter();
  const { location, locationNickname, setField } = usePlantForm();
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;
  const lat = location?.lat?.toString() ?? '';
  const lng = location?.lng?.toString() ?? '';
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = React.useState(false);
  // Reference to the MapView instance so we can imperatively control it
  const mapRef = React.useRef<MapView | null>(null);
  const { inputStyle } = useWeedGrowInputStyle();

  // Request the user's current location and update the form state
  // with the result. Falls back to the last known location if available
  // to avoid waiting for a fresh GPS fix every time.
  const getLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to fetch your current location. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Try use a cached position first for speed, falling back to a
      // high level request if none is available
      const lastKnown = await Location.getLastKnownPositionAsync();
      const coords = lastKnown?.coords
        ? lastKnown.coords
        : (
            await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            })
          ).coords;

      setField('location', {
        lat: coords.latitude,
        lng: coords.longitude,
      });

      // Smoothly move the map so the new location is centered
      mapRef.current?.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500
      );
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  // When the user taps on the map, update the form location and
  // animate the map to center on that point.
  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setField('location', {
      lat: latitude,
      lng: longitude,
    });

    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      // duration in ms for the map animation
      500
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: 8 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}
          >
            <StepIndicatorBar currentPosition={2} />
            <Text style={{ alignSelf: 'center', color: Colors[theme].tint, fontWeight: '600', marginBottom: 2, letterSpacing: 1, fontSize: 13 }}>
              Step 3 of 5
            </Text>
            <WeedGrowCard entering={FadeIn.duration(500)} style={{ alignItems: 'stretch', marginTop: 8 }}>
              <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 8, fontSize: 22 }}>
                📍 Where is your plant?
              </ThemedText>
              <ThemedText style={{ textAlign: 'center', color: Colors[theme].tint, marginBottom: 18, fontSize: 15 }}>
                Give your plant's location a nickname and set its position on the map.
              </ThemedText>

              <Button
                icon="crosshairs-gps"
                loading={loading}
                onPress={getLocation}
                style={{ marginBottom: 12, alignSelf: 'center', borderRadius: 8, backgroundColor: Colors[theme].tint, elevation: 2 }}
                labelStyle={{ color: '#fff', fontWeight: '700' }}
                contentStyle={{ height: 48 }}
                mode="contained"
              >
                Use My Location
              </Button>

              <WeedGrowTextInput
                label="Location Nickname"
                value={locationNickname}
                onChangeText={(text: string) => setField('locationNickname', text)}
                icon="map-marker"
                style={{ marginBottom: 12 }}
              />

              <View style={{ height: 300, borderRadius: 16, overflow: 'hidden', marginBottom: 8, borderWidth: 2, borderColor: Colors[theme].tint, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                <MapView
                  ref={mapRef}
                  style={{ width: screen.width - 56, height: 300 }}
                  onPress={handleMapPress}
                  initialRegion={{
                    latitude: location?.lat ?? -33.9249,
                    longitude: location?.lng ?? 18.4241,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  {location && (
                    <Marker
                      coordinate={{ latitude: location.lat, longitude: location.lng }}
                      pinColor="green"
                      title="Plant Location"
                    />
                  )}
                </MapView>
              </View>

              <ThemedText style={{ textAlign: 'center', marginTop: 8, color: Colors[theme].label, fontSize: 14 }}>
                Tap the map to adjust your plant's location
              </ThemedText>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
                <Button
                  mode="outlined"
                  onPress={() => router.back()}
                  style={{ borderRadius: 8, minWidth: 100, borderColor: Colors[theme].tint, borderWidth: 1 }}
                  labelStyle={{ fontWeight: '600' }}
                >
                  Back
                </Button>
                <Button
                  mode="contained"
                  onPress={() => router.push('/add-plant/step4')}
                  disabled={!location}
                  style={{ borderRadius: 8, minWidth: 100, backgroundColor: location ? Colors[theme].tint : '#3a4d3f', elevation: 2 }}
                  labelStyle={{ fontWeight: '700', letterSpacing: 1 }}
                  contentStyle={{ height: 48 }}
                >
                  Next
                </Button>
              </View>
            </WeedGrowCard>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
