// features/plants/add-plant/screens/Step3Location.tsx

import React, { useState, useRef } from 'react';
import {
  ScrollView, KeyboardAvoidingView, Platform, View, TouchableWithoutFeedback, Keyboard, Alert, Dimensions
} from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { FadeIn } from 'react-native-reanimated';

import StepIndicatorBar from '@/ui/StepIndicatorBar';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/ui/ThemedText';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { useWeedGrowInputStyle } from '@/ui/WeedGrowInputStyle';
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';
import type { PlantForm } from '@/features/plants/form/PlantForm';

const screen = Dimensions.get('window');

interface AddPlantStepProps {
  form: PlantForm;
  setField: (field: keyof PlantForm, value: any) => void;
  next?: () => void;
  back?: () => void;
}

export default function Step3Location({ form, setField, next, back }: AddPlantStepProps) {
  const router = useRouter();
  const { location, locationNickname } = form;
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const { inputStyle } = useWeedGrowInputStyle();

  const getLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const lastKnown = await Location.getLastKnownPositionAsync();
      const coords = lastKnown?.coords
        ? lastKnown.coords
        : (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })).coords;

      setField('location', { lat: coords.latitude, lng: coords.longitude });

      mapRef.current?.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setField('location', { lat: latitude, lng: longitude });

    mapRef.current?.animateToRegion({
      latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005
    }, 500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: 8 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}>
            <StepIndicatorBar currentPosition={2} />
            <WeedGrowCard entering={FadeIn.duration(500)} style={{ marginTop: 8 }}>
              <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 8, fontSize: 22 }}>
                📍 Where is your plant?
              </ThemedText>

              <WeedGrowFormSection label="Location Details">
                <Button
                  icon="crosshairs-gps"
                  loading={loading}
                  onPress={getLocation}
                  style={{ marginBottom: 12, alignSelf: 'center', borderRadius: 8, backgroundColor: Colors[theme].tint }}
                  labelStyle={{ color: '#fff', fontWeight: '700' }}
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
              </WeedGrowFormSection>

              <WeedGrowFormSection label="Map" style={{ marginTop: 12 }}>
                <View style={{ height: 300, borderRadius: 16, overflow: 'hidden', marginBottom: 8, borderWidth: 2, borderColor: Colors[theme].tint }}>
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
                      <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} pinColor="green" />
                    )}
                  </MapView>
                </View>
                <ThemedText style={{ textAlign: 'center', marginTop: 8, color: Colors[theme].label, fontSize: 14 }}>
                  Tap the map to adjust your plant's location
                </ThemedText>
              </WeedGrowFormSection>

              <WeedGrowButtonRow>
                <Button mode="outlined" onPress={() => router.back()} style={{ flex: 1, borderRadius: 8, borderColor: Colors[theme].tint }}>
                  Back
                </Button>
                <Button
                  mode="contained"
                  onPress={() => router.push('/add-plant/step4')}
                  disabled={!location}
                  style={{ flex: 1, borderRadius: 8, backgroundColor: location ? Colors[theme].tint : '#3a4d3f' }}
                >
                  Next
                </Button>
              </WeedGrowButtonRow>
            </WeedGrowCard>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
