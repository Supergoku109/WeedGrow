import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PlantSelection } from '../components/PlantSelection';
import HomeBackground from '@/features/home/components/HomeBackground';
import { AnimatedMakikoInput } from '@/components/ui/AnimatedMakikoInput';
import { ThemedText } from '@/ui/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddGroup } from '../hooks/useAddGroup';
import { useRouter } from 'expo-router';

export default function AddGroupScreen() {
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  const router = useRouter();
  const {
    plants,
    loading,
    error,
    selectedPlantIds,
    setSelectedPlantIds,
    groupLocationPlantId,
    setGroupLocationPlantId,
    groupName,
    setGroupName,
    submitting,
    handleTogglePlant,
    handleCreateGroup,
  } = useAddGroup();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <HomeBackground />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 16 }}>
          Create Group
        </ThemedText>
        <AnimatedMakikoInput
          label="Group Name"
          iconName="users"
          iconClass={require('react-native-vector-icons/Feather').default}
          value={groupName}
          onChangeText={setGroupName}
        />
        {loading && <Button loading>Loading Plants...</Button>}
        {error && <Button>{error}</Button>}
        <PlantSelection
          plants={plants}
          selectedPlantIds={selectedPlantIds}
          onTogglePlant={handleTogglePlant}
          groupLocationPlantId={groupLocationPlantId}
          onSelectGroupLocationPlantId={setGroupLocationPlantId}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
          <Button
            onPress={() => router.replace('/')}
            mode="outlined"
            style={{ flex: 1, marginRight: 8 }}
          >
            Back
          </Button>
          <Button
            onPress={handleCreateGroup}
            mode="contained"
            style={{ flex: 1 }}
            loading={submitting}
            disabled={submitting}
          >
            Next
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
