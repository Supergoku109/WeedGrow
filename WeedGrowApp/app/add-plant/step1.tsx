import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Text,
  Menu,
} from 'react-native-paper';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';

export default function Step1() {
  const router = useRouter();
  const { name, strain, growthStage, setField } = usePlantForm();

  const isValid = name.trim().length > 0;
  const [strainMenu, setStrainMenu] = React.useState(false);

  const inputStyle = {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  } as const;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
          <StepIndicatorBar currentPosition={0} />
          <Text variant="titleLarge">🌱 Let’s start with the basics</Text>

          <TextInput
            label="Plant Name"
            value={name}
            onChangeText={(text) => setField('name', text)}
            style={inputStyle}
          />

          <Menu
            visible={strainMenu}
            onDismiss={() => setStrainMenu(false)}
            anchor={
              <TextInput
                label="Strain"
                value={strain}
                onChangeText={(text) => setField('strain', text)}
                style={inputStyle}
                right={
                  <TextInput.Icon
                    icon="menu-down"
                    onPress={() => setStrainMenu(true)}
                  />
                }
              />
            }
          >
            {['Unknown', 'Sativa', 'Indica', 'Hybrid'].map((opt) => (
              <Menu.Item
                key={opt}
                onPress={() => {
                  setField('strain', opt);
                  setStrainMenu(false);
                }}
                title={opt}
              />
            ))}
          </Menu>

          <SegmentedButtons
            value={growthStage}
            onValueChange={(val) => setField('growthStage', val as any)}
            buttons={[
              { value: 'germination', label: 'Germination' },
              { value: 'seedling', label: 'Seedling' },
              { value: 'vegetative', label: 'Vegetative' },
              { value: 'flowering', label: 'Flowering' },
            ]}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
            <Button mode="outlined" onPress={() => router.back()}>
              Back
            </Button>
            <Button
              mode="contained"
              disabled={!isValid}
              onPress={() => router.push('/add-plant/step2')}
            >
              Next
            </Button>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
