import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TextInput,
  Button,
  Chip,
  Menu,
  Text,
} from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import StepIndicatorBar from '@/ui/StepIndicatorBar';
import { useRouter } from 'expo-router';

import { usePlantForm } from '@/features/plants/hooks/usePlantForm';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { WeedGrowDropdownInput } from '@/ui/WeedGrowDropdownInput';
import { useWeedGrowInputStyle } from '@/ui/WeedGrowInputStyle';

export default function Step4() {
  const router = useRouter();
  const { wateringFrequency, fertilizer, pests, trainingTags, setField } = usePlantForm();
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;
  const insets = useSafeAreaInsets();

  const [waterMenu, setWaterMenu] = React.useState(false);

  const pestOptions = ['Spider Mites', 'Powdery Mildew', 'Aphids'];
  const trainingOptions = ['LST', 'Topping', 'SCROG'];

  const { inputStyle } = useWeedGrowInputStyle();

  const styles = StyleSheet.create({
    sectionTitle: { fontWeight: 'bold', marginTop: 16, marginBottom: 8, fontSize: 16 },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: 8 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{ flex: 1 }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 32,
              gap: 16,
              flexGrow: 1,
              justifyContent: 'flex-start',
              minHeight: '100%', // Ensures scroll area always at least fills the screen
            }}
          >
            <StepIndicatorBar currentPosition={3} />
            <ThemedText style={{ alignSelf: 'center', color: Colors[theme].tint, fontWeight: '600', marginBottom: 2, letterSpacing: 1, fontSize: 13 }}>
              Step 4 of 5
            </ThemedText>
            <View
              style={{
                backgroundColor: theme === 'dark' ? '#1a2e22' : '#f3f4f6',
                borderRadius: 20,
                padding: 22,
                marginTop: 8,
                shadowColor: '#000',
                shadowOpacity: 0.16,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                elevation: 6,
                borderWidth: 1,
                borderColor: theme === 'dark' ? '#223c2b' : '#e0e0e0',
              }}
            >
              <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 8, fontSize: 22, color: Colors[theme].tint }}>
                💧 Care Details
              </ThemedText>
              <ThemedText style={{ textAlign: 'center', color: Colors[theme].label, marginBottom: 18, fontSize: 15 }}>
                Set your plant's watering, fertilizer, pest, and training details.
              </ThemedText>
              <WeedGrowDropdownInput
                icon="water"
                label="Watering Frequency"
                value={wateringFrequency || ''}
                options={['Every day', 'Every 2 days', 'Every 3 days', 'Weekly'].map((opt) => ({ label: opt, value: opt }))}
                onSelect={(val) => setField('wateringFrequency', val)}
                menuVisible={waterMenu}
                setMenuVisible={setWaterMenu}
                placeholder="Select frequency"
              />
              <WeedGrowTextInput
                label="Fertilizer"
                value={fertilizer}
                onChangeText={(text: string) => setField('fertilizer', text)}
                icon="leaf"
              />
              <ThemedText style={{ fontWeight: 'bold', marginTop: 16, marginBottom: 8, fontSize: 16, color: Colors[theme].label }}>
                Pest History
              </ThemedText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {pestOptions.map((p) => (
                  <Chip
                    key={p}
                    selected={pests?.includes(p)}
                    onPress={() => {
                      const arr = pests || [];
                      setField(
                        'pests',
                        arr.includes(p) ? arr.filter((x) => x !== p) : [...arr, p]
                      );
                    }}
                    style={{ backgroundColor: pests?.includes(p) ? Colors[theme].tint : '#223c2b', borderRadius: 8 }}
                    textStyle={{ color: pests?.includes(p) ? '#fff' : Colors[theme].text, fontWeight: '600' }}
                  >
                    {p}
                  </Chip>
                ))}
              </View>
              <ThemedText style={{ fontWeight: 'bold', marginTop: 16, marginBottom: 8, fontSize: 16, color: Colors[theme].label }}>
                Training Techniques
              </ThemedText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {trainingOptions.map((t) => (
                  <Chip
                    key={t}
                    selected={trainingTags?.includes(t)}
                    onPress={() => {
                      const arr = trainingTags || [];
                      setField(
                        'trainingTags',
                        arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]
                      );
                    }}
                    style={{ backgroundColor: trainingTags?.includes(t) ? Colors[theme].tint : '#223c2b', borderRadius: 8 }}
                    textStyle={{ color: trainingTags?.includes(t) ? '#fff' : Colors[theme].text, fontWeight: '600' }}
                  >
                    {t}
                  </Chip>
                ))}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
                <Button
                  mode="outlined"
                  onPress={() => router.back()}
                  style={{ borderRadius: 8, minWidth: 100, borderColor: Colors[theme].tint, borderWidth: 1 }}
                  labelStyle={{ fontWeight: '600' }}
                >
                  Back
                </Button>
                <Button
                  mode="contained"
                  onPress={() => router.push('/add-plant/step5')}
                  style={{ borderRadius: 8, minWidth: 100, backgroundColor: Colors[theme].tint, elevation: 2 }}
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
