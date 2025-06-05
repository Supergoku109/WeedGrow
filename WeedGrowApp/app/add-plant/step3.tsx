import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';

export default function Step3() {
  const router = useRouter();
  const { location, locationNickname, setField } = usePlantForm();
  const lat = location?.lat?.toString() ?? '';
  const lng = location?.lng?.toString() ?? '';

  const [loading, setLoading] = React.useState(false);

  const inputStyle = {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  } as const;

  const getLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        Alert.alert(
          'Permission Denied',
          'Location permission is required to fetch your current location. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }
      const current = await Location.getCurrentPositionAsync({});
      setField('location', {
        lat: current.coords.latitude,
        lng: current.coords.longitude,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
          <StepIndicatorBar currentPosition={2} />

          <Button
            icon="crosshairs-gps"
            loading={loading}
            onPress={getLocation}
            style={{ marginBottom: 8, marginTop: 8 }}
          >
            📍 Use My Location
          </Button>

          {location ? (
            <TextInput
              value={`📍 Location: ${lat}, ${lng} (from GPS)`}
              editable={false}
              style={inputStyle}
            />
          ) : (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                label="Latitude"
                value={lat}
                onChangeText={(text) =>
                  setField('location', {
                    lat: parseFloat(text) || 0,
                    lng: location?.lng || 0,
                  })
                }
                style={[inputStyle, { flex: 1 }]}
              />
              <TextInput
                label="Longitude"
                value={lng}
                onChangeText={(text) =>
                  setField('location', {
                    lat: location?.lat || 0,
                    lng: parseFloat(text) || 0,
                  })
                }
                style={[inputStyle, { flex: 1 }]}
              />
            </View>
          )}

          <TextInput
            label="Location Nickname"
            value={locationNickname}
            onChangeText={(text) => setField('locationNickname', text)}
            style={inputStyle}
          />

          {location && (
            <Image
              source={{
                uri: `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&markers=color:green|${lat},${lng}`,
              }}
              style={{ height: 150, borderRadius: 8 }}
            />
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
            <Button mode="outlined" onPress={() => router.back()}>
              Back
            </Button>
            <Button mode="contained" onPress={() => router.push('/add-plant/step4')}>
              Next
            </Button>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
