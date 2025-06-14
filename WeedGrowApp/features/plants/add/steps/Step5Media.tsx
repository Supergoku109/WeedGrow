// /features/addPlant/screens/Step5Screen.tsx

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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Snackbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/ui/ThemedText';
import StepIndicatorBar from '@/ui/StepIndicatorBar';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { useWeedGrowInputStyle } from '@/ui/WeedGrowInputStyle';
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

export default function Step5Screen({ form, setField, next, back }: AddPlantStepProps) {
  const router = useRouter();
  const [snackVisible, setSnackVisible] = React.useState(false);
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  const { inputStyle } = useWeedGrowInputStyle();

  const pickImage = async (fromCamera: boolean) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      setField('imageUri', result.assets[0].uri);
      setSnackVisible(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: 8 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <StepIndicatorBar currentPosition={4} />
            <WeedGrowCard entering={FadeIn.duration(500)}>
              <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 10, fontSize: 22, color: Colors[theme].tint }}>
                📝 Final Touches
              </ThemedText>
              <ThemedText style={{ textAlign: 'center', color: Colors[theme].label, marginBottom: 22, fontSize: 15 }}>
                Add a photo and any final notes for your plant.
              </ThemedText>

              <WeedGrowFormSection label="Photo">
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18, justifyContent: 'center' }}>
                  <Button mode="outlined" icon="camera" onPress={() => pickImage(true)}>
                    Take Photo
                  </Button>
                  <Button mode="outlined" icon="image" onPress={() => pickImage(false)}>
                    Choose from Gallery
                  </Button>
                </View>
                {form.imageUri && (
                  <Image
                    source={{ uri: form.imageUri }}
                    style={{ height: 200, width: '100%', borderRadius: 16, marginBottom: 18, borderWidth: 2, borderColor: Colors[theme].tint }}
                    resizeMode="cover"
                  />
                )}
              </WeedGrowFormSection>

              <WeedGrowFormSection label="Notes" style={{ marginTop: 12 }}>
                <WeedGrowTextInput
                  label="Observations (optional)"
                  value={form.notes}
                  onChangeText={(text: string) => setField('notes', text)}
                  multiline
                  placeholder="Add any observations here..."
                  icon="note-text"
                  style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]}
                />
              </WeedGrowFormSection>

              <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)}>
                Photo selected
              </Snackbar>

              <WeedGrowButtonRow>
                <Button mode="outlined" onPress={back} style={{ flex: 1 }}>
                  Back
                </Button>
                <Button mode="contained" onPress={next} style={{ flex: 1 }}>
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
