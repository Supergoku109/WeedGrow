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
          <StepIndicatorBar currentPosition={1} />

          <SegmentedButtons
            value={environment}
            onValueChange={(val) => setField('environment', val as any)}
            buttons={[
              { value: 'outdoor', label: 'Outdoor' },
              { value: 'greenhouse', label: 'Greenhouse' },
              { value: 'indoor', label: 'Indoor' },
            ]}
          />

          <SegmentedButtons
            value={plantedIn}
            onValueChange={(val) => setField('plantedIn', val as any)}
            buttons={[
              { value: 'pot', label: 'Pot' },
              { value: 'ground', label: 'Ground' },
            ]}
          />

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
            {[
              'Full Sun (6–8+ hrs)',
              'Partial Sun (3–6 hrs)',
              'Mostly Shade (0–3 hrs)',
              'Not Sure',
            ].map((opt) => (
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
