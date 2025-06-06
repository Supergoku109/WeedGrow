import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TextInput,
  Button,
  Text,
  Menu,
  SegmentedButtons,
} from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { useRouter, useFocusEffect } from 'expo-router';

import StepIndicatorBar from '@/components/StepIndicatorBar';
import { usePlantForm } from '@/stores/usePlantForm';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Step1() {
  const router = useRouter();
  const { name, strain, growthStage, ageDays, setField } = usePlantForm();
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;
  const insets = useSafeAreaInsets();
  const isValid =
    name.trim().length > 0 &&
    ((growthStage === 'vegetative' || growthStage === 'flowering')
      ? ageDays.trim().length > 0
      : true);
  const [strainMenu, setStrainMenu] = React.useState(false);
  const [strainSearch, setStrainSearch] = React.useState('');
  const strains = ['Sativa', 'Indica', 'Hybrid'];

  useFocusEffect(
    React.useCallback(() => {
      const onBack = () => {
        router.replace('/(tabs)/plants');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBack);

      return () => subscription.remove(); // ✅ Fixed line
    }, [router])
  );

  const inputStyle = {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  } as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: 8 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}
          >
            <StepIndicatorBar currentPosition={0} />
            <ThemedText type="title" style={{ textAlign: 'center', marginTop: 8 }}>
              🌱 Let’s start with the basics
            </ThemedText>

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

            <SegmentedButtons
              value={growthStage}
              onValueChange={(val) => {
                setField('growthStage', val as any);
                if (val === 'germination' || val === 'seedling') {
                  setField('ageDays', '0');
                }
              }}
              buttons={[
                { value: 'germination', label: 'Germination' },
                { value: 'seedling', label: 'Seedling' },
                { value: 'vegetative', label: 'Vegetative' },
                { value: 'flowering', label: 'Flowering' },
              ]}
            />

            {(growthStage === 'vegetative' || growthStage === 'flowering') && (
              <TextInput
                label="Age in Days"
                value={ageDays}
                onChangeText={(text) => setField('ageDays', text)}
                style={inputStyle}
                keyboardType="numeric"
              />
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
              <Button
                mode="outlined"
                onPress={() => router.replace('/(tabs)/plants')}
              >
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
    </SafeAreaView>
  );
}
