import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { ThemedText } from '@/ui/ThemedText';
import { WeedGrowCard } from '@/ui/WeedGrowCard';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';
import { WeedGrowButtonRow } from '@/ui/WeedGrowButtonRow';
import { AnimatedMakikoInput } from '@/components/ui/AnimatedMakikoInput';
import { AnimatedMakikoDropdownInput } from '@/components/ui/AnimatedMakikoDropdownInput';
import { WeedGrowCardBackground } from '@/components/ui/WeedGrowCardBackground';
import HomeBackground from '@/features/home/components/HomeBackground';
import { ScreenLayout } from '@/features/addPlant/components/ScreenLayout';
import { getAvailableStrains } from '@/features/addPlant/api/basicInfoApi';
import { potSizeOptions, sunlightOptions } from '@/features/addPlant/api/environmentApi';
import LoadingView from '../components/LoadingView';
import NotFoundView from '../components/NotFoundView';
import { usePlant } from '../hooks/usePlant';
import { deletePlantAndSubcollections, updatePlant } from '../api/plantService';
import logger from '@/lib/logger';
import type { Plant } from '@/firestoreModels';

type EditPlantFormState = {
  name: string;
  height: string;
  strain: string;
  potSize: string;
  growthStage: string;
  environment: string;
  sunlightExposure: string;
  lat: string;
  lng: string;
};

type EditPlantFormErrors = {
  name?: string;
  height?: string;
  lat?: string;
  lng?: string;
  location?: string;
};

const STAGE_OPTIONS = [
  { label: 'Germination', value: 'germination' },
  { label: 'Seedling', value: 'seedling' },
  { label: 'Vegetative', value: 'vegetative' },
  { label: 'Flowering', value: 'flowering' },
];

const ENVIRONMENT_OPTIONS = [
  { label: 'Outdoor', value: 'outdoor' },
  { label: 'Greenhouse', value: 'greenhouse' },
  { label: 'Indoor', value: 'indoor' },
];

const emptyFormState: EditPlantFormState = {
  name: '',
  height: '',
  strain: '',
  potSize: '',
  growthStage: '',
  environment: '',
  sunlightExposure: '',
  lat: '',
  lng: '',
};

export default function EditPlantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plant, loading } = usePlant(id);
  const [form, setForm] = React.useState<EditPlantFormState>(emptyFormState);
  const [errors, setErrors] = React.useState<EditPlantFormErrors>({});
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const didHydrate = React.useRef(false);

  React.useEffect(() => {
    if (!plant || didHydrate.current) return;
    setForm({
      name: plant.name ?? '',
      height: typeof plant.height === 'number' ? String(plant.height) : '',
      strain: plant.strain ?? '',
      potSize: plant.potSize ?? '',
      growthStage: plant.growthStage ?? '',
      environment: plant.environment ?? '',
      sunlightExposure: plant.sunlightExposure ?? '',
      lat: typeof plant.location?.lat === 'number' ? String(plant.location.lat) : '',
      lng: typeof plant.location?.lng === 'number' ? String(plant.location.lng) : '',
    });
    didHydrate.current = true;
  }, [plant]);

  const setField = React.useCallback(<K extends keyof EditPlantFormState>(key: K, value: EditPlantFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      if (key === 'name') delete next.name;
      if (key === 'height') delete next.height;
      if (key === 'lat') {
        delete next.lat;
        delete next.location;
      }
      if (key === 'lng') {
        delete next.lng;
        delete next.location;
      }
      return next;
    });
  }, []);

  const validate = React.useCallback(() => {
    const nextErrors: EditPlantFormErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (form.height.trim() && Number.isNaN(Number(form.height))) {
      nextErrors.height = 'Height must be a number.';
    }

    const latFilled = form.lat.trim().length > 0;
    const lngFilled = form.lng.trim().length > 0;
    if (latFilled || lngFilled) {
      if (!latFilled || !lngFilled) {
        nextErrors.location = 'Enter both latitude and longitude.';
      } else {
        if (Number.isNaN(Number(form.lat))) nextErrors.lat = 'Latitude must be a number.';
        if (Number.isNaN(Number(form.lng))) nextErrors.lng = 'Longitude must be a number.';
      }
    }

    setErrors(nextErrors);
    return nextErrors;
  }, [form]);

  const buildUpdates = React.useCallback((current: Plant) => {
    const updates: Partial<Plant> = {};

    const trimmedName = form.name.trim();
    if (trimmedName && trimmedName !== current.name) updates.name = trimmedName;

    const nextHeight = form.height.trim() ? Number(form.height) : null;
    const currentHeight = typeof current.height === 'number' ? current.height : null;
    if (currentHeight !== nextHeight) updates.height = nextHeight as any;

    const nextStrain = form.strain.trim();
    if ((current.strain ?? '') !== nextStrain) updates.strain = nextStrain;

    const nextPotSize = form.potSize.trim() || null;
    if ((current.potSize ?? null) !== nextPotSize) updates.potSize = nextPotSize as any;

    const nextStage = form.growthStage;
    if (nextStage && nextStage !== current.growthStage) updates.growthStage = nextStage as any;

    const nextEnvironment = form.environment;
    if (nextEnvironment && nextEnvironment !== current.environment) updates.environment = nextEnvironment as any;

    const nextSunlight = form.sunlightExposure.trim() || null;
    if ((current.sunlightExposure ?? null) !== nextSunlight) {
      updates.sunlightExposure = nextSunlight as any;
    }

    const latFilled = form.lat.trim().length > 0;
    const lngFilled = form.lng.trim().length > 0;
    let nextLocation: Plant['location'] | null = null;
    if (latFilled && lngFilled) {
      nextLocation = { lat: Number(form.lat), lng: Number(form.lng) };
    }
    const currentLocation = current.location ?? null;
    const locationChanged =
      (!currentLocation && nextLocation) ||
      (currentLocation && !nextLocation) ||
      (currentLocation &&
        nextLocation &&
        (currentLocation.lat !== nextLocation.lat || currentLocation.lng !== nextLocation.lng));
    if (locationChanged) updates.location = nextLocation as any;

    return updates;
  }, [form]);

  const handleSave = React.useCallback(async () => {
    if (!plant || !id || saving || loading) return;
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    const updates = buildUpdates(plant);
    if (Object.keys(updates).length === 0) {
      router.back();
      return;
    }

    try {
      setSaving(true);
      await updatePlant(String(id), updates);
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save changes.';
      Alert.alert('Save failed', message);
      logger.error('Error saving plant edits', error);
    } finally {
      setSaving(false);
    }
  }, [plant, id, saving, loading, validate, buildUpdates, router]);

  const handleDelete = React.useCallback(() => {
    if (!id || deleting) return;
    Alert.alert('Delete Plant?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await deletePlantAndSubcollections(String(id));
            router.replace('/(tabs)?tabIndex=1');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete plant.';
            Alert.alert('Delete failed', message);
            logger.error('Error deleting plant', error);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }, [id, deleting, router]);

  if (loading) return <LoadingView />;
  if (!plant) return <NotFoundView />;

  const saveDisabled = loading || saving;

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', position: 'relative' }}>
      <HomeBackground />
      <ScreenLayout backgroundColor="transparent" horizontalPadding={0}>
        <WeedGrowCard style={styles.card}>
          <WeedGrowCardBackground>
            <View style={styles.content}>
              <ThemedText type="title" style={styles.title}>
                Edit Plant
              </ThemedText>

              <WeedGrowFormSection label="Basics" style={styles.section} labelStyle={styles.sectionLabel} spacing={16}>
                <AnimatedMakikoInput
                  label="Plant Name"
                  iconClass={FontAwesomeIcon}
                  iconName="leaf"
                  iconColor="#4caf50"
                  value={form.name}
                  onChangeText={(val) => setField('name', val)}
                  inputStyle={styles.input}
                />
                {errors.name ? <ThemedText style={styles.errorText}>{errors.name}</ThemedText> : null}

                <AnimatedMakikoInput
                  label="Height"
                  iconClass={MaterialCommunityIcons}
                  iconName="ruler"
                  iconColor="#4caf50"
                  value={form.height}
                  onChangeText={(val) => setField('height', val)}
                  keyboardType="numeric"
                  inputStyle={styles.input}
                />
                {errors.height ? <ThemedText style={styles.errorText}>{errors.height}</ThemedText> : null}

                <AnimatedMakikoDropdownInput
                  label="Strain"
                  iconName="dna"
                  iconClass={MaterialCommunityIcons}
                  iconColor="#4caf50"
                  value={form.strain}
                  options={getAvailableStrains().map((opt) => ({ label: opt, value: opt }))}
                  onSelect={(val) => setField('strain', val)}
                  placeholder="Select strain"
                />
              </WeedGrowFormSection>

              <WeedGrowFormSection label="Setup" style={styles.section} labelStyle={styles.sectionLabel} spacing={16}>
                <AnimatedMakikoDropdownInput
                  label="Stage"
                  iconName="sprout"
                  iconClass={MaterialCommunityIcons}
                  iconColor="#4caf50"
                  value={form.growthStage}
                  options={STAGE_OPTIONS}
                  onSelect={(val) => setField('growthStage', val)}
                  placeholder="Select stage"
                />
                <AnimatedMakikoDropdownInput
                  label="Environment"
                  iconName="weather-partly-cloudy"
                  iconClass={MaterialCommunityIcons}
                  iconColor="#4caf50"
                  value={form.environment}
                  options={ENVIRONMENT_OPTIONS}
                  onSelect={(val) => setField('environment', val)}
                  placeholder="Select environment"
                />
                <AnimatedMakikoDropdownInput
                  label="Pot Size"
                  iconName="flower-pot"
                  iconClass={MaterialCommunityIcons}
                  iconColor="#4caf50"
                  value={form.potSize}
                  options={potSizeOptions.map((opt) => ({ label: opt, value: opt }))}
                  onSelect={(val) => setField('potSize', val)}
                  placeholder="Select pot size"
                />
                <AnimatedMakikoDropdownInput
                  label="Sunlight Exposure"
                  iconName="white-balance-sunny"
                  iconClass={MaterialCommunityIcons}
                  iconColor="#4caf50"
                  value={form.sunlightExposure}
                  options={sunlightOptions.map((opt) => ({ label: opt.label, value: opt.value }))}
                  onSelect={(val) => setField('sunlightExposure', val)}
                  placeholder="Select sunlight"
                />
              </WeedGrowFormSection>

              <WeedGrowFormSection label="Location" style={styles.section} labelStyle={styles.sectionLabel} spacing={16}>
                <View style={styles.locationRow}>
                  <View style={styles.locationField}>
                    <AnimatedMakikoInput
                      label="Latitude"
                      iconClass={MaterialCommunityIcons}
                      iconName="map-marker"
                      iconColor="#4caf50"
                      value={form.lat}
                      onChangeText={(val) => setField('lat', val)}
                      keyboardType="numeric"
                      inputStyle={styles.input}
                      style={styles.inlineInput}
                    />
                    {errors.lat ? <ThemedText style={styles.errorText}>{errors.lat}</ThemedText> : null}
                  </View>
                  <View style={styles.locationField}>
                    <AnimatedMakikoInput
                      label="Longitude"
                      iconClass={MaterialCommunityIcons}
                      iconName="map-marker-outline"
                      iconColor="#4caf50"
                      value={form.lng}
                      onChangeText={(val) => setField('lng', val)}
                      keyboardType="numeric"
                      inputStyle={styles.input}
                      style={styles.inlineInput}
                    />
                    {errors.lng ? <ThemedText style={styles.errorText}>{errors.lng}</ThemedText> : null}
                  </View>
                </View>
                {errors.location ? <ThemedText style={styles.errorText}>{errors.location}</ThemedText> : null}
              </WeedGrowFormSection>

              <WeedGrowButtonRow style={styles.buttonRow}>
                <Button mode="outlined" onPress={() => router.back()} style={styles.button}>
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.button}
                  loading={saving}
                  disabled={saveDisabled}
                >
                  Save Changes
                </Button>
              </WeedGrowButtonRow>

              <View style={styles.deleteRow}>
                <Button
                  mode="contained"
                  onPress={handleDelete}
                  buttonColor="#b9504b"
                  textColor="#ffffff"
                  loading={deleting}
                  disabled={deleting}
                >
                  Delete Plant
                </Button>
              </View>
            </View>
          </WeedGrowCardBackground>
        </WeedGrowCard>
      </ScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    alignItems: 'stretch',
    overflow: 'hidden',
    padding: 0,
    borderRadius: 0,
  },
  content: {
    padding: 16,
    gap: 16,
    position: 'relative',
    zIndex: 1,
  },
  section: {
    marginTop: 0,
  },
  sectionLabel: {
    marginBottom: 28,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    paddingLeft: 45,
    height: 48,
    textAlignVertical: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    marginTop: -8,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationField: {
    flex: 1,
  },
  inlineInput: {
    marginBottom: 0,
  },
  buttonRow: {
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  deleteRow: {
    marginTop: 4,
    alignItems: 'center',
  },
});
