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
  Text,
  Menu,
  RadioButton,
} from 'react-native-paper';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';

export default function Step1() {
  const router = useRouter();
  const { name, strain, growthStage, setField } = usePlantForm();

  const isValid = name.trim().length > 0;
  const [strainMenu, setStrainMenu] = React.useState(false);
  const [strainSearch, setStrainSearch] = React.useState('');
  const strains = ['Sativa', 'Indica', 'Hybrid'];

  const inputStyle = {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  } as const;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
          <StepIndicatorBar currentPosition={0} />
          <Text variant="titleLarge" style={{ textAlign: 'center', marginTop: 8 }}>
            🌱 Let’s start with the basics
          </Text>

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
                value={strain || 'Unknown'}
                editable={false}
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
            <TextInput
              placeholder="Search..."
              value={strainSearch}
              onChangeText={setStrainSearch}
              style={{ margin: 8 }}
            />
            {["Unknown", ...strains.filter((s) =>
              s.toLowerCase().includes(strainSearch.toLowerCase())
            )].map((opt) => (
              <Menu.Item
                key={opt}
                onPress={() => {
                  setField('strain', opt);
                  setStrainMenu(false);
                  setStrainSearch('');
                }}
                title={opt}
              />
            ))}
          </Menu>

          <RadioButton.Group
            onValueChange={(val) => setField('growthStage', val as any)}
            value={growthStage}
          >
            <RadioButton.Item label="Germination" value="germination" position="leading" />
            <RadioButton.Item label="Seedling" value="seedling" position="leading" />
            <RadioButton.Item label="Vegetative" value="vegetative" position="leading" />
            <RadioButton.Item label="Flowering" value="flowering" position="leading" />
          </RadioButton.Group>

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
