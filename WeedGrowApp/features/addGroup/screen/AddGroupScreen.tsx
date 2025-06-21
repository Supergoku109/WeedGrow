import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePlants } from '../hooks/usePlants';
import { PlantSelection } from '../components/PlantSelection';
import HomeBackground from '@/features/home/components/HomeBackground';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { ThemedText } from '@/ui/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddGroupScreen() {
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  const router = useRouter();

  const { plants, loading, error } = usePlants();
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  const handleTogglePlant = (id: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors[theme].background }}
    >
      <HomeBackground />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ThemedText
          type="title"
          style={{ textAlign: 'center', marginBottom: 16 }}
        >
          Create Group
        </ThemedText>
        <WeedGrowTextInput
          label="Group Name"
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Enter group name"
        />
        {loading && <Button loading>Loading Plants...</Button>}
        {error && <Button>{error}</Button>}
        <PlantSelection
          plants={plants}
          selectedPlantIds={selectedPlantIds}
          onTogglePlant={handleTogglePlant}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 16,
          }}
        >
          <Button
            onPress={() => router.back()}
            mode="outlined"
            style={{ flex: 1, marginRight: 8 }}
          >
            Back
          </Button>
          <Button
            onPress={() => console.log('Next button pressed')}
            mode="contained"
            style={{ flex: 1 }}
          >
            Next
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
