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
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Step4() {
  const router = useRouter();
  const { wateringFrequency, fertilizer, pests, trainingTags, setField } = usePlantForm();
  const theme = useColorScheme() ?? 'dark';
  const insets = useSafeAreaInsets();

  const [waterMenu, setWaterMenu] = React.useState(false);

  const pestOptions = ['Spider Mites', 'Powdery Mildew', 'Aphids'];
  const trainingOptions = ['LST', 'Topping', 'SCROG'];

  const inputStyle = {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  } as const;

  const styles = StyleSheet.create({
    sectionTitle: { fontWeight: 'bold', marginTop: 16, marginBottom: 8, fontSize: 16 },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: 8 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}>
          <StepIndicatorBar currentPosition={3} />

          <Menu
            visible={waterMenu}
            onDismiss={() => setWaterMenu(false)}
            anchor={
              <TextInput
                label="Watering Frequency"
                value={wateringFrequency}
                style={inputStyle}
                editable={false}
                right={<TextInput.Icon icon="menu-down" onPress={() => setWaterMenu(true)} />}
              />
            }
          >
            {['Every day', 'Every 2 days', 'Every 3 days', 'Weekly'].map((opt) => (
              <Menu.Item
                key={opt}
                onPress={() => {
                  setField('wateringFrequency', opt);
                  setWaterMenu(false);
                }}
                title={opt}
              />
            ))}
          </Menu>

          <TextInput
            label="Fertilizer"
            value={fertilizer}
            onChangeText={(text) => setField('fertilizer', text)}
            style={inputStyle}
          />

          <Text style={styles.sectionTitle}>Pest History</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
              >
                {p}
              </Chip>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Training Techniques</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
              >
                {t}
              </Chip>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
            <Button mode="outlined" onPress={() => router.back()}>
              Back
            </Button>
            <Button mode="contained" onPress={() => router.push('/add-plant/step5')}>
              Next
            </Button>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}
