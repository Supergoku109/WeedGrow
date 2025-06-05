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
  Menu,
} from 'react-native-paper';
import { useRouter } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';

export default function Step2() {
  const router = useRouter();
  const { environment, potSize, sunlightExposure, plantedIn, setField } = usePlantForm();

  const [potMenu, setPotMenu] = React.useState(false);
  const [sunMenu, setSunMenu] = React.useState(false);

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
          <StepIndicatorBar currentPosition={1} />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['outdoor', 'greenhouse', 'indoor'].map((opt) => (
              <Button
                key={opt}
                mode={environment === opt ? 'contained' : 'outlined'}
                onPress={() => setField('environment', opt as any)}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Button>
            ))}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['pot', 'ground'].map((opt) => (
              <Button
                key={opt}
                mode={plantedIn === opt ? 'contained' : 'outlined'}
                onPress={() => setField('plantedIn', opt as any)}
              >
                {opt === 'pot' ? 'Pot' : 'Ground'}
              </Button>
            ))}
          </View>

          {plantedIn === 'pot' && (
            <Menu
              visible={potMenu}
              onDismiss={() => setPotMenu(false)}
              anchor={
                <TextInput
                  label="Pot Size"
                  value={potSize}
                  style={inputStyle}
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" onPress={() => setPotMenu(true)} />}
                />
              }
            >
              {['1L', '5L', '10L', '20L', '50L'].map((size) => (
                <Menu.Item
                  key={size}
                  onPress={() => {
                    setField('potSize', size);
                    setPotMenu(false);
                  }}
                  title={size}
                />
              ))}
            </Menu>
          )}

          <Menu
            visible={sunMenu}
            onDismiss={() => setSunMenu(false)}
            anchor={
              <TextInput
                label="Sunlight Exposure"
                value={sunlightExposure}
                style={inputStyle}
                editable={false}
                right={<TextInput.Icon icon="menu-down" onPress={() => setSunMenu(true)} />}
              />
            }
          >
            {['Full Sun', 'Partial Sun', 'Mostly Shade', 'Not Sure'].map((opt) => (
              <Menu.Item
                key={opt}
                onPress={() => {
                  setField('sunlightExposure', opt);
                  setSunMenu(false);
                }}
                title={opt}
              />
            ))}
          </Menu>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
            <Button mode="outlined" onPress={() => router.back()}>
              Back
            </Button>
            <Button mode="contained" onPress={() => router.push('/add-plant/step3')}>
              Next
            </Button>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
