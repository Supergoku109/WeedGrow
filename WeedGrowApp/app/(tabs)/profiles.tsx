import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import ManageSensorProfilesScreen from '../manage-sensor-profiles';
import { FAB } from 'react-native-paper';

export default function ProfilesTabScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <ManageSensorProfilesScreen emptyMessage="No sensor profiles found. Create one to get started!" />
      <FAB
        icon="plus"
        style={{ position: 'absolute', right: 24, bottom: 24 }}
        onPress={() => router.push('/add-sensor-profile')}
        accessibilityLabel="Add Sensor Profile"
      />
    </View>
  );
}
