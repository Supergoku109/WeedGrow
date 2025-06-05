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
import { TextInput, Button, Snackbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';

export default function Step5() {
  const router = useRouter();
  const { notes, imageUri, setField } = usePlantForm();
  const [snackVisible, setSnackVisible] = React.useState(false);

  const inputStyle = {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  } as const;

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
          <StepIndicatorBar currentPosition={4} />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button mode="outlined" icon="camera" onPress={() => pickImage(true)}>
              Take Photo
            </Button>
            <Button mode="outlined" icon="image" onPress={() => pickImage(false)}>
              Choose from Gallery
            </Button>
          </View>

          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ height: 200, width: 200, borderRadius: 8 }}
              resizeMode="cover"
            />
          ) : null}

          <TextInput
            label="Observations (optional)"
            value={notes}
            onChangeText={(text) => setField('notes', text)}
            multiline
            placeholder="Add any observations here..."
            style={[inputStyle, { height: 120 }]}
          />

          <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)}>
            Photo selected
          </Snackbar>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
            <Button mode="outlined" onPress={() => router.back()}>
              Back
            </Button>
            <Button mode="contained" onPress={() => router.push('/add-plant/review')}>
              Next
            </Button>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
