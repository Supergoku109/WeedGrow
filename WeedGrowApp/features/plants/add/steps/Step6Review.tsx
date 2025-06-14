// /features/addPlant/screens/ReviewScreen.tsx

import React, { useState } from 'react';
import { ScrollView, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import { useRouter } from 'expo-router';
import { FadeIn } from 'react-native-reanimated';
import StepIndicatorBar from '@/ui/StepIndicatorBar';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { savePlantToFirestore } from '../api/savePlant';
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';
import type { PlantForm } from '@/features/plants/form/PlantForm';

interface AddPlantStepProps {
  form: PlantForm;
  setField: (field: keyof PlantForm, value: any) => void;
  next?: () => void;
  back?: () => void;
}

export default function ReviewScreen({ form, setField, back }: AddPlantStepProps) {
  const router = useRouter();
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await savePlantToFirestore(form);
      router.replace('/');
    } catch (e) {
      console.error('Error saving plant:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: 8 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        <StepIndicatorBar currentPosition={5} />
        <WeedGrowCard entering={FadeIn.duration(500)}>
          <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 10, fontSize: 22, color: Colors[theme].tint }}>
            🌱 Review Your Plant
          </ThemedText>

          {form.imageUri && (
            <Image
              source={{ uri: form.imageUri }}
              style={{ height: 180, width: '100%', borderRadius: 16, marginBottom: 18, borderWidth: 2, borderColor: Colors[theme].tint }}
              resizeMode="cover"
            />
          )}

          <WeedGrowFormSection label="Summary">
            <View style={{ gap: 8 }}>
              <TextRow label="Name" value={form.name} />
              <TextRow label="Strain" value={form.strain} />
              <TextRow label="Growth Stage" value={form.growthStage} />
              <TextRow label="Environment" value={form.environment} />
            </View>
          </WeedGrowFormSection>

          <WeedGrowButtonRow>
            <Button mode="outlined" onPress={back} style={{ flex: 1 }}>
              Back
            </Button>
            <Button mode="contained" onPress={handleSave} loading={saving} style={{ flex: 1 }}>
              Save Plant
            </Button>
          </WeedGrowButtonRow>
        </WeedGrowCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function TextRow({ label, value }: { label: string; value: any }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <ThemedText style={{ fontWeight: '600' }}>{label}</ThemedText>
      <ThemedText>{value || 'Not set'}</ThemedText>
    </View>
  );
}
