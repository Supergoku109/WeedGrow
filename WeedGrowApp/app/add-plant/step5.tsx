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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/ui/ThemedText';
import StepIndicatorBar from '@/ui/StepIndicatorBar';
import { usePlantForm } from '@/features/plants/hooks/usePlantForm';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { useWeedGrowInputStyle } from '@/ui/WeedGrowInputStyle';

export default function Step5() {
  const router = useRouter();
  const { notes, imageUri, setField } = usePlantForm();
  const [snackVisible, setSnackVisible] = React.useState(false);
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  const insets = useSafeAreaInsets();

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 0 }}>
            <StepIndicatorBar currentPosition={4} />
            <ThemedText style={{ alignSelf: 'center', color: Colors[theme].tint, fontWeight: '600', marginBottom: 2, letterSpacing: 1, fontSize: 13 }}>
              Step 5 of 5
            </ThemedText>
            <View
              style={{
                backgroundColor: theme === 'dark' ? '#1a2e22' : '#f3f4f6',
                borderRadius: 20,
                paddingVertical: 28,
                paddingHorizontal: 18,
                marginTop: 16,
                marginBottom: 24,
                shadowColor: '#000',
                shadowOpacity: 0.16,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                elevation: 6,
                borderWidth: 1,
                borderColor: theme === 'dark' ? '#223c2b' : '#e0e0e0',
                alignItems: 'center',
                width: '100%', // Ensure card takes full width of ScrollView
                alignSelf: 'center',
                maxWidth: 480, // Prevent card from being too wide on tablets
              }}
            >
              <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 10, fontSize: 22, color: Colors[theme].tint }}>
                📝 Final Touches
              </ThemedText>
              <ThemedText style={{ textAlign: 'center', color: Colors[theme].label, marginBottom: 22, fontSize: 15 }}>
                Add a photo and any final notes for your plant.
              </ThemedText>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18, justifyContent: 'center', width: '100%' }}>
                <Button mode="outlined" icon="camera" onPress={() => pickImage(true)} style={{ flex: 1, borderRadius: 8, borderColor: Colors[theme].tint, borderWidth: 1 }}>
                  Take Photo
                </Button>
                <Button mode="outlined" icon="image" onPress={() => pickImage(false)} style={{ flex: 1, borderRadius: 8, borderColor: Colors[theme].tint, borderWidth: 1 }}>
                  Choose from Gallery
                </Button>
              </View>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{ height: 200, width: '100%', maxWidth: 320, borderRadius: 16, marginBottom: 18, borderWidth: 2, borderColor: Colors[theme].tint, alignSelf: 'center' }}
                  resizeMode="cover"
                />
              ) : null}
              <WeedGrowTextInput
                label="Observations (optional)"
                value={notes}
                onChangeText={(text: string) => setField('notes', text)}
                multiline
                placeholder="Add any observations here..."
                icon="note-text"
                style={[
                  inputStyle,
                  {
                    minHeight: 100,
                    maxHeight: 160,
                    marginBottom: 8,
                    width: '100%',
                    borderRadius: 12,
                    paddingTop: 16,
                    paddingBottom: 16,
                  },
                ]}
                textAlignVertical="top"
              />
              <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)}>
                Photo selected
              </Snackbar>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32, gap: 16, width: '100%' }}>
                <Button
                  mode="outlined"
                  onPress={() => router.back()}
                  style={{ borderRadius: 8, minWidth: 120, borderColor: Colors[theme].tint, borderWidth: 1, flex: 1, marginRight: 4 }}
                  labelStyle={{ fontWeight: '600' }}
                  contentStyle={{ height: 48 }}
                >
                  Back
                </Button>
                <Button
                  mode="contained"
                  onPress={() => router.push('/add-plant/review')}
                  style={{ borderRadius: 8, minWidth: 120, backgroundColor: Colors[theme].tint, elevation: 2, flex: 1, marginLeft: 4 }}
                  labelStyle={{ fontWeight: '700', letterSpacing: 1 }}
                  contentStyle={{ height: 48 }}
                >
                  Next
                </Button>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
