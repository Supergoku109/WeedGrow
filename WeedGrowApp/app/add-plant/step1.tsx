import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  Text,
  Menu,
  SegmentedButtons,
  TextInput,
} from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import StepIndicatorBar from '@/ui/StepIndicatorBar';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import { usePlantForm } from '@/features/plants/hooks/usePlantForm';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useWeedGrowInputStyle } from '@/ui/WeedGrowInputStyle';
import { WeedGrowTextInput } from '@/ui/WeedGrowTextInput';
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';

export default function Step1() {
  const router = useRouter();
  const { name, strain, growthStage, ageDays, setField } = usePlantForm();
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;
  const insets = useSafeAreaInsets();
  const validateAgeDays = (growthStage: string, ageDays: string): boolean => {
    if (growthStage === 'vegetative' || growthStage === 'flowering') {
      return ageDays.trim().length > 0;
    }
    return true;
  };

  const isValid = name.trim().length > 0 && validateAgeDays(growthStage, ageDays);
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

  const { inputStyle, menuInputStyle, menuContentStyle, iconStyle } = useWeedGrowInputStyle();

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
            <WeedGrowCard entering={FadeIn.duration(500)} style={{ alignItems: 'stretch', marginTop: 8 }}>
              <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 8, fontSize: 24 }}>
                🌱 Let’s start with the basics
              </ThemedText>
              <ThemedText style={{ textAlign: 'center', color: Colors[theme].tint, marginBottom: 18, fontSize: 15 }}>
                Give your plant a name, pick a strain, and select its current growth stage.
              </ThemedText>

              <WeedGrowFormSection label="Plant Details">
                <WeedGrowTextInput
                  label="Plant Name"
                  value={name}
                  onChangeText={(text: string) => setField('name', text)}
                  icon="sprout"
                />
                <Menu
                  visible={strainMenu}
                  onDismiss={() => setStrainMenu(false)}
                  anchor={
                    <WeedGrowTextInput
                      label="Strain"
                      value={strain || 'Unknown'}
                      editable={false}
                      right={<TextInput.Icon icon="menu-down" size={24} onPress={() => setStrainMenu(true)} style={iconStyle} />}
                      icon="dna"
                    />
                  }
                >
                  <TextInput
                    placeholder="Search..."
                    value={strainSearch}
                    onChangeText={(text: string) => setStrainSearch(text)}
                    style={{ margin: 8 }}
                  />
                  {['Unknown', ...strains.filter((s) =>
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
              </WeedGrowFormSection>

              <WeedGrowFormSection label="Growth Stage" style={{ marginTop: 12 }}>
                <SegmentedButtons
                  value={growthStage}
                  onValueChange={(val) => {
                    setField('growthStage', val as any);
                    if (val === 'germination' || val === 'seedling') {
                      setField('ageDays', '0');
                    }
                  }}
                  buttons={[
                    { value: 'germination', label: 'Germination', icon: 'seed' },
                    { value: 'seedling', label: 'Seedling', icon: 'leaf' },
                    { value: 'vegetative', label: 'Vegetative', icon: 'tree' },
                    { value: 'flowering', label: 'Flowering', icon: 'flower' },
                  ]}
                  style={{ borderRadius: 10, backgroundColor: Colors[theme].background, borderWidth: 0 }}
                />
              </WeedGrowFormSection>

              {(growthStage === 'vegetative' || growthStage === 'flowering') && (
                <WeedGrowFormSection label="Age" style={{ marginTop: 12 }}>
                  <WeedGrowTextInput
                    label="Age in Days"
                    value={ageDays}
                    onChangeText={(text: string) => setField('ageDays', text)}
                    keyboardType="numeric"
                    icon="calendar"
                  />
                </WeedGrowFormSection>
              )}

              <WeedGrowButtonRow>
                <Button
                  mode="outlined"
                  onPress={() => router.replace('/(tabs)/plants')}
                  style={{ borderRadius: 8, minWidth: 100, borderColor: Colors[theme].tint, borderWidth: 1, flex: 1, marginRight: 4 }}
                  labelStyle={{ fontWeight: '600' }}
                  contentStyle={{ height: 48 }}
                >
                  Back
                </Button>
                <Button
                  mode="contained"
                  disabled={!isValid}
                  onPress={() => router.push('/add-plant/step2')}
                  style={{ borderRadius: 8, minWidth: 100, backgroundColor: isValid ? Colors[theme].tint : '#3a4d3f', elevation: 2, flex: 1, marginLeft: 4 }}
                  labelStyle={{ fontWeight: '700', letterSpacing: 1 }}
                  contentStyle={{ height: 48 }}
                >
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
