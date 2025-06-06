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
import { TextInput, Button } from 'react-native-paper';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';
import { Colors, Theme } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const screen = Dimensions.get('window');

export default function Step3() {
  const router = useRouter();
  const { location, locationNickname, setField } = usePlantForm();
  const theme: Theme = useColorScheme() ?? 'dark';
  const lat = location?.lat?.toString() ?? '';
  const lng = location?.lng?.toString() ?? '';
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = React.useState(false);
  const mapRef = React.useRef<MapView | null>(null);

  const inputStyle = {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  } as const;

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

      const lastKnown = await Location.getLastKnownPositionAsync();
      const coords = lastKnown?.coords
        ? lastKnown.coords
        : (
            await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              timeout: 5000,
            })
          ).coords;

      setField('location', {
        lat: coords.latitude,
        lng: coords.longitude,
      });

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

            <Button
              icon="crosshairs-gps"
              loading={loading}
              onPress={getLocation}
              style={{ marginBottom: 8, marginTop: 8 }}
            >
              📍 Use My Location
            </Button>

            <TextInput
              label="Location Nickname"
              value={locationNickname}
              onChangeText={(text) => setField('locationNickname', text)}
              style={inputStyle}
            />

            <View style={{ height: 300, borderRadius: 12, overflow: 'hidden' }}>
              <MapView
                ref={mapRef}
                style={{ width: screen.width - 32, height: 300 }}
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

            <Text style={{ color: Colors[theme].text, textAlign: 'center', marginTop: 8 }}>
              Tap the map to adjust your location
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
              <Button mode="outlined" onPress={() => router.back()}>
                Back
              </Button>
              <Button
                mode="contained"
                onPress={() => router.push('/add-plant/step4')}
                disabled={!location}
              >
                Next
              </Button>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
